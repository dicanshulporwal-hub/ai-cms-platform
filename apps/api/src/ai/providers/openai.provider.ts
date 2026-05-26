import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProvider,
  AiProviderRequest,
  AiProviderResult,
} from './ai-provider.interface';

interface OpenAiChatResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
  usage?: {
    completion_tokens?: number;
    prompt_tokens?: number;
    total_tokens?: number;
  };
}

@Injectable()
export class OpenAiProvider implements AiProvider {
  private readonly endpoint = 'https://api.openai.com/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {}

  async generateText(request: AiProviderRequest): Promise<AiProviderResult> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const model = this.getModel();

    if (!apiKey?.trim()) {
      throw new ServiceUnavailableException('OPENAI_API_KEY is not configured.');
    }

    let response: Response;

    try {
      response = await fetch(this.endpoint, {
        body: JSON.stringify({
          max_tokens: this.configService.get<number>('AI_MAX_TOKENS') ?? 1200,
          messages: [
            { content: request.systemPrompt, role: 'system' },
            { content: request.userPrompt, role: 'user' },
          ],
          model,
          ...(request.jsonMode ? { response_format: { type: 'json_object' } } : {}),
          temperature: this.configService.get<number>('AI_TEMPERATURE') ?? 0.4,
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
    } catch {
      throw new ServiceUnavailableException('AI provider is unavailable.');
    }

    const data = (await response.json().catch(() => null)) as OpenAiChatResponse | null;

    if (!response.ok) {
      throw new ServiceUnavailableException(
        data?.error?.message ?? 'AI provider request failed.',
      );
    }

    const result = data?.choices?.[0]?.message?.content?.trim();

    if (!result) {
      throw new ServiceUnavailableException('AI provider returned an empty response.');
    }

    return {
      metadata: {
        model,
        provider: 'openai',
        rawUsage: data?.usage,
        tokenInput: data?.usage?.prompt_tokens ?? 0,
        tokenOutput: data?.usage?.completion_tokens ?? 0,
      },
      result,
    };
  }

  private getModel() {
    return this.configService.get<string>('OPENAI_MODEL')?.trim() || 'gpt-4o-mini';
  }
}
