import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProvider,
  AiProviderRequest,
  AiProviderResult,
} from './ai-provider.interface';

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
  usageMetadata?: {
    candidatesTokenCount?: number;
    promptTokenCount?: number;
    totalTokenCount?: number;
  };
}

@Injectable()
export class GeminiProvider implements AiProvider {
  private readonly endpointBase =
    'https://generativelanguage.googleapis.com/v1beta';

  constructor(private readonly configService: ConfigService) {}

  async generateText(request: AiProviderRequest): Promise<AiProviderResult> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const model = this.getModel();

    if (!apiKey?.trim()) {
      throw new ServiceUnavailableException('GEMINI_API_KEY is not configured.');
    }

    let response: Response;

    try {
      response = await fetch(`${this.endpointBase}/${this.getModelPath(model)}:generateContent`, {
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: request.userPrompt }],
              role: 'user',
            },
          ],
          generationConfig: {
            maxOutputTokens:
              this.configService.get<number>('AI_MAX_TOKENS') ?? 1200,
            ...(request.jsonMode
              ? { responseMimeType: 'application/json' }
              : {}),
            temperature:
              this.configService.get<number>('AI_TEMPERATURE') ?? 0.4,
          },
          systemInstruction: {
            parts: [{ text: request.systemPrompt }],
          },
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        method: 'POST',
      });
    } catch {
      throw new ServiceUnavailableException('AI provider is unavailable.');
    }

    const data = (await response.json().catch(() => null)) as
      | GeminiGenerateContentResponse
      | null;

    if (!response.ok) {
      throw new ServiceUnavailableException(
        data?.error?.message ?? 'AI provider request failed.',
      );
    }

    const result = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!result) {
      throw new ServiceUnavailableException('AI provider returned an empty response.');
    }

    return {
      metadata: {
        model,
        provider: 'gemini',
        rawUsage: data?.usageMetadata,
        tokenInput: data?.usageMetadata?.promptTokenCount ?? 0,
        tokenOutput: data?.usageMetadata?.candidatesTokenCount ?? 0,
      },
      result,
    };
  }

  private getModel() {
    return (
      this.configService.get<string>('GEMINI_MODEL')?.trim() ||
      'gemini-2.5-flash'
    );
  }

  private getModelPath(model: string) {
    return model.startsWith('models/') ? model : `models/${model}`;
  }
}
