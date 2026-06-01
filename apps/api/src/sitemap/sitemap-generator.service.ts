import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: number;
}

@Injectable()
export class SitemapGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getBaseUrl(): string {
    // Use PUBLIC_WEB_URL from environment (the public website URL)
    return (this.configService.get<string>('PUBLIC_WEB_URL') || 'http://localhost:3002').replace(/\/$/, '');
  }

  async generate(): Promise<{ xml: string; entries: SitemapUrl[]; warnings: string[] }> {
    const settings = await this.getOrCreateSettings();
    const warnings: string[] = [];
    const entries: SitemapUrl[] = [];

    const baseUrl = this.getBaseUrl();

    // Homepage
    entries.push({ loc: baseUrl + '/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 1.0 });

    // Pages
    if (settings.includePages) {
      const pages = await this.prisma.page.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { slug: true, updatedAt: true } });
      for (const page of pages) {
        entries.push({ loc: `${baseUrl}/pages/${page.slug}`, lastmod: page.updatedAt.toISOString().split('T')[0], changefreq: settings.defaultChangefreq.toLowerCase(), priority: 0.8 });
      }
      if (pages.length === 0) warnings.push('No published pages found.');
    }

    // Blogs
    if (settings.includeBlogs) {
      entries.push({ loc: `${baseUrl}/blog`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.7 });
      const blogs = await this.prisma.blogPost.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { slug: true, updatedAt: true } });
      for (const blog of blogs) {
        entries.push({ loc: `${baseUrl}/blog/${blog.slug}`, lastmod: blog.updatedAt.toISOString().split('T')[0], changefreq: settings.defaultChangefreq.toLowerCase(), priority: 0.6 });
      }
    }

    // Documents
    if (settings.includeDocuments) {
      entries.push({ loc: `${baseUrl}/documents`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.5 });
    }

    // FAQs
    if (settings.includeFaqs) {
      entries.push({ loc: `${baseUrl}/faqs`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.5 });
    }

    // Manual entries
    const manualEntries = await this.prisma.sitemapEntry.findMany({ where: { isManual: true, isEnabled: true } });
    for (const entry of manualEntries) {
      entries.push({ loc: entry.url.startsWith('http') ? entry.url : `${baseUrl}${entry.url}`, lastmod: entry.lastmod?.toISOString().split('T')[0], changefreq: entry.changefreq.toLowerCase(), priority: entry.priority });
    }

    // Check for duplicates
    const urls = entries.map(e => e.loc);
    const dupes = urls.filter((u, i) => urls.indexOf(u) !== i);
    if (dupes.length > 0) warnings.push(`${dupes.length} duplicate URL(s) found.`);

    // Generate XML
    const xml = this.buildXml(entries);

    // Update last generated
    await this.prisma.sitemapSettings.update({ where: { id: settings.id }, data: { lastGeneratedAt: new Date() } });

    return { xml, entries, warnings };
  }

  async getRobotsText(): Promise<string> {
    const robots = await this.getOrCreateRobots();
    if (robots.robotsContent) return robots.robotsContent;

    const baseUrl = this.getBaseUrl();
    const lines: string[] = ['User-agent: *'];

    if (robots.allowAll) {
      lines.push('Allow: /');
    }
    if (robots.disallowAdmin) {
      lines.push('Disallow: /admin');
      lines.push('Disallow: /dashboard');
      lines.push('Disallow: /login');
    }
    if (robots.disallowApi) {
      lines.push('Disallow: /api');
    }
    if (robots.disallowPrivateRoutes) {
      lines.push('Disallow: /settings');
      lines.push('Disallow: /users');
      lines.push('Disallow: /roles');
      lines.push('Disallow: /workflow');
    }
    if (robots.includeSitemapUrl) {
      lines.push('');
      lines.push(`Sitemap: ${baseUrl}/sitemap.xml`);
    }

    return lines.join('\n');
  }

  private buildXml(entries: SitemapUrl[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const entry of entries) {
      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXml(entry.loc)}</loc>\n`;
      if (entry.lastmod) xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      xml += '  </url>\n';
    }
    xml += '</urlset>';
    return xml;
  }

  private escapeXml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async getOrCreateSettings() {
    const existing = await this.prisma.sitemapSettings.findFirst();
    if (existing) return existing;
    return this.prisma.sitemapSettings.create({ data: { id: 'default_sitemap_settings' } });
  }

  async getOrCreateRobots() {
    const existing = await this.prisma.robotsSettings.findFirst();
    if (existing) return existing;
    return this.prisma.robotsSettings.create({ data: { id: 'default_robots_settings' } });
  }
}
