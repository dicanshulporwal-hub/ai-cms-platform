import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { ComplianceCheckerService } from './compliance-checker.service';
import { AITemplateService } from './ai-template.service';

@Module({
  imports: [ConfigModule, AiModule],
  controllers: [TemplatesController],
  providers: [TemplatesService, ComplianceCheckerService, AITemplateService],
})
export class TemplatesModule {}
