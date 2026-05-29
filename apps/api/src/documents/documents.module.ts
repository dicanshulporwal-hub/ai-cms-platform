import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentCategoriesController } from './document-categories.controller';
import { DocumentCategoriesService } from './document-categories.service';
import { DocumentAIService } from './document-ai.service';
import { PublicDocumentsController } from './public-documents.controller';

@Module({
  imports: [ConfigModule, AiModule],
  controllers: [DocumentsController, DocumentCategoriesController, PublicDocumentsController],
  providers: [DocumentsService, DocumentCategoriesService, DocumentAIService],
})
export class DocumentsModule {}
