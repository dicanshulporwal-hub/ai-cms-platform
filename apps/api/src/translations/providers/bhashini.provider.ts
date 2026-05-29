import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface BhashiniTranslateRequest {
  sourceLanguage: string;
  targetLanguage: string;
  text: string;
}

export interface BhashiniTranslateResponse {
  translatedText: string;
  provider: string;
  sourceLanguage: string;
  targetLanguage: string;
}

@Injectable()
export class BhashiniProvider {
  constructor(private readonly configService: ConfigService) {}

  async translate(request: BhashiniTranslateRequest): Promise<BhashiniTranslateResponse> {
    const apiKey = this.configService.get<string>('BHASHINI_API_KEY');
    const baseUrl = this.configService.get<string>('BHASHINI_BASE_URL') ?? 'https://dhruva-api.bhashini.gov.in';
    const userId = this.configService.get<string>('BHASHINI_USER_ID');

    if (!apiKey) {
      throw new Error('Bhashini API key is not configured.');
    }

    try {
      const response = await fetch(`${baseUrl}/services/inference/translation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
          ...(userId ? { 'userID': userId } : {}),
        },
        body: JSON.stringify({
          pipelineTasks: [{
            taskType: 'translation',
            config: {
              language: { sourceLanguage: request.sourceLanguage, targetLanguage: request.targetLanguage },
            },
          }],
          inputData: { input: [{ source: request.text }] },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Bhashini API error: ${response.status} - ${errorData.slice(0, 200)}`);
      }

      const data = await response.json();
      const translatedText = data?.pipelineResponse?.[0]?.output?.[0]?.target ?? '';

      return { translatedText, provider: 'BHASHINI', sourceLanguage: request.sourceLanguage, targetLanguage: request.targetLanguage };
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Bhashini')) throw error;
      throw new Error('Bhashini translation service unavailable.');
    }
  }

  async transliterate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    const apiKey = this.configService.get<string>('BHASHINI_API_KEY');
    const baseUrl = this.configService.get<string>('BHASHINI_BASE_URL') ?? 'https://dhruva-api.bhashini.gov.in';

    if (!apiKey) throw new Error('Bhashini API key is not configured.');

    const response = await fetch(`${baseUrl}/services/inference/transliteration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
      body: JSON.stringify({
        pipelineTasks: [{ taskType: 'transliteration', config: { language: { sourceLanguage, targetLanguage } } }],
        inputData: { input: [{ source: text }] },
      }),
    });

    if (!response.ok) throw new Error('Bhashini transliteration failed.');
    const data = await response.json();
    return data?.pipelineResponse?.[0]?.output?.[0]?.target ?? text;
  }

  isConfigured(): boolean {
    return !!this.configService.get<string>('BHASHINI_API_KEY');
  }

  getCapabilities() {
    return {
      supportsTextTranslation: true,
      supportsBatchTranslation: true,
      supportsTransliteration: true,
      supportsTTS: false,
      supportsASR: false,
      supportsOCR: false,
      supportsIndianLanguages: true,
      supportedLanguages: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'sa'],
    };
  }
}
