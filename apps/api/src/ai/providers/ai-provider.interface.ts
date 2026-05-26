export const AI_PROVIDER_CLIENT = Symbol('AI_PROVIDER_CLIENT');

export interface AiProviderRequest {
  jsonMode?: boolean;
  systemPrompt: string;
  userPrompt: string;
}

export interface AiProviderResult {
  metadata: {
    model: string;
    provider: string;
    rawUsage?: unknown;
    tokenInput?: number;
    tokenOutput?: number;
  };
  result: string;
}

export interface AiProvider {
  generateText(request: AiProviderRequest): Promise<AiProviderResult>;
}
