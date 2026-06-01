import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { ComplianceCheckerService } from './compliance-checker.service';
import { AITemplateService } from './ai-template.service';
import { TemplateLayoutService } from './template-layout.service';
import { TemplateLayoutController } from './template-layout.controller';
import { TemplateModuleRegistryService } from './template-module-registry.service';
import { TemplateModuleRegistryController } from './template-module-registry.controller';
import { PublicTemplateController } from './public-template.controller';
import { TemplateSeedService } from './template-seed.service';
import { TemplateImportController } from './template-import.controller';
import { TemplateImportService } from './template-import.service';
import { HtmlTemplateAnalyzerService } from './html-template-analyzer.service';
import { HtmlToCmsConverterService } from './html-to-cms-converter.service';

@Module({
  imports: [ConfigModule, AiModule],
  controllers: [
    TemplatesController,
    TemplateLayoutController,
    TemplateModuleRegistryController,
    PublicTemplateController,
    TemplateImportController,
  ],
  providers: [
    TemplatesService,
    ComplianceCheckerService,
    AITemplateService,
    TemplateLayoutService,
    TemplateModuleRegistryService,
    TemplateSeedService,
    TemplateImportService,
    HtmlTemplateAnalyzerService,
    HtmlToCmsConverterService,
  ],
})
export class TemplatesModule {}
