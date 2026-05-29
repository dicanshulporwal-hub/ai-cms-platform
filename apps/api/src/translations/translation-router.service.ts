import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AI_PROVIDER_CLIENT, AiProvider } from '../ai/providers/ai-provider.interface';
import { BhashiniProvider } from './providers/bhashini.provider';

const INDIAN_LANGUAGES = ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'sa'];

@Injectable()
export class TranslationRouterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly bhashiniProvider: BhashiniProvider,
    @Inject(AI_PROVIDER_CLIENT) private readonly aiProvider: AiProvider,
  ) {}

  async translate(request: { text: string; sourceLanguage: string; targetLanguage: string; providerKey?: string; selectionMode?: string; allowFallback?: boolean }) {
    const { text, sourceLanguage, targetLanguage, providerKey, selectionMode = 'AUTO', allowFallback = true } = request;

    let selectedProvider = providerKey?.toUpperCase();

    // Auto select: prefer Bhashini for Indian languages
    if (selectionMode === 'AUTO' && !selectedProvider) {
      if (INDIAN_LANGUAGES.includes(targetLanguage) || INDIAN_LANGUAGES.includes(sourceLanguage)) {
        if (this.bhashiniProvider.isConfigured()) selectedProvider = 'BHASHINI';
      }
      if (!selectedProvider) selectedProvider = 'AI'; // fallback to AI provider (Gemini/OpenAI)
    }

    try {
      if (selectedProvider === 'BHASHINI') {
        const result = await this.bhashiniProvider.translate({ text, sourceLanguage, targetLanguage });
        await this.logUsage('BHASHINI', 'TRANSLATION', sourceLanguage, targetLanguage, text.length, result.translatedText.length, 'SUCCESS');
        return { success: true, provider: 'BHASHINI', sourceLanguage, targetLanguage, data: { translatedText: result.translatedText }, usage: { inputLength: text.length, outputLength: result.translatedText.length } };
      }

      // Use AI provider (Gemini/OpenAI)
      const result = await this.aiProvider.generateText({
        systemPrompt: `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return ONLY the translated text, nothing else.`,
        userPrompt: text,
      });
      await this.logUsage(result.metadata.provider.toUpperCase(), 'TRANSLATION', sourceLanguage, targetLanguage, text.length, result.result.length, 'SUCCESS');
      return { success: true, provider: result.metadata.provider.toUpperCase(), sourceLanguage, targetLanguage, data: { translatedText: result.result }, usage: { inputLength: text.length, outputLength: result.result.length } };
    } catch (error) {
      // Fallback
      if (allowFallback && selectedProvider === 'BHASHINI') {
        try {
          const result = await this.aiProvider.generateText({ systemPrompt: `Translate from ${sourceLanguage} to ${targetLanguage}. Return ONLY translated text.`, userPrompt: text });
          await this.logUsage(result.metadata.provider.toUpperCase(), 'TRANSLATION', sourceLanguage, targetLanguage, text.length, result.result.length, 'SUCCESS');
          return { success: true, provider: result.metadata.provider.toUpperCase(), sourceLanguage, targetLanguage, data: { translatedText: result.result }, fallbackUsed: true, usage: { inputLength: text.length, outputLength: result.result.length } };
        } catch {}
      }
      await this.logUsage(selectedProvider ?? 'UNKNOWN', 'TRANSLATION', sourceLanguage, targetLanguage, text.length, 0, 'FAILED', error instanceof Error ? error.message : 'Unknown');
      return { success: false, provider: selectedProvider, sourceLanguage, targetLanguage, message: error instanceof Error ? error.message : 'Translation failed.' };
    }
  }

  async translateBatch(request: { texts: string[]; sourceLanguage: string; targetLanguage: string; providerKey?: string }) {
    const results = [];
    for (const text of request.texts) {
      const result = await this.translate({ text, sourceLanguage: request.sourceLanguage, targetLanguage: request.targetLanguage, providerKey: request.providerKey });
      results.push(result);
    }
    return { results, provider: results[0]?.provider, sourceLanguage: request.sourceLanguage, targetLanguage: request.targetLanguage };
  }

  async transliterate(request: { text: string; sourceLanguage: string; targetLanguage: string }) {
    if (!this.bhashiniProvider.isConfigured()) {
      return { success: false, message: 'Bhashini is not configured for transliteration.' };
    }
    try {
      const result = await this.bhashiniProvider.transliterate(request.text, request.sourceLanguage, request.targetLanguage);
      await this.logUsage('BHASHINI', 'TRANSLITERATION', request.sourceLanguage, request.targetLanguage, request.text.length, result.length, 'SUCCESS');
      return { success: true, provider: 'BHASHINI', data: { transliteratedText: result } };
    } catch (error) {
      return { success: false, provider: 'BHASHINI', message: error instanceof Error ? error.message : 'Transliteration failed.' };
    }
  }

  private async logUsage(providerKey: string, taskType: string, sourceLanguage: string, targetLanguage: string, inputLength: number, outputLength: number, status: string, errorMessage?: string) {
    await this.prisma.translationUsageLog.create({
      data: { providerKey, taskType, sourceLanguage, targetLanguage, inputLength, outputLength, status, errorMessage },
    });
  }
}
