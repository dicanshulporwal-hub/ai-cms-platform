import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RenderedPrompt {
  promptKey: string;
  version: number;
  systemPrompt: string;
  userPrompt: string;
  outputFormat: Record<string, unknown> | null;
  temperature: number;
  maxTokens: number;
}

/**
 * Renders AI prompts from templates with variable substitution.
 * Caches active prompts in memory to avoid DB queries per AI call.
 */
@Injectable()
export class AiPromptRenderingService {
  private cache = new Map<string, { data: any; cachedAt: number }>();
  private CACHE_TTL_MS = 60_000; // 1 minute

  constructor(private readonly prisma: PrismaService) {}

  async renderPrompt(promptKey: string, variables: Record<string, string> = {}): Promise<RenderedPrompt | null> {
    const activeVersion = await this.getActiveVersion(promptKey);
    if (!activeVersion) return null;

    // Replace variables in user prompt template
    let userPrompt = activeVersion.userPromptTemplate;
    for (const [key, value] of Object.entries(variables)) {
      userPrompt = userPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }

    // Validate no unreplaced required variables remain
    const unreplaced = userPrompt.match(/\{\{[^}]+\}\}/g);
    const requiredVars = (activeVersion.variablesJson as any[])?.filter((v: any) => v.required) || [];
    for (const rv of requiredVars) {
      if (unreplaced?.includes(`{{${rv.name}}}`)) {
        return null; // Missing required variable
      }
    }

    return {
      promptKey,
      version: activeVersion.version,
      systemPrompt: activeVersion.systemPrompt,
      userPrompt,
      outputFormat: activeVersion.outputFormatJson as Record<string, unknown> | null,
      temperature: activeVersion.temperature,
      maxTokens: activeVersion.maxTokens,
    };
  }

  async getActiveVersion(promptKey: string) {
    // Check cache
    const cached = this.cache.get(promptKey);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }

    // Find active version
    const template = await this.prisma.aiPromptTemplate.findUnique({
      where: { promptKey },
      select: { id: true, currentVersionId: true, status: true },
    });

    if (!template || template.status !== 'PROMPT_ACTIVE') return null;

    const version = template.currentVersionId
      ? await this.prisma.aiPromptVersion.findUnique({ where: { id: template.currentVersionId } })
      : await this.prisma.aiPromptVersion.findFirst({
          where: { promptTemplateId: template.id, status: 'VERSION_ACTIVE' },
          orderBy: { version: 'desc' },
        });

    if (version) {
      this.cache.set(promptKey, { data: version, cachedAt: Date.now() });
    }

    return version;
  }

  invalidateCache(promptKey?: string) {
    if (promptKey) this.cache.delete(promptKey);
    else this.cache.clear();
  }
}
