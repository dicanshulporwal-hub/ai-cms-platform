import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchemaGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getBaseUrl(): string {
    return (this.configService.get<string>('PUBLIC_WEB_URL') || 'http://localhost:3002').replace(/\/$/, '');
  }

  async generateGlobalSchema(): Promise<object[]> {
    const settings = await this.getOrCreateSettings();
    const schemas: object[] = [];
    const baseUrl = this.getBaseUrl();
    const siteSettings = await this.prisma.settings.findFirst();
    const siteName = siteSettings?.siteName || 'AI CMS';
    const siteDescription = siteSettings?.siteDescription || '';

    if (settings.enableGlobalSchema) {
      // Website schema
      const websiteSchema: any = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: baseUrl,
        description: siteDescription,
      };
      if (settings.enableSearchActionSchema) {
        websiteSchema.potentialAction = {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${baseUrl}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        };
      }
      schemas.push(websiteSchema);

      // Organization schema
      const orgSchema: any = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: settings.defaultPublisherName || siteName,
        url: baseUrl,
      };
      if (settings.defaultPublisherLogo) {
        orgSchema.logo = { '@type': 'ImageObject', url: settings.defaultPublisherLogo };
      }
      if (siteSettings?.supportEmail) {
        orgSchema.contactPoint = { '@type': 'ContactPoint', email: siteSettings.supportEmail, contactType: 'customer service' };
      }
      schemas.push(orgSchema);
    }

    return schemas;
  }

  async generatePageSchema(pageId: string): Promise<object | null> {
    const settings = await this.getOrCreateSettings();
    if (!settings.enablePageSchema) return null;

    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page || page.status !== 'PUBLISHED' || page.deletedAt) return null;

    const baseUrl = this.getBaseUrl();
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.metaTitle || page.title,
      description: page.metaDescription || page.excerpt || '',
      url: `${baseUrl}/pages/${page.slug}`,
      datePublished: page.publishedAt?.toISOString(),
      dateModified: page.updatedAt.toISOString(),
      ...(page.featuredImage ? { image: page.featuredImage } : {}),
    };
  }

  async generateBlogSchema(blogId: string): Promise<object | null> {
    const settings = await this.getOrCreateSettings();
    if (!settings.enableBlogSchema) return null;

    const blog = await this.prisma.blogPost.findUnique({ where: { id: blogId }, include: { author: { select: { name: true } } } });
    if (!blog || blog.status !== 'PUBLISHED' || blog.deletedAt) return null;

    const baseUrl = this.getBaseUrl();
    const siteSettings = await this.prisma.settings.findFirst();

    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt || '',
      url: `${baseUrl}/blog/${blog.slug}`,
      datePublished: blog.publishedAt?.toISOString(),
      dateModified: blog.updatedAt.toISOString(),
      ...(blog.featuredImage ? { image: blog.featuredImage } : {}),
      author: { '@type': 'Person', name: blog.author?.name || 'Unknown' },
      publisher: {
        '@type': 'Organization',
        name: settings.defaultPublisherName || siteSettings?.siteName || 'AI CMS',
        ...(settings.defaultPublisherLogo ? { logo: { '@type': 'ImageObject', url: settings.defaultPublisherLogo } } : {}),
      },
    };
  }

  async generateFaqSchema(): Promise<object | null> {
    const settings = await this.getOrCreateSettings();
    if (!settings.enableFaqSchema) return null;

    const faqs = await this.prisma.faq.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, orderBy: { sortOrder: 'asc' }, take: 50 });
    if (faqs.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer.replace(/<[^>]*>/g, '').substring(0, 500) },
      })),
    };
  }

  async generateBreadcrumbSchema(items: { name: string; url: string }[]): Promise<object> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  async getPublicSchemaForSource(sourceType: string, sourceId: string): Promise<object[]> {
    // Check for manually created/active entries first
    const entries = await this.prisma.structuredDataEntry.findMany({
      where: { sourceType: sourceType as any, sourceId, status: 'ACTIVE', deletedAt: null },
    });
    if (entries.length > 0) {
      return entries.map(e => e.schemaJson as object);
    }

    // Auto-generate based on source type
    switch (sourceType) {
      case 'PAGE': {
        const schema = await this.generatePageSchema(sourceId);
        return schema ? [schema] : [];
      }
      case 'BLOG': {
        const schema = await this.generateBlogSchema(sourceId);
        return schema ? [schema] : [];
      }
      case 'FAQ': {
        const schema = await this.generateFaqSchema();
        return schema ? [schema] : [];
      }
      default:
        return [];
    }
  }

  async getOrCreateSettings() {
    const existing = await this.prisma.structuredDataSettings.findFirst();
    if (existing) return existing;
    return this.prisma.structuredDataSettings.create({ data: { id: 'default_schema_settings' } });
  }

  validateSchema(schemaJson: any): { status: string; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!schemaJson || typeof schemaJson !== 'object') {
      errors.push('Schema must be a valid JSON object.');
      return { status: 'INVALID', errors, warnings };
    }
    if (!schemaJson['@context']) errors.push('Missing @context field.');
    if (!schemaJson['@type']) errors.push('Missing @type field.');
    if (schemaJson['@context'] && schemaJson['@context'] !== 'https://schema.org') {
      warnings.push('@context should be "https://schema.org".');
    }

    // Check for private data leaks
    const jsonStr = JSON.stringify(schemaJson);
    if (/\/admin/i.test(jsonStr)) warnings.push('Schema contains admin URL reference.');
    if (/\/api\//i.test(jsonStr)) warnings.push('Schema contains API URL reference.');
    if (/password|secret|token/i.test(jsonStr)) errors.push('Schema may contain sensitive data.');

    return { status: errors.length > 0 ? 'INVALID' : warnings.length > 0 ? 'WARNING' : 'VALID', errors, warnings };
  }
}
