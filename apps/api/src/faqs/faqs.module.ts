import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { FaqsController } from './faqs.controller';
import { FaqsService } from './faqs.service';
import { FaqCategoriesController } from './faq-categories.controller';
import { FaqCategoriesService } from './faq-categories.service';
import { FaqAIService } from './faq-ai.service';
import { PublicFaqsController } from './public-faqs.controller';

@Module({
  imports: [ConfigModule, AiModule],
  controllers: [FaqsController, FaqCategoriesController, PublicFaqsController],
  providers: [FaqsService, FaqCategoriesService, FaqAIService],
})
export class FaqsModule {}
