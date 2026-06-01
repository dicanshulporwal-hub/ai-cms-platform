import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import type { ExtractedLink } from './link-extraction.service';

export interface LinkCheckResult {
  linkUrl: string;
  linkText: string;
  linkType: string;
  issueType: string | null;
  statusCode: number | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string | null;
}

@Injectable()
export class LinkCheckerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async checkLink(link: ExtractedLink, settings: { checkExternalLinks: boolean; externalRequestTimeoutMs: number; maxExternalLinksPerScan: number; userAgent: string }): Promise<LinkCheckResult> {
    const result: LinkCheckResult = { linkUrl: link.linkUrl, linkText: link.linkText, linkType: link.linkType, issueType: null, statusCode: null, severity: 'MEDIUM', recommendation: null };

    try {
      if (link.linkType === 'ANCHOR') {
        // Anchors are hard to validate without full DOM, mark as low priority
        result.issueType = null; // Skip for now
        return result;
      }

      if (link.linkType === 'INTERNAL' || link.linkUrl.startsWith('/')) {
        return this.checkInternalLink(link, result);
      }

      if (link.linkType === 'EXTERNAL' && settings.checkExternalLinks) {
        return this.checkExternalLink(link, result, settings);
      }

      if (link.linkType === 'IMAGE') {
        return this.checkImageLink(link, result, settings);
      }

      if (link.linkType === 'DOCUMENT_LINK') {
        return this.checkDocumentLink(link, result);
      }
    } catch (err) {
      result.issueType = 'UNKNOWN';
      result.severity = 'LOW';
      result.recommendation = 'Could not verify this link. Check manually.';
    }

    return result;
  }

  private async checkInternalLink(link: ExtractedLink, result: LinkCheckResult): Promise<LinkCheckResult> {
    const url = link.linkUrl;

    // Check for disabled module routes
    if (url.startsWith('/blog')) {
      const blogModule = await this.prisma.cmsModule.findUnique({ where: { moduleKey: 'blogs' } });
      if (blogModule && !blogModule.isEnabledGlobally) {
        result.issueType = 'DISABLED_MODULE';
        result.severity = 'HIGH';
        result.recommendation = 'Blog module is disabled. This link will not work on the public site.';
        return result;
      }
    }

    if (url.startsWith('/documents')) {
      const docModule = await this.prisma.cmsModule.findUnique({ where: { moduleKey: 'documents' } });
      if (docModule && !docModule.isEnabledGlobally) {
        result.issueType = 'DISABLED_MODULE';
        result.severity = 'HIGH';
        result.recommendation = 'Documents module is disabled. This link will not work.';
        return result;
      }
    }

    if (url.startsWith('/faqs')) {
      const faqModule = await this.prisma.cmsModule.findUnique({ where: { moduleKey: 'faqs' } });
      if (faqModule && !faqModule.isEnabledGlobally) {
        result.issueType = 'DISABLED_MODULE';
        result.severity = 'HIGH';
        result.recommendation = 'FAQ module is disabled. This link will not work.';
        return result;
      }
    }

    // Check if it's a page link
    const pageSlugMatch = url.match(/^\/pages\/([^/?#]+)/);
    if (pageSlugMatch) {
      const page = await this.prisma.page.findUnique({ where: { slug: pageSlugMatch[1] } });
      if (!page || page.deletedAt) {
        result.issueType = 'NOT_FOUND';
        result.severity = 'HIGH';
        result.recommendation = `Page "${pageSlugMatch[1]}" does not exist. Create it or update the link.`;
        return result;
      }
      if (page.status !== 'PUBLISHED') {
        result.issueType = 'UNPUBLISHED_CONTENT';
        result.severity = 'MEDIUM';
        result.recommendation = `Page "${pageSlugMatch[1]}" is not published (status: ${page.status}). Publish it or remove the link.`;
        return result;
      }
    }

    // Check blog links
    const blogSlugMatch = url.match(/^\/blog\/([^/?#]+)/);
    if (blogSlugMatch) {
      const blog = await this.prisma.blogPost.findUnique({ where: { slug: blogSlugMatch[1] } });
      if (!blog || blog.deletedAt) {
        result.issueType = 'NOT_FOUND';
        result.severity = 'HIGH';
        result.recommendation = `Blog post "${blogSlugMatch[1]}" does not exist.`;
        return result;
      }
      if (blog.status !== 'PUBLISHED') {
        result.issueType = 'UNPUBLISHED_CONTENT';
        result.severity = 'MEDIUM';
        result.recommendation = `Blog post "${blogSlugMatch[1]}" is not published.`;
        return result;
      }
    }

    return result; // No issue found
  }

  private async checkExternalLink(link: ExtractedLink, result: LinkCheckResult, settings: any): Promise<LinkCheckResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), settings.externalRequestTimeoutMs);

      const response = await fetch(link.linkUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': settings.userAgent },
        redirect: 'follow',
      });
      clearTimeout(timeout);

      result.statusCode = response.status;

      if (response.status >= 400) {
        result.issueType = response.status === 404 ? 'NOT_FOUND' : 'SERVER_ERROR';
        result.severity = response.status === 404 ? 'MEDIUM' : 'HIGH';
        result.recommendation = `External link returned ${response.status}. Verify the URL is correct or remove it.`;
      } else if (response.redirected) {
        result.issueType = 'REDIRECT';
        result.severity = 'LOW';
        result.statusCode = 301;
        result.recommendation = 'Link redirects. Consider updating to the final URL.';
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        result.issueType = 'TIMEOUT';
        result.severity = 'LOW';
        result.recommendation = 'External link timed out. The site may be slow or blocking requests.';
      } else {
        result.issueType = 'BLOCKED';
        result.severity = 'LOW';
        result.recommendation = 'Could not reach external URL. It may be blocking automated requests.';
      }
    }
    return result;
  }

  private async checkImageLink(link: ExtractedLink, result: LinkCheckResult, settings: any): Promise<LinkCheckResult> {
    if (link.linkUrl.startsWith('http')) {
      // External image - quick HEAD check
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), settings.externalRequestTimeoutMs);
        const response = await fetch(link.linkUrl, { method: 'HEAD', signal: controller.signal, headers: { 'User-Agent': settings.userAgent } });
        clearTimeout(timeout);
        result.statusCode = response.status;
        if (response.status >= 400) {
          result.issueType = 'MISSING_MEDIA';
          result.severity = 'HIGH';
          result.recommendation = 'Image not found. Upload a replacement or fix the URL.';
        }
      } catch {
        result.issueType = 'MISSING_MEDIA';
        result.severity = 'MEDIUM';
        result.recommendation = 'Could not verify image. Check the URL manually.';
      }
    } else {
      // Internal image - check media library
      const fileName = link.linkUrl.split('/').pop();
      if (fileName) {
        const media = await this.prisma.media.findFirst({ where: { fileName, deletedAt: null } });
        if (!media) {
          result.issueType = 'MISSING_MEDIA';
          result.severity = 'HIGH';
          result.recommendation = 'Image not found in media library. Upload it or fix the URL.';
        }
      }
    }
    return result;
  }

  private async checkDocumentLink(link: ExtractedLink, result: LinkCheckResult): Promise<LinkCheckResult> {
    // Check if it's an internal document link
    const docSlugMatch = link.linkUrl.match(/\/documents\/([^/?#]+)/);
    if (docSlugMatch) {
      const doc = await this.prisma.document.findUnique({ where: { slug: docSlugMatch[1] } });
      if (!doc || doc.deletedAt) {
        result.issueType = 'NOT_FOUND';
        result.severity = 'CRITICAL';
        result.recommendation = 'Document not found. Upload the document or fix the link.';
      } else if (doc.status !== 'PUBLISHED') {
        result.issueType = 'UNPUBLISHED_CONTENT';
        result.severity = 'HIGH';
        result.recommendation = 'Document is not published. Publish it or remove the link.';
      }
    }
    return result;
  }
}
