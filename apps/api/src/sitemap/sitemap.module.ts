import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SitemapController } from './sitemap.controller';
import { SitemapGeneratorService } from './sitemap-generator.service';

@Module({
  imports: [ConfigModule],
  controllers: [SitemapController],
  providers: [SitemapGeneratorService],
  exports: [SitemapGeneratorService],
})
export class SitemapModule {}
