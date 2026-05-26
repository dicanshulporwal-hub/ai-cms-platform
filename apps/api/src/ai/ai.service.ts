import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentType, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { AiUsageQueryDto } from './dto/ai-usage-query.dto';
import { GenerateAltTextDto } from './dto/generate-alt-text.dto';
import { GenerateContentDto } from './dto/generate-content.dto';
import { GenerateFaqDto } from './dto/generate-faq.dto';
import { GenerateSeoDto } from './dto/generate-seo.dto';
import { ImproveSeoDto } from './dto/improve-seo.dto';
import { RewriteContentDto } from './dto/rewrite-content.dto';
import { SummarizeContentDto } from './dto/summarize-content.dto';
import {
  AI_PROVIDER_CLIENT,
  AiProvider,
  AiProviderRequest,
  AiProviderResult,
} from './providers/ai-provider.interface';

interface RateLimitWindow {
  count: number;
  startedAt: number;
}

const AI_ACTIONS_PER_MINUTE = 20;
const AI_WINDOW_MS = 60_000;

@Injectable()
export class AiService {
  private readonly rateLimits = new Map<string, RateLimitWindow>();

  constructor(
    @Inject(AI_PROVIDER_CLIENT) private readonly aiProvider: AiProvider,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  generateContent(dto: GenerateContentDto, user: AuthenticatedUser) {
    const contentLabel = dto.contentType === ContentType.BLOG ? 'blog post' : 'page';
    const language = dto.language?.trim() || 'English';

    return this.runAiAction({
      action: 'generate-content',
      parseMode: 'text',
      promptSummary: `Generate ${contentLabel}: ${dto.topic}`,
      request: {
        systemPrompt:
          'You are an AI content assistant for a CMS. Return editable HTML only. Do not publish, approve, or make workflow decisions.',
        userPrompt: [
          `Create a polished ${contentLabel} draft in ${language}.`,
          `Topic: ${dto.topic}`,
          `Target audience: ${dto.targetAudience}`,
          `Tone: ${dto.tone}`,
          dto.keywords ? `Keywords to include naturally: ${dto.keywords}` : null,
          'Return semantic HTML with headings, paragraphs, and lists where useful.',
        ]
          .filter(Boolean)
          .join('\n'),
      },
      user,
    });
  }

  rewriteContent(dto: RewriteContentDto, user: AuthenticatedUser) {
    this.ensureReadableContent(dto.content);

    return this.runAiAction({
      action: 'rewrite-content',
      parseMode: 'text',
      promptSummary: this.summarizePrompt(dto.content, 'Rewrite content'),
      request: {
        systemPrompt:
          'You are an AI content assistant for a CMS. Return editable content only and preserve factual meaning.',
        userPrompt: [
          `Rewrite the content with this tone: ${dto.tone}.`,
          dto.instruction ? `Additional instruction: ${dto.instruction}` : null,
          'If the input is HTML, return valid HTML. Do not include publishing instructions.',
          `Content:\n${dto.content}`,
        ]
          .filter(Boolean)
          .join('\n'),
      },
      user,
    });
  }

  summarizeContent(dto: SummarizeContentDto, user: AuthenticatedUser) {
    this.ensureReadableContent(dto.content);

    return this.runAiAction({
      action: 'summarize-content',
      parseMode: 'text',
      promptSummary: this.summarizePrompt(dto.content, 'Summarize content'),
      request: {
        systemPrompt:
          'You are an AI summary assistant for CMS editors. Return a concise plain-text summary.',
        userPrompt: [
          `Summarize this content in ${dto.maxLength ?? 120} words or fewer.`,
          'Keep the summary editable and factual.',
          `Content:\n${dto.content}`,
        ].join('\n'),
      },
      user,
    });
  }

  generateFaq(dto: GenerateFaqDto, user: AuthenticatedUser) {
    this.ensureReadableContent(dto.content);

    return this.runAiAction({
      action: 'generate-faq',
      parseMode: 'json',
      promptSummary: this.summarizePrompt(dto.content, 'Generate FAQ'),
      request: {
        jsonMode: true,
        systemPrompt:
          'You are an AI FAQ assistant. Return only valid JSON with concise, editable question-answer pairs.',
        userPrompt: [
          'Return valid JSON in this exact shape:',
          '{"faqs":[{"question":"Question text","answer":"Answer text"}]}',
          `Create ${dto.numberOfQuestions ?? 5} FAQs from this content.`,
          `Content:\n${dto.content}`,
        ].join('\n'),
      },
      user,
    });
  }

  generateSeo(dto: GenerateSeoDto, user: AuthenticatedUser) {
    this.ensureReadableContent(dto.content);

    return this.runAiAction({
      action: 'generate-seo',
      parseMode: 'json',
      promptSummary: `Generate SEO metadata: ${dto.title}`,
      request: {
        jsonMode: true,
        systemPrompt:
          'You are an AI SEO assistant. Return only valid JSON. Meta titles must be 60 characters or fewer and meta descriptions 160 characters or fewer.',
        userPrompt: [
          'Return valid JSON in this exact shape:',
          '{"metaTitle":"Up to 60 characters","metaDescription":"Up to 160 characters","keywords":["keyword"]}',
          `Title: ${dto.title}`,
          dto.keywords ? `Target keywords: ${dto.keywords}` : null,
          `Content:\n${dto.content}`,
        ]
          .filter(Boolean)
          .join('\n'),
      },
      user,
    });
  }

  improveSeo(dto: ImproveSeoDto, user: AuthenticatedUser) {
    this.ensureReadableContent(dto.content);

    return this.runAiAction({
      action: 'improve-seo',
      parseMode: 'json',
      promptSummary: `Improve SEO metadata: ${dto.title}`,
      request: {
        jsonMode: true,
        systemPrompt:
          'You are an AI SEO assistant. Return only valid JSON. Meta titles must be 60 characters or fewer and meta descriptions 160 characters or fewer.',
        userPrompt: [
          'Return valid JSON in this exact shape:',
          '{"metaTitle":"Up to 60 characters","metaDescription":"Up to 160 characters","keywordSuggestions":["keyword"],"recommendations":["recommendation"]}',
          `Title: ${dto.title}`,
          dto.metaTitle ? `Current meta title: ${dto.metaTitle}` : null,
          dto.metaDescription
            ? `Current meta description: ${dto.metaDescription}`
            : null,
          dto.keywords ? `Target keywords: ${dto.keywords}` : null,
          `Content:\n${dto.content}`,
        ]
          .filter(Boolean)
          .join('\n'),
      },
      user,
    });
  }

  generateAltText(dto: GenerateAltTextDto, user: AuthenticatedUser) {
    return this.runAiAction({
      action: 'generate-alt-text',
      parseMode: 'text',
      promptSummary: `Generate alt text: ${dto.imageUrl}`,
      request: {
        systemPrompt:
          'You are an accessibility assistant for a CMS. Return one clear image alt text sentence only.',
        userPrompt: [
          'Write descriptive alt text under 150 characters.',
          `Image URL: ${dto.imageUrl}`,
          dto.context ? `Context: ${dto.context}` : null,
        ]
          .filter(Boolean)
          .join('\n'),
      },
      user,
    });
  }

  async findUsageLogs(query: AiUsageQueryDto, user: AuthenticatedUser) {
    const canViewAll = user.role === 'Super Admin' || user.role === 'Admin';
    const where: Prisma.AIUsageLogWhereInput = {
      ...(query.action ? { action: query.action } : {}),
      ...(canViewAll ? {} : { userId: user.id }),
    };

    const logs = await this.prisma.aIUsageLog.findMany({
      include: {
        user: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      where,
    });

    return {
      data: logs.map((log) => ({
        action: log.action,
        createdAt: log.createdAt,
        id: log.id,
        model: log.model ?? log.modelName,
        promptSummary: log.promptSummary,
        provider: log.provider,
        tokenInput: log.tokenInput,
        tokenOutput: log.tokenOutput,
        user: log.user,
      })),
    };
  }

  private async runAiAction({
    action,
    parseMode,
    promptSummary,
    request,
    user,
  }: {
    action: string;
    parseMode: 'json' | 'text';
    promptSummary: string;
    request: AiProviderRequest;
    user: AuthenticatedUser;
  }) {
    this.ensureSupportedProvider();
    this.enforceRateLimit(user.id);

    let providerResult: AiProviderResult | undefined;

    try {
      providerResult = await this.aiProvider.generateText(request);
      const result =
        parseMode === 'json'
          ? this.parseJsonResult(providerResult.result)
          : providerResult.result;

      await this.logUsage({
        action,
        metadata: {
          rawUsage:
            (providerResult.metadata.rawUsage as Prisma.InputJsonValue) ?? null,
          status: 'success',
        } as Prisma.InputJsonValue,
        model: providerResult.metadata.model,
        provider: providerResult.metadata.provider,
        promptSummary,
        tokenInput: providerResult.metadata.tokenInput ?? 0,
        tokenOutput: providerResult.metadata.tokenOutput ?? 0,
        user,
      });

      return {
        data: {
          metadata: {
            model: providerResult.metadata.model,
            provider: providerResult.metadata.provider,
            tokenInput: providerResult.metadata.tokenInput ?? 0,
            tokenOutput: providerResult.metadata.tokenOutput ?? 0,
          },
          result,
        },
        success: true,
      };
    } catch (error) {
      await this.logUsage({
        action,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown AI error',
          status: 'failed',
        } as Prisma.InputJsonValue,
        model:
          providerResult?.metadata.model ??
          this.getConfiguredModel() ??
          null,
        provider: this.getConfiguredProvider(),
        promptSummary,
        tokenInput: providerResult?.metadata.tokenInput ?? 0,
        tokenOutput: providerResult?.metadata.tokenOutput ?? 0,
        user,
      });

      throw error;
    }
  }

  private ensureSupportedProvider() {
    if (!['gemini', 'openai'].includes(this.getConfiguredProvider())) {
      throw new ServiceUnavailableException(
        'Configured AI provider is not supported yet.',
      );
    }
  }

  private enforceRateLimit(userId: string) {
    const now = Date.now();
    const currentWindow = this.rateLimits.get(userId);

    if (!currentWindow || now - currentWindow.startedAt > AI_WINDOW_MS) {
      this.rateLimits.set(userId, { count: 1, startedAt: now });
      return;
    }

    if (currentWindow.count >= AI_ACTIONS_PER_MINUTE) {
      throw new HttpException(
        'Too many AI requests. Please wait before trying again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    currentWindow.count += 1;
  }

  private ensureReadableContent(content: string) {
    const text = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) {
      throw new BadRequestException('Content cannot be empty.');
    }
  }

  private parseJsonResult(result: string) {
    const trimmed = result.trim();
    const withoutFence = trimmed
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    try {
      return JSON.parse(withoutFence) as unknown;
    } catch {
      throw new ServiceUnavailableException(
        'AI provider returned invalid structured data.',
      );
    }
  }

  private summarizePrompt(value: string, prefix: string) {
    const text = value
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 220);

    return `${prefix}: ${text}`;
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

  private async logUsage({
    action,
    metadata,
    model,
    promptSummary,
    provider,
    tokenInput,
    tokenOutput,
    user,
  }: {
    action: string;
    metadata: Prisma.InputJsonValue;
    model: string | null;
    promptSummary: string;
    provider: string;
    tokenInput: number;
    tokenOutput: number;
    user: AuthenticatedUser;
  }) {
    await this.prisma.aIUsageLog.create({
      data: {
        action,
        completionTokens: tokenOutput,
        feature: action,
        metadata,
        model,
        modelName: model,
        promptSummary: promptSummary.slice(0, 500),
        promptTokens: tokenInput,
        provider,
        tokenInput,
        tokenOutput,
        totalTokens: tokenInput + tokenOutput,
        userId: user.id,
      },
    });
  }
}
