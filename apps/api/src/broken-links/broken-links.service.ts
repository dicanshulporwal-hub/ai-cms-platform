import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LinkExtractionService, ContentLinks } from './link-extraction.service';
import { LinkCheckerService } from './link-checker.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class BrokenLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly extractor: LinkExtractionService,
    private readonly checker: LinkCheckerService,
  ) {}

  async runFullSiteScan(user: AuthenticatedUser) {
    const settings = await this.getOrCreateSettings();
    const scan = await this.prisma.brokenLinkScan.create({
      data: { scanType: 'FULL_SITE', status: 'PROCESSING', startedById: user.id, startedAt: new Date() },
    });

    try {
      const allContent: ContentLinks[] = [];

      // Extract links from published pages
      const pages = await this.prisma.page.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { id: true, title: true, slug: true, content: true } });
      for (const page of pages) {
        if (page.content) {
          allContent.push(this.extractor.extractFromHtml(page.content, 'PAGE', page.id, page.title, `/pages/${page.slug}`));
        }
      }

      // Extract links from published blogs
      const blogs = await this.prisma.blogPost.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { id: true, title: true, slug: true, content: true } });
      for (const blog of blogs) {
        if (blog.content) {
          allContent.push(this.extractor.extractFromHtml(blog.content, 'BLOG', blog.id, blog.title, `/blog/${blog.slug}`));
        }
      }

      // Extract links from published FAQs
      const faqs = await this.prisma.faq.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { id: true, question: true, answer: true } });
      for (const faq of faqs) {
        allContent.push(this.extractor.extractFromHtml(faq.answer, 'FAQ', faq.id, faq.question, `/faqs`));
      }

      // Check all links
      let totalLinks = 0;
      let brokenCount = 0;
      let warningCount = 0;
      let externalChecked = 0;

      for (const content of allContent) {
        for (const link of content.links) {
          totalLinks++;

          // Limit external checks
          if (link.linkType === 'EXTERNAL' && externalChecked >= settings.maxExternalLinksPerScan) continue;
          if (link.linkType === 'EXTERNAL') externalChecked++;

          const result = await this.checker.checkLink(link, settings);

          if (result.issueType) {
            if (result.severity === 'LOW' || result.issueType === 'REDIRECT' || result.issueType === 'TIMEOUT') {
              warningCount++;
            } else {
              brokenCount++;
            }

            await this.prisma.brokenLinkIssue.create({
              data: {
                scanId: scan.id,
                sourceType: content.sourceType,
                sourceId: content.sourceId,
                sourceTitle: content.sourceTitle,
                sourceUrl: content.sourceUrl,
                linkUrl: link.linkUrl,
                linkText: link.linkText || null,
                linkType: link.linkType as any,
                issueType: result.issueType as any,
                statusCode: result.statusCode,
                severity: result.severity as any,
                recommendation: result.recommendation,
              },
            });
          }
        }
      }

      // Complete scan
      await this.prisma.brokenLinkScan.update({
        where: { id: scan.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          totalLinksScanned: totalLinks,
          brokenLinksFound: brokenCount,
          warningLinksFound: warningCount,
          summaryJson: { pagesScanned: pages.length, blogsScanned: blogs.length, faqsScanned: faqs.length, externalChecked } as unknown as Prisma.InputJsonValue,
        },
      });

      await this.prisma.auditLog.create({ data: { action: 'broken_links.scan_completed', entityId: scan.id, entityType: 'BrokenLinkScan', userId: user.id, metadata: { totalLinks, brokenCount } as unknown as Prisma.InputJsonValue } });

      return this.getScan(scan.id);
    } catch (err) {
      await this.prisma.brokenLinkScan.update({ where: { id: scan.id }, data: { status: 'FAILED', errorMessage: err instanceof Error ? err.message : 'Scan failed.' } });
      throw err;
    }
  }

  async getScan(id: string) {
    const scan = await this.prisma.brokenLinkScan.findUnique({ where: { id }, include: { issues: { orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }] } } });
    if (!scan) throw new NotFoundException('Scan not found.');
    return scan;
  }

  async listScans() {
    return this.prisma.brokenLinkScan.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { _count: { select: { issues: true } } } });
  }

  async getSummary() {
    const latestScan = await this.prisma.brokenLinkScan.findFirst({ where: { status: 'COMPLETED' }, orderBy: { createdAt: 'desc' } });
    const totalScans = await this.prisma.brokenLinkScan.count();
    const openIssues = await this.prisma.brokenLinkIssue.count({ where: { status: 'OPEN' } });
    const criticalIssues = await this.prisma.brokenLinkIssue.count({ where: { status: 'OPEN', severity: 'CRITICAL' } });
    return { latestScan: latestScan ? { id: latestScan.id, score: latestScan.totalLinksScanned > 0 ? Math.round(((latestScan.totalLinksScanned - latestScan.brokenLinksFound) / latestScan.totalLinksScanned) * 100) : 100, brokenLinks: latestScan.brokenLinksFound, totalLinks: latestScan.totalLinksScanned, date: latestScan.completedAt } : null, totalScans, openIssues, criticalIssues };
  }

  async listIssues(filters?: { severity?: string; issueType?: string; status?: string }) {
    const where: any = {};
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.issueType) where.issueType = filters.issueType;
    if (filters?.status) where.status = filters.status;
    else where.status = 'OPEN';
    return this.prisma.brokenLinkIssue.findMany({ where, orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }], take: 100 });
  }

  async updateIssueStatus(id: string, status: string) {
    return this.prisma.brokenLinkIssue.update({ where: { id }, data: { status: status as any } });
  }

  async getOrCreateSettings() {
    const existing = await this.prisma.brokenLinkSettings.findFirst();
    if (existing) return existing;
    return this.prisma.brokenLinkSettings.create({ data: { id: 'default_broken_link_settings' } });
  }
}
