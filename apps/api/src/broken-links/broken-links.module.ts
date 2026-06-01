import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrokenLinksController } from './broken-links.controller';
import { BrokenLinksService } from './broken-links.service';
import { LinkExtractionService } from './link-extraction.service';
import { LinkCheckerService } from './link-checker.service';

@Module({
  imports: [ConfigModule],
  controllers: [BrokenLinksController],
  providers: [BrokenLinksService, LinkExtractionService, LinkCheckerService],
  exports: [BrokenLinksService],
})
export class BrokenLinksModule {}
