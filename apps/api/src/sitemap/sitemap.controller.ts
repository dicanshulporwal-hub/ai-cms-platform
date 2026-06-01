import { Body, Controller, Delete, Get, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { SitemapGeneratorService } from './sitemap-generator.service';

@ApiTags('Sitemap & Robots')
@Controller()
export class SitemapController {
  constructor(
    private readonly generator: SitemapGeneratorService,
    private readonly prisma: PrismaService,
  ) {}

  // === PUBLIC ENDPOINTS ===

  @Get('sitemap.xml')
  @ApiOperation({ summary: 'Public sitemap.xml endpoint.' })
  async publicSitemap(@Res() res: Response) {
    const { xml } = await this.generator.generate();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  }

  @Get('robots.txt')
  @ApiOperation({ summary: 'Public robots.txt endpoint.' })
  async publicRobots(@Res() res: Response) {
    const text = await this.generator.getRobotsText();
    res.set('Content-Type', 'text/plain');
    res.send(text);
  }

  // === ADMIN SITEMAP SETTINGS ===

  @Get('sitemap/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get sitemap settings.' })
  async getSettings() {
    return this.generator.getOrCreateSettings();
  }

  @Put('sitemap/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update sitemap settings.' })
  async updateSettings(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    const settings = await this.generator.getOrCreateSettings();
    const updated = await this.prisma.sitemapSettings.update({ where: { id: settings.id }, data: body });
    await this.prisma.auditLog.create({ data: { action: 'sitemap.settings_updated', entityId: settings.id, entityType: 'SitemapSettings', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return updated;
  }

  @Post('sitemap/generate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Generate sitemap.' })
  async generateSitemap(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.generator.generate();
    await this.prisma.auditLog.create({ data: { action: 'sitemap.generated', entityId: 'sitemap', entityType: 'SitemapSettings', userId: user.id, metadata: { urlCount: result.entries.length } as unknown as Prisma.InputJsonValue } });
    return result;
  }

  @Get('sitemap/preview')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Preview sitemap XML.' })
  async previewSitemap() {
    return this.generator.generate();
  }

  // === SITEMAP ENTRIES ===

  @Get('sitemap/entries')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List sitemap entries.' })
  async listEntries() {
    return this.prisma.sitemapEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  }

  @Post('sitemap/entries')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create manual sitemap entry.' })
  async createEntry(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    const entry = await this.prisma.sitemapEntry.create({ data: { ...body, isManual: true, sourceType: 'MANUAL' } });
    await this.prisma.auditLog.create({ data: { action: 'sitemap.entry_created', entityId: entry.id, entityType: 'SitemapEntry', userId: user.id, metadata: { url: body.url } as unknown as Prisma.InputJsonValue } });
    return entry;
  }

  @Put('sitemap/entries/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update sitemap entry.' })
  async updateEntry(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    const entry = await this.prisma.sitemapEntry.update({ where: { id }, data: body });
    await this.prisma.auditLog.create({ data: { action: 'sitemap.entry_updated', entityId: id, entityType: 'SitemapEntry', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return entry;
  }

  @Delete('sitemap/entries/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete sitemap entry.' })
  async deleteEntry(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.prisma.sitemapEntry.delete({ where: { id } });
    await this.prisma.auditLog.create({ data: { action: 'sitemap.entry_deleted', entityId: id, entityType: 'SitemapEntry', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return { message: 'Entry deleted.' };
  }

  // === ROBOTS SETTINGS ===

  @Get('robots/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get robots.txt settings.' })
  async getRobotsSettings() {
    return this.generator.getOrCreateRobots();
  }

  @Put('robots/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update robots.txt settings.' })
  async updateRobotsSettings(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    const robots = await this.generator.getOrCreateRobots();
    const updated = await this.prisma.robotsSettings.update({ where: { id: robots.id }, data: body });
    await this.prisma.auditLog.create({ data: { action: 'robots.settings_updated', entityId: robots.id, entityType: 'RobotsSettings', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return updated;
  }

  @Get('robots/preview')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Preview robots.txt content.' })
  async previewRobots() {
    const text = await this.generator.getRobotsText();
    return { content: text };
  }

  // === SEO CRAWL RULES ===

  @Get('seo-crawl-rules')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List SEO crawl rules.' })
  async listCrawlRules() {
    return this.prisma.seoCrawlRule.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('seo-crawl-rules')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create SEO crawl rule.' })
  async createCrawlRule(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    const rule = await this.prisma.seoCrawlRule.create({ data: body });
    await this.prisma.auditLog.create({ data: { action: 'crawl_rule.created', entityId: rule.id, entityType: 'SeoCrawlRule', userId: user.id, metadata: { routePattern: body.routePattern } as unknown as Prisma.InputJsonValue } });
    return rule;
  }

  @Put('seo-crawl-rules/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update SEO crawl rule.' })
  async updateCrawlRule(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    const rule = await this.prisma.seoCrawlRule.update({ where: { id }, data: body });
    await this.prisma.auditLog.create({ data: { action: 'crawl_rule.updated', entityId: id, entityType: 'SeoCrawlRule', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return rule;
  }

  @Delete('seo-crawl-rules/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete SEO crawl rule.' })
  async deleteCrawlRule(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.prisma.seoCrawlRule.delete({ where: { id } });
    await this.prisma.auditLog.create({ data: { action: 'crawl_rule.deleted', entityId: id, entityType: 'SeoCrawlRule', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return { message: 'Rule deleted.' };
  }
}
