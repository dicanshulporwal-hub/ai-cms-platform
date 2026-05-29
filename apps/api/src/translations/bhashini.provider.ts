import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface TranslationResult {
  success: boolean;
  provider: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  error?: string;
}

const INDIAN_LANGUAGES = ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'sa'];

@Injectable()
export class BhashiniProvider {
  constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {}

  async translate(sourceLanguage: string, targetLanguage: string, text: string): Promise<TranslationResult> {
    const config = await this.getConfig();
    if (!config || !config.isEnabled) {
      return { success: false, provider: 'BHASHINI', sourceLanguage, targetLanguage, translatedText: '', error: 'Bhashini is not configured or disabled.' };
    }

    const apiKey = config.apiKeyEncrypted ? this.getApiKey(config) : this.configService.get<string>('BHASHINI_API_KEY');
    const baseUrl = config.baseUrl || this.configService.get<string>('BHASHINI_BASE_URL') || 'https://dhruva-api.bhashini.gov.in';
    const userId = config.userId || this.configService.get<string>('BHASHINI_USER_ID');

    if (!apiKey) {
      return { success: false, provider: 'BHASHINI', sourceLanguage, targetLanguage, translatedText: '', error: 'Bhashini API key not configured.' };
    }

    try {
      const response = await fetch(`${baseUrl}/services/inference/pipeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
          ...(userId ? { 'userID': userId } : {}),
        },
        body: JSON.stringify({
          pipelineTasks: [{ taskType: 'translation', config: { language: { sourceLanguage, targetLanguage } } }],
          inputData: { input: [{ source: text }] },
        }),
      });

      if (!response.ok) {
        const errData = await response.text().catch(() => '');
        return { success: false, provider: 'BHASHINI', sourceLanguage, targetLanguage, translatedText: '', error: `Bhashini API error: ${response.status}` };
      }

      const data = await response.json();
      const output = data?.pipelineResponse?.[0]?.output?.[0]?.target ?? '';
      return { success: true, provider: 'BHASHINI', sourceLanguage, targetLanguage, translatedText: output };
    } catch (error) {
      return { success: false, provider: 'BHASHINI', sourceLanguage, targetLanguage, translatedText: '', error: error instanceof Error ? error.message : 'Bhashini request failed.' };
    }
  }

  async transliterate(sourceLanguage: string, targetScript: string, text: string): Promise<TranslationResult> {
    const config = await this.getConfig();
    if (!config?.isEnabled) {
      return { success: false, provider: 'BHASHINI', sourceLanguage, targetLanguage: targetScript, translatedText: '', error: 'Bhashini not configured.' };
    }

    const apiKey = config.apiKeyEncrypted ? this.getApiKey(config) : this.configService.get<string>('BHASHINI_API_KEY');
    const baseUrl = config.baseUrl || this.configService.get<string>('BHASHINI_BASE_URL') || 'https://dhruva-api.bhashini.gov.in';

    if (!apiKey) {
      return { success: false, provider: 'BHASHINI', sourceLanguage, targetLanguage: targetScript, translatedText: '', error: 'API key not configured.' };
    }

    try {
      const response = await fetch(`${baseUrl}/services/inference/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
        body: JSON.stringify({
          pipelineTasks: [{ taskType: 'transliteration', config: { language: { sourceLanguage, sourceScriptCode: '', targetLanguage: targetScript } } }],
          inputData: { input: [{ source: text }] },
        }),
      });

      if (!response.ok) return { success: false, provider: 'BHASHINI', sourceLanguage, targetLanguage: targetScript, translatedText: '', error: `API error: ${response.status}` };
      const data = await response.json();
      const output = data?.pipelineResponse?.[0]?.output?.[0]?.target ?? '';
      return { success: true, provider: 'BHASHINI', sourceLanguage, targetLanguage: targetScript, translatedText: output };
    } catch (error) {
      return { success: false, provider: 'BHASHINI', sourceLanguage, targetLanguage: targetScript, translatedText: '', error: error instanceof Error ? error.message : 'Failed.' };
    }
  }

  isIndianLanguage(langCode: string): boolean {
    return INDIAN_LANGUAGES.includes(langCode);
  }

  getCapabilities() {
    return { supportsTextTranslation: true, supportsBatchTranslation: true, supportsTransliteration: true, supportsTTS: false, supportsASR: false, supportsOCR: false, supportsIndianLanguages: true, supportedLanguages: ['en', ...INDIAN_LANGUAGES] };
  }

  private async getConfig() {
    return this.prisma.languageProviderConfig.findUnique({ where: { providerKey: 'BHASHINI' } }).catch(() => null);
  }

  private getApiKey(config: any): string | null {
    // In production, decrypt. For now return env fallback.
    return this.configService.get<string>('BHASHINI_API_KEY') ?? null;
  }
}
