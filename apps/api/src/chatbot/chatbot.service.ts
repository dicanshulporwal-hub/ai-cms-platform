import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentStatus, Lead, Prisma, SenderType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { ChatbotMessageDto } from './dto/chatbot-message.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateChatbotSettingsDto } from './dto/update-chatbot-settings.dto';
import {
  AI_PROVIDER_CLIENT,
  AiProvider,
  AiProviderResult,
} from '../ai/providers/ai-provider.interface';

interface RequestIdentity {
  ip?: string;
  userAgent?: string;
}

interface KnowledgeSource {
  id: string;
  slug: string;
  text: string;
  title: string;
  type: 'BLOG' | 'PAGE';
}

interface ScoredSource extends KnowledgeSource {
  score: number;
}

interface LeadWithConversation extends Lead {
  conversation?: { id: string } | null;
}

const PUBLIC_REQUESTS_PER_MINUTE = 30;
const PUBLIC_RATE_WINDOW_MS = 60_000;
const MAX_CONTEXT_CHARS = 6000;
const DEFAULT_SETTINGS_ID = 'default_chatbot_settings';
const STOP_WORDS = new Set([
  'about',
  'after',
  'also',
  'and',
  'are',
  'can',
  'for',
  'from',
  'how',
  'into',
  'our',
  'the',
  'their',
  'this',
  'what',
  'when',
  'where',
  'with',
  'you',
  'your',
]);

@Injectable()
export class ChatbotService {
  private readonly publicRateLimits = new Map<
    string,
    { count: number; startedAt: number }
  >();

  constructor(
    @Inject(AI_PROVIDER_CLIENT) private readonly aiProvider: AiProvider,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleMessage(dto: ChatbotMessageDto, identity: RequestIdentity) {
    this.enforcePublicRateLimit(`message:${identity.ip ?? 'unknown'}`);

    const settings = await this.getOrCreateSettings();

    if (!settings.isEnabled) {
      throw new HttpException('Chatbot is disabled.', HttpStatus.SERVICE_UNAVAILABLE);
    }

    const visitorMessage = this.sanitize(dto.message);

    if (!visitorMessage) {
      throw new BadRequestException('Message cannot be empty.');
    }

    const conversation = await this.getOrCreateConversation(dto, identity);

    await this.prisma.chatbotMessage.create({
      data: {
        content: visitorMessage,
        conversationId: conversation.id,
        metadata: {
          sourcePage: dto.sourcePage ?? null,
          userAgent: identity.userAgent ?? null,
        },
        senderType: SenderType.VISITOR,
      },
    });

    const relevantSources = await this.retrieveRelevantSources(visitorMessage);
    const sources = relevantSources.slice(0, 3).map(({ id, slug, title, type }) => ({
      id,
      slug,
      title,
      type,
    }));

    const answer = relevantSources.length
      ? await this.generateAnswer(visitorMessage, relevantSources, settings.fallbackMessage)
      : settings.fallbackMessage;
    const leadCaptureSuggested =
      settings.leadCaptureEnabled &&
      (relevantSources.length === 0 || this.messageSuggestsLeadCapture(visitorMessage));

    await this.prisma.chatbotMessage.create({
      data: {
        content: answer,
        conversationId: conversation.id,
        metadata: {
          leadCaptureSuggested,
          sources,
        },
        senderType: SenderType.BOT,
      },
    });

    return {
      answer,
      conversationId: conversation.id,
      leadCaptureSuggested,
      sources,
    };
  }

  async createLead(dto: CreateLeadDto, identity: RequestIdentity) {
    this.enforcePublicRateLimit(`lead:${identity.ip ?? 'unknown'}`);

    const settings = await this.getOrCreateSettings();

    if (!settings.leadCaptureEnabled) {
      throw new HttpException(
        'Lead capture is disabled.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const conversation = dto.conversationId
      ? await this.prisma.chatbotConversation.findUnique({
          where: { id: dto.conversationId },
        })
      : null;

    if (dto.conversationId && !conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    const lead = await this.prisma.lead.create({
      data: {
        email: dto.email.trim().toLowerCase(),
        message: dto.message?.trim() || undefined,
        name: dto.name.trim(),
        phone: dto.phone?.trim() || undefined,
        source: dto.sourcePage?.trim().slice(0, 191) || undefined,
        sourcePage: dto.sourcePage?.trim() || conversation?.sourcePage || undefined,
      },
    });

    if (conversation) {
      await this.prisma.chatbotConversation.update({
        data: { leadId: lead.id },
        where: { id: conversation.id },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        action: 'lead.captured',
        entityId: lead.id,
        entityType: 'Lead',
        metadata: {
          conversationId: conversation?.id ?? null,
          sourcePage: lead.sourcePage,
          userAgent: identity.userAgent ?? null,
        },
      },
    });

    return this.toLeadResponse({ ...lead, conversation: conversation ?? null });
  }

  async findConversations(query: { search?: string; from?: string; to?: string }) {
    const where: Prisma.ChatbotConversationWhereInput = {
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
      ...(query.search?.trim()
        ? {
            messages: {
              some: {
                content: {
                  contains: query.search.trim(),
                },
              },
            },
          }
        : {}),
    };

    const conversations = await this.prisma.chatbotConversation.findMany({
      include: {
        lead: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      where,
    });

    return {
      data: conversations.map((conversation) => ({
        createdAt: conversation.createdAt,
        id: conversation.id,
        lead: conversation.lead ? this.toLeadResponse(conversation.lead) : null,
        messageCount: conversation._count.messages,
        preview: conversation.messages[0]?.content ?? '',
        sourcePage: conversation.sourcePage,
        startedAt: conversation.startedAt,
        updatedAt: conversation.updatedAt,
      })),
    };
  }

  async findConversation(id: string) {
    const conversation = await this.prisma.chatbotConversation.findUnique({
      include: {
        lead: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    return {
      createdAt: conversation.createdAt,
      id: conversation.id,
      lead: conversation.lead ? this.toLeadResponse(conversation.lead) : null,
      messages: conversation.messages.map((message) => ({
        createdAt: message.createdAt,
        id: message.id,
        message: message.content,
        metadata: message.metadata,
        senderType: message.senderType,
      })),
      sourcePage: conversation.sourcePage,
      startedAt: conversation.startedAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async findLeads(query: { search?: string; from?: string; to?: string }) {
    const where: Prisma.LeadWhereInput = {
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
      ...(query.search?.trim()
        ? {
            OR: [
              { email: { contains: query.search.trim() } },
              { name: { contains: query.search.trim() } },
            ],
          }
        : {}),
    };

    const leads = await this.prisma.lead.findMany({
      include: {
        conversation: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      where,
    });

    return {
      data: leads.map((lead) => this.toLeadResponse(lead)),
    };
  }

  async getSettings() {
    return this.getOrCreateSettings();
  }

  async getPublicSettings() {
    const settings = await this.getOrCreateSettings();

    return {
      fallbackMessage: settings.fallbackMessage,
      greetingMessage: settings.greetingMessage,
      isEnabled: settings.isEnabled,
      leadCaptureEnabled: settings.leadCaptureEnabled,
    };
  }

  async updateSettings(dto: UpdateChatbotSettingsDto, user: AuthenticatedUser) {
    const settings = await this.getOrCreateSettings();
    const updatedSettings = await this.prisma.chatbotSettings.update({
      data: {
        fallbackMessage: dto.fallbackMessage,
        greetingMessage: dto.greetingMessage,
        isEnabled: dto.isEnabled,
        leadCaptureEnabled: dto.leadCaptureEnabled,
        supportEmail: dto.supportEmail?.trim() || null,
      },
      where: { id: settings.id },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'chatbot.settings.updated',
        entityId: updatedSettings.id,
        entityType: 'ChatbotSettings',
        metadata: {
          isEnabled: updatedSettings.isEnabled,
          leadCaptureEnabled: updatedSettings.leadCaptureEnabled,
        },
        userId: user.id,
      },
    });

    return updatedSettings;
  }

  async getAnalytics() {
    const [
      totalConversations,
      totalMessages,
      totalLeads,
      recentConversations,
      sourcePages,
    ] = await this.prisma.$transaction([
      this.prisma.chatbotConversation.count(),
      this.prisma.chatbotMessage.count(),
      this.prisma.lead.count(),
      this.prisma.chatbotConversation.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
          id: true,
          sourcePage: true,
        },
        take: 5,
      }),
      this.prisma.chatbotConversation.findMany({
        select: {
          sourcePage: true,
        },
        take: 1000,
        where: {
          sourcePage: {
            not: null,
          },
        },
      }),
    ]);

    const topSourcePages = Object.entries(
      sourcePages.reduce<Record<string, number>>((counts, item) => {
        if (item.sourcePage) {
          counts[item.sourcePage] = (counts[item.sourcePage] ?? 0) + 1;
        }

        return counts;
      }, {}),
    )
      .map(([sourcePage, count]) => ({ count, sourcePage }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      recentConversations,
      topSourcePages,
      totalConversations,
      totalLeads,
      totalMessages,
    };
  }

  private async getOrCreateConversation(
    dto: ChatbotMessageDto,
    identity: RequestIdentity,
  ) {
    if (dto.conversationId) {
      const existingConversation = await this.prisma.chatbotConversation.findUnique({
        where: { id: dto.conversationId },
      });

      if (existingConversation) {
        if (dto.sourcePage && !existingConversation.sourcePage) {
          return this.prisma.chatbotConversation.update({
            data: { sourcePage: dto.sourcePage },
            where: { id: existingConversation.id },
          });
        }

        return existingConversation;
      }
    }

    return this.prisma.chatbotConversation.create({
      data: {
        sessionId: randomUUID(),
        sourcePage: dto.sourcePage,
        visitorId: identity.ip?.slice(0, 191),
      },
    });
  }

  private async retrieveRelevantSources(message: string) {
    const terms = this.tokenize(message);

    if (!terms.length) {
      return [];
    }

    const [pages, blogs] = await Promise.all([
      this.prisma.page.findMany({
        select: {
          content: true,
          excerpt: true,
          id: true,
          metaDescription: true,
          slug: true,
          title: true,
        },
        take: 50,
        where: {
          deletedAt: null,
          status: ContentStatus.PUBLISHED,
        },
      }),
      this.prisma.blogPost.findMany({
        select: {
          content: true,
          excerpt: true,
          id: true,
          metaDescription: true,
          slug: true,
          title: true,
        },
        take: 50,
        where: {
          deletedAt: null,
          status: ContentStatus.PUBLISHED,
        },
      }),
    ]);

    const sources: KnowledgeSource[] = [
      ...pages.map((page) => ({
        id: page.id,
        slug: page.slug,
        text: this.stripHtml(
          [page.excerpt, page.metaDescription, page.content].filter(Boolean).join(' '),
        ),
        title: page.title,
        type: 'PAGE' as const,
      })),
      ...blogs.map((blog) => ({
        id: blog.id,
        slug: blog.slug,
        text: this.stripHtml(
          [blog.excerpt, blog.metaDescription, blog.content].filter(Boolean).join(' '),
        ),
        title: blog.title,
        type: 'BLOG' as const,
      })),
    ];

    return sources
      .map((source) => ({
        ...source,
        score: this.scoreSource(source, terms),
      }))
      .filter((source): source is ScoredSource => source.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }

  private async generateAnswer(
    message: string,
    sources: ScoredSource[],
    fallbackMessage: string,
  ) {
    const context = this.buildContext(sources);
    let providerResult: AiProviderResult | null = null;

    try {
      providerResult = await this.aiProvider.generateText({
        systemPrompt:
          'You are a website chatbot for an AI-first CMS. Answer only from the supplied CMS content. If the content does not contain the answer, say the information is not available and encourage contacting support. Keep answers concise and helpful.',
        userPrompt: [
          `Visitor question: ${message}`,
          'Published CMS content:',
          context,
          `Fallback guidance if unknown: ${fallbackMessage}`,
        ].join('\n\n'),
      });

      await this.logAiUsage(message, providerResult, 'success');

      return providerResult.result;
    } catch (error) {
      await this.logAiUsage(
        message,
        providerResult,
        'failed',
        error instanceof Error ? error.message : 'Unknown provider error',
      );

      return this.basicAnswerFromSources(sources, fallbackMessage);
    }
  }

  private buildContext(sources: ScoredSource[]) {
    let remaining = MAX_CONTEXT_CHARS;
    const chunks: string[] = [];

    for (const source of sources) {
      if (remaining <= 0) {
        break;
      }

      const text = source.text.slice(0, Math.max(0, remaining));
      chunks.push(
        `[${source.type}] ${source.title} (${source.slug})\n${text}`,
      );
      remaining -= text.length;
    }

    return chunks.join('\n\n---\n\n');
  }

  private basicAnswerFromSources(sources: ScoredSource[], fallbackMessage: string) {
    const bestSource = sources[0];

    if (!bestSource) {
      return fallbackMessage;
    }

    const excerpt = bestSource.text.slice(0, 320).trim();

    return excerpt
      ? `${excerpt}${bestSource.text.length > 320 ? '...' : ''}`
      : fallbackMessage;
  }

  private scoreSource(source: KnowledgeSource, terms: string[]) {
    const title = source.title.toLowerCase();
    const text = source.text.toLowerCase();

    return terms.reduce((score, term) => {
      const titleScore = title.includes(term) ? 5 : 0;
      const textScore = text.includes(term) ? 1 : 0;

      return score + titleScore + textScore;
    }, 0);
  }

  private tokenize(value: string) {
    return [
      ...new Set(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((term) => term.length >= 3 && !STOP_WORDS.has(term)),
      ),
    ];
  }

  private stripHtml(value: string) {
    return value
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private sanitize(value: string) {
    return value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  }

  private messageSuggestsLeadCapture(message: string) {
    return [
      'contact',
      'demo',
      'quote',
      'pricing',
      'price',
      'call',
      'support',
      'sales',
      'help me',
    ].some((term) => message.toLowerCase().includes(term));
  }

  private enforcePublicRateLimit(key: string) {
    const now = Date.now();
    const currentWindow = this.publicRateLimits.get(key);

    if (!currentWindow || now - currentWindow.startedAt > PUBLIC_RATE_WINDOW_MS) {
      this.publicRateLimits.set(key, { count: 1, startedAt: now });
      return;
    }

    if (currentWindow.count >= PUBLIC_REQUESTS_PER_MINUTE) {
      throw new HttpException(
        'Too many chatbot requests. Please wait before trying again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    currentWindow.count += 1;
  }

  private async getOrCreateSettings() {
    const existingSettings = await this.prisma.chatbotSettings.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (existingSettings) {
      return existingSettings;
    }

    return this.prisma.chatbotSettings.create({
      data: {
        fallbackMessage:
          'I do not have that information yet. Please contact support and we will help you.',
        greetingMessage: 'Hi! How can I help you today?',
        id: DEFAULT_SETTINGS_ID,
        isEnabled: true,
        leadCaptureEnabled: true,
      },
    });
  }

  private async logAiUsage(
    message: string,
    providerResult: AiProviderResult | null,
    status: 'failed' | 'success',
    error?: string,
  ) {
    await this.prisma.aIUsageLog.create({
      data: {
        action: 'chatbot-message',
        completionTokens: providerResult?.metadata.tokenOutput ?? 0,
        feature: 'chatbot-message',
        metadata: {
          error: error ?? null,
          rawUsage:
            (providerResult?.metadata.rawUsage as Prisma.InputJsonValue) ?? null,
          status,
        } as Prisma.InputJsonValue,
        model: providerResult?.metadata.model ?? this.getConfiguredModel(),
        modelName: providerResult?.metadata.model ?? this.getConfiguredModel(),
        promptSummary: this.sanitize(message).slice(0, 500),
        promptTokens: providerResult?.metadata.tokenInput ?? 0,
        provider: providerResult?.metadata.provider ?? this.getConfiguredProvider(),
        tokenInput: providerResult?.metadata.tokenInput ?? 0,
        tokenOutput: providerResult?.metadata.tokenOutput ?? 0,
        totalTokens:
          (providerResult?.metadata.tokenInput ?? 0) +
          (providerResult?.metadata.tokenOutput ?? 0),
      },
    });
  }

  private getConfiguredProvider() {
    return (
      this.configService.get<string>('AI_PROVIDER')?.trim().toLowerCase() ||
      'openai'
    );
  }

  private getConfiguredModel() {
    if (this.getConfiguredProvider() === 'gemini') {
      return this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
    }

    return this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
  }

  private toLeadResponse(lead: LeadWithConversation) {
    return {
      conversationId: lead.conversation?.id ?? null,
      createdAt: lead.createdAt,
      email: lead.email,
      id: lead.id,
      message: lead.message,
      name: lead.name,
      phone: lead.phone,
      sourcePage: lead.sourcePage ?? lead.source,
      status: lead.status,
      updatedAt: lead.updatedAt,
    };
  }
}
