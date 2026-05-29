import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { TranslationsController } from './translations.controller';
import { TranslationRouterService } from './translation-router.service';
import { BhashiniProvider } from './providers/bhashini.provider';
import { LanguageProvidersController } from './language-providers.controller';
import { LanguageProvidersService } from './language-providers.service';

@Module({
  imports: [ConfigModule, AiModule],
  controllers: [TranslationsController, LanguageProvidersController],
  providers: [TranslationRouterService, BhashiniProvider, LanguageProvidersService],
  exports: [TranslationRouterService],
})
export class TranslationsModule {}
