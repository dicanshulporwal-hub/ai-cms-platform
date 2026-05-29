import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AI_PROVIDER_CLIENT, AiProvider } from '../ai/providers/ai-provider.interface';

@Injectable()
export class FaqAIService {
  constructor(@Inject(AI_PROVIDER_CLIENT) private readonly aiProvider: AiProvider, private readonly prisma: PrismaService) {}

  async generateFaqs(dto: { topic: string; numberOfQuestions?: number; language?: string; tone?: string; categoryId?: string }, user: AuthenticatedUser) {
    const num = dto.numberOfQuestions ?? 5;
    const result = await this.aiProvider.generateText({
      systemPrompt: `Generate ${num} FAQs as JSON array. Return ONLY: {"faqs":[{"question":"","answer":"","suggestedCategory":"","tags":[],"seoTitle":"","seoDescription":""}]}. Rules: seoTitle max 60 chars, seoDescription max 160 chars, answers should be clear and helpful, tone: ${dto.tone ?? 'professional'}, language: ${dto.language ?? 'English'}.`,
      userPrompt: `Topic: ${dto.topic}`,
    });

    const parsed = this.parseResponse(result.result);
    await this.logUsage('faq-generation', dto.topic, result, user.id);
    return { generated: parsed, provider: result.metadata.provider, model: result.metadata.model };
  }

  async generateFromContent(dto: { sourceType: string; sourceId: string; numberOfQuestions?: number; language?: string }, user: AuthenticatedUser) {
    let content = '';
    if (dto.sourceType === 'PAGE') {
      const page = await this.prisma.page.findUnique({ where: { id: dto.sourceId }, select: { title: true, content: true, excerpt: true } });
      if (page) content = `Title: ${page.title}\n${page.excerpt ?? ''}\n${(page.content ?? '').replace(/<[^>]*>/g, ' ').slice(0, 10000)}`;
    } else if (dto.sourceType === 'BLOG') {
      const blog = await this.prisma.blogPost.findUnique({ where: { id: dto.sourceId }, select: { title: true, content: true, excerpt: true } });
      if (blog) content = `Title: ${blog.title}\n${blog.excerpt ?? ''}\n${(blog.content ?? '').replace(/<[^>]*>/g, ' ').slice(0, 10000)}`;
    } else if (dto.sourceType === 'DOCUMENT') {
      const doc = await this.prisma.document.findUnique({ where: { id: dto.sourceId }, select: { title: true, description: true, summary: true } });
      if (doc) content = `Title: ${doc.title}\n${doc.description ?? ''}\n${doc.summary ?? ''}`;
    }

    if (!content) content = 'No content available. Generate general FAQs.';

    const num = dto.numberOfQuestions ?? 5;
    const result = await this.aiProvider.generateText({
      systemPrompt: `Generate ${num} FAQs from the provided content. Return ONLY: {"faqs":[{"question":"","answer":"","suggestedCategory":"","tags":[],"seoTitle":"","seoDescription":""}]}. Rules: Only use information from the content. Do not invent facts. seoTitle max 60 chars, seoDescription max 160 chars.`,
      userPrompt: content,
    });

    const parsed = this.parseResponse(result.result);
    await this.logUsage('faq-generation-from-content', `${dto.sourceType}:${dto.sourceId}`, result, user.id);
    return { generated: parsed, sourceType: dto.sourceType, sourceId: dto.sourceId, provider: result.metadata.provider, model: result.metadata.model };
  }

  private parseResponse(text: string): { faqs: any[] } {
    try {
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = fenceMatch ? fenceMatch[1].trim() : text;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { faqs: [] };
    } catch { return { faqs: [] }; }
  }

  private async logUsage(action: string, summary: string, result: any, userId: string) {
    await this.prisma.aIUsageLog.create({
      data: { action, feature: action, provider: result.metadata.provider, model: result.metadata.model, modelName: result.metadata.model, promptSummary: summary.slice(0, 500), tokenInput: result.metadata.tokenInput ?? 0, tokenOutput: result.metadata.tokenOutput ?? 0, promptTokens: result.metadata.tokenInput ?? 0, completionTokens: result.metadata.tokenOutput ?? 0, totalTokens: (result.metadata.tokenInput ?? 0) + (result.metadata.tokenOutput ?? 0), userId },
    });
  }
}
