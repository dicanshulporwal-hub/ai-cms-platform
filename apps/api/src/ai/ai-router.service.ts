import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AiProviderRequest, AiProviderResult } from './providers/ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';

export interface AiRouterRequest {
  taskType: string;
  selectionMode?: 'AUTO' | 'MANUAL';
  costPreference?: string;
  providerKey?: string;
  modelKey?: string;
  prompt: AiProviderRequest;
  options?: {
    allowPaidModels?: boolean;
    requireFreeModel?: boolean;
    allowFallback?: boolean;
  };
}

export interface AiRouterResponse {
  success: boolean;
  provider: string;
  model: string;
  selectionMode: string;
  pricingType: string;
  paidModelUsed: boolean;
  data: AiProviderResult;
  usage?: { inputTokens: number; outputTokens: number };
  error?: string;
}

@Injectable()
export class AiRouterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly geminiProvider: GeminiProvider,
    private readonly openAiProvider: OpenAiProvider,
  ) {}

  async run(request: AiRouterRequest): Promise<AiRouterResponse> {
    const selectionMode = request.selectionMode ?? 'AUTO';
    const costPreference = request.costPreference ?? 'PREFER_FREE';

    // Get routing rule for task type
    const rule = await this.prisma.aiRoutingRule.findUnique({
      where: { taskType: request.taskType },
    }).catch(() => null);

    const allowPaid = request.options?.allowPaidModels ?? rule?.allowPaidModels ?? false;
    const requireFree = request.options?.requireFreeModel ?? rule?.requireFreeModel ?? true;

    // Determine provider
    let providerKey = request.providerKey;
    let modelKey = request.modelKey;

    if (selectionMode === 'AUTO' || !providerKey) {
      const selected = await this.autoSelect(request.taskType, costPreference, requireFree, allowPaid);
      providerKey = selected.providerKey;
      modelKey = selected.modelKey;
    }

    // Execute with selected provider
    try {
      const result = await this.executeWithProvider(providerKey!, request.prompt);
      const pricingType = await this.getModelPricingType(providerKey!, modelKey);

      return {
        success: true,
        provider: providerKey!,
        model: result.metadata.model,
        selectionMode,
        pricingType,
        paidModelUsed: pricingType === 'PAID',
        data: result,
        usage: { inputTokens: result.metadata.tokenInput ?? 0, outputTokens: result.metadata.tokenOutput ?? 0 },
      };
    } catch (error) {
      // Try fallback
      if (request.options?.allowFallback !== false && selectionMode === 'AUTO') {
        const fallback = await this.getFallbackProvider(providerKey!, request.taskType);
        if (fallback) {
          try {
            const result = await this.executeWithProvider(fallback, request.prompt);
            const pricingType = await this.getModelPricingType(fallback, undefined);
            return {
              success: true, provider: fallback, model: result.metadata.model,
              selectionMode: 'AUTO', pricingType, paidModelUsed: pricingType === 'PAID',
              data: result, usage: { inputTokens: result.metadata.tokenInput ?? 0, outputTokens: result.metadata.tokenOutput ?? 0 },
            };
          } catch {}
        }
      }

      return {
        success: false, provider: providerKey ?? 'unknown', model: modelKey ?? 'unknown',
        selectionMode, pricingType: 'UNKNOWN', paidModelUsed: false,
        data: { result: '', metadata: { model: '', provider: providerKey ?? '' } },
        error: error instanceof Error ? error.message : 'AI provider failed.',
      };
    }
  }

  private async autoSelect(taskType: string, costPreference: string, requireFree: boolean, allowPaid: boolean) {
    // Check configured providers
    const providers = await this.prisma.aiProviderConfig.findMany({ where: { isEnabled: true } });

    // If database has configured providers, use them
    if (providers.length > 0) {
      // Prefer free/free-tier models
      if (costPreference === 'PREFER_FREE' || requireFree) {
        for (const p of providers) {
          const freeModel = await this.prisma.aiModelConfig.findFirst({
            where: { providerConfigId: p.id, isEnabled: true, OR: [{ isFree: true }, { isFreeTier: true }] },
          });
          if (freeModel) return { providerKey: p.providerKey, modelKey: freeModel.modelKey };
        }
      }

      // If paid allowed, use default
      if (allowPaid) {
        const defaultProvider = providers.find(p => p.isDefault) ?? providers[0];
        return { providerKey: defaultProvider.providerKey, modelKey: defaultProvider.defaultTextModel ?? undefined };
      }

      if (requireFree) {
        throw new ServiceUnavailableException('No free/free-tier model available. Enable a free model or allow paid models.');
      }
    }

    // Fallback to env-configured providers
    const envProvider = (this.configService.get<string>('AI_PROVIDER') ?? 'gemini').toLowerCase();
    return { providerKey: envProvider === 'openai' ? 'OPENAI' : 'GEMINI', modelKey: undefined };
  }

  private async executeWithProvider(providerKey: string, prompt: AiProviderRequest): Promise<AiProviderResult> {
    switch (providerKey.toUpperCase()) {
      case 'GEMINI': return this.geminiProvider.generateText(prompt);
      case 'OPENAI': return this.openAiProvider.generateText(prompt);
      default:
        // Try env-based fallback
        const envProvider = (this.configService.get<string>('AI_PROVIDER') ?? 'gemini').toLowerCase();
        if (envProvider === 'openai') return this.openAiProvider.generateText(prompt);
        return this.geminiProvider.generateText(prompt);
    }
  }

  private async getFallbackProvider(failedProvider: string, taskType: string): Promise<string | null> {
    const rule = await this.prisma.aiRoutingRule.findUnique({ where: { taskType } }).catch(() => null);
    if (rule?.fallbackProviderKey && rule.fallbackProviderKey !== failedProvider) {
      return rule.fallbackProviderKey;
    }
    // Simple fallback: if Gemini failed try OpenAI, vice versa
    if (failedProvider.toUpperCase() === 'GEMINI') return 'OPENAI';
    if (failedProvider.toUpperCase() === 'OPENAI') return 'GEMINI';
    return null;
  }

  private async getModelPricingType(providerKey: string, modelKey?: string): Promise<string> {
    if (!modelKey) {
      const config = await this.prisma.aiProviderConfig.findUnique({ where: { providerKey } }).catch(() => null);
      if (config) {
        const model = await this.prisma.aiModelConfig.findFirst({ where: { providerConfigId: config.id, isDefault: true } }).catch(() => null);
        if (model) return model.pricingType;
      }
      // Env-based defaults
      if (providerKey.toUpperCase() === 'GEMINI') return 'FREE_TIER';
      if (providerKey.toUpperCase() === 'OPENAI') return 'PAID';
      return 'UNKNOWN';
    }
    const config = await this.prisma.aiProviderConfig.findUnique({ where: { providerKey } }).catch(() => null);
    if (config) {
      const model = await this.prisma.aiModelConfig.findFirst({ where: { providerConfigId: config.id, modelKey } }).catch(() => null);
      if (model) return model.pricingType;
    }
    return 'UNKNOWN';
  }

  async getAvailableModels() {
    const providers = await this.prisma.aiProviderConfig.findMany({ where: { isEnabled: true }, include: { models: { where: { isEnabled: true } } } });
    return providers.map(p => ({ providerKey: p.providerKey, providerName: p.providerName, models: p.models }));
  }

  async getFreeModels() {
    const models = await this.prisma.aiModelConfig.findMany({ where: { isEnabled: true, OR: [{ isFree: true }, { isFreeTier: true }] }, include: { providerConfig: { select: { providerKey: true, providerName: true } } } });
    return models;
  }

  async getHealth() {
    const providers = await this.prisma.aiProviderConfig.findMany({ where: { isEnabled: true } });
    const results = [];
    for (const p of providers) {
      try {
        await this.executeWithProvider(p.providerKey, { systemPrompt: 'Reply OK', userPrompt: 'Health check' });
        results.push({ providerKey: p.providerKey, status: 'HEALTHY' });
      } catch (e) {
        results.push({ providerKey: p.providerKey, status: 'FAILED', error: e instanceof Error ? e.message : 'Unknown' });
      }
    }
    return results;
  }
}
