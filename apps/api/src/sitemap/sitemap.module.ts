import { Module } from '@nestjs/common';
import { SitemapController } from './sitemap.controller';
import { SitemapGeneratorService } from './sitemap-generator.service';

@Module({
  controllers: [SitemapController],
  providers: [SitemapGeneratorService],
  exports: [SitemapGeneratorService],
})
export class SitemapModule {}
