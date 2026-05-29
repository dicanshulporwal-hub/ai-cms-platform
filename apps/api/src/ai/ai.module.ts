import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiProvidersController } from './ai-providers.controller';
import { AiProvidersService } from './ai-providers.service';
import { AiRouterService } from './ai-router.service';
import { AI_PROVIDER_CLIENT } from './providers/ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';

@Module({
  controllers: [AiController, AiProvidersController],
  imports: [PrismaModule],
  providers: [
    AiService,
    AiProvidersService,
    AiRouterService,
    GeminiProvider,
    OpenAiProvider,
    {
      provide: AI_PROVIDER_CLIENT,
      inject: [ConfigService, OpenAiProvider, GeminiProvider],
      useFactory: (
        configService: ConfigService,
        openAiProvider: OpenAiProvider,
        geminiProvider: GeminiProvider,
      ) => {
        const provider = (
          configService.get<string>('AI_PROVIDER') ?? 'openai'
        ).toLowerCase();

        if (provider === 'gemini') {
          return geminiProvider;
        }

        return openAiProvider;
      },
    },
  ],
  exports: [AI_PROVIDER_CLIENT, AiRouterService, GeminiProvider, OpenAiProvider],
})
export class AiModule {}
