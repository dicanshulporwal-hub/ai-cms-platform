import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { ContentImporterController } from './content-importer.controller';
import { ContentImporterService } from './content-importer.service';
import { WebContentExtractionService } from './web-content-extraction.service';
import { WordExtractionService } from './word-extraction.service';

@Module({
  imports: [PrismaModule],
  controllers: [ContentImporterController],
  providers: [ContentImporterService, PermissionsGuard, WebContentExtractionService, WordExtractionService],
  exports: [ContentImporterService, WebContentExtractionService, WordExtractionService],
})
export class ContentImporterModule {}
