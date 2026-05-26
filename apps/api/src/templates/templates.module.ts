import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { ComplianceCheckerService } from './compliance-checker.service';
import { AITemplateService } from './ai-template.service';

@Module({
  imports: [ConfigModule],
  controllers: [TemplatesController],
  providers: [TemplatesService, ComplianceCheckerService, AITemplateService],
})
export class TemplatesModule {}
