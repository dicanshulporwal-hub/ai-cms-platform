import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AccessibilityCheckService, CheckResult } from './accessibility-check.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class AccessibilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checker: AccessibilityCheckService,
  ) {}

  async listAudits(limit = 20) {
    return this.prisma.accessibilityAudit.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { _count: { select: { issues: true } } },
    });
  }

  async getAudit(id: string) {
    const audit = await this.prisma.accessibilityAudit.findUnique({
      where: { id },
      include: { issues: { orderBy: [{ severity: 'asc' }, { status: 'asc' }] } },
    });
    if (!audit) throw new NotFoundException('Audit not found.');
    return audit;
  }

  async runTemplateAudit(templateId: string, user: AuthenticatedUser) {
    const template = await this.prisma.websiteTemplate.findUnique({ where: { id: templateId } });
    if (!template || template.deletedAt) throw new NotFoundException('Template not found.');

    // Get template HTML from configJson or file
    const config = template.configJson as Record<string, unknown> | null;
    const html = (config?.previewHtml as string) || '';

    const results = this.checker.checkTemplateHtml(html);
    return this.saveAudit('TEMPLATE', 'TEMPLATE', templateId, null, results, user);
  }

  async runPageAudit(pageId: string, user: AuthenticatedUser) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page || page.deletedAt) throw new NotFoundException('Page not found.');

    const results = this.checker.checkPageContent({
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      featuredImage: page.featuredImage,
    });
    return this.saveAudit('PAGE', 'PAGE', pageId, null, results, user);
  }

  async runFullSiteAudit(user: AuthenticatedUser) {
    const allResults: CheckResult[] = [];

    // Check active template
    const activeTemplate = await this.prisma.websiteTemplate.findFirst({ where: { isActive: true, deletedAt: null } });
    if (activeTemplate) {
      const config = activeTemplate.configJson as Record<string, unknown> | null;
      const html = (config?.previewHtml as string) || '';
      allResults.push(...this.checker.checkTemplateHtml(html));
    }

    // Check published pages
    const pages = await this.prisma.page.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, take: 20, select: { id: true, title: true, content: true, metaTitle: true, metaDescription: true, featuredImage: true } });
    for (const page of pages) {
      allResults.push(...this.checker.checkPageContent({
        title: page.title, content: page.content,
        metaTitle: page.metaTitle, metaDescription: page.metaDescription,
        featuredImage: page.featuredImage,
      }));
    }

    return this.saveAudit('FULL_SITE', null, null, null, allResults, user);
  }

  async getSummary() {
    const latestAudit = await this.prisma.accessibilityAudit.findFirst({ orderBy: { createdAt: 'desc' } });
    const totalAudits = await this.prisma.accessibilityAudit.count();
    const criticalIssues = await this.prisma.accessibilityAuditIssue.count({ where: { severity: 'CRITICAL', status: 'FAIL' } });
    const totalIssues = await this.prisma.accessibilityAuditIssue.count({ where: { status: { in: ['FAIL', 'WARNING'] } } });

    return {
      latestScore: latestAudit?.score ?? null,
      latestAuditId: latestAudit?.id ?? null,
      latestAuditDate: latestAudit?.createdAt ?? null,
      totalAudits,
      criticalIssues,
      totalIssues,
    };
  }

  async getIssues(filters?: { severity?: string; category?: string; auditId?: string }) {
    const where: any = { status: { in: ['FAIL', 'WARNING'] } };
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.category) where.category = filters.category;
    if (filters?.auditId) where.auditId = filters.auditId;

    return this.prisma.accessibilityAuditIssue.findMany({
      where,
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
      take: 100,
      include: { audit: { select: { id: true, auditType: true, targetType: true, targetId: true } } },
    });
  }

  private async saveAudit(
    auditType: string, targetType: string | null, targetId: string | null,
    targetUrl: string | null, results: CheckResult[], user: AuthenticatedUser,
  ) {
    const score = this.checker.calculateScore(results);
    const passed = results.filter(r => r.status === 'PASS').length;
    const warnings = results.filter(r => r.status === 'WARNING').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const critical = results.filter(r => r.status === 'FAIL' && r.severity === 'CRITICAL').length;

    const audit = await this.prisma.accessibilityAudit.create({
      data: {
        auditType: auditType as any,
        targetType: targetType as any,
        targetId,
        targetUrl,
        status: 'COMPLETED',
        score,
        totalChecks: results.length,
        passedChecks: passed,
        warningChecks: warnings,
        failedChecks: failed,
        criticalIssues: critical,
        summaryJson: { categories: this.groupByCategory(results) } as unknown as Prisma.InputJsonValue,
        createdById: user.id,
      },
    });

    // Save issues (only non-passing)
    const issues = results.filter(r => r.status !== 'PASS');
    for (const issue of issues) {
      await this.prisma.accessibilityAuditIssue.create({
        data: {
          auditId: audit.id,
          checkKey: issue.checkKey,
          category: issue.category,
          severity: issue.severity as any,
          status: issue.status as any,
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
          targetSelector: issue.targetSelector || null,
          targetField: issue.targetField || null,
        },
      });
    }

    await this.prisma.auditLog.create({
      data: { action: 'accessibility.audit_completed', entityId: audit.id, entityType: 'AccessibilityAudit', userId: user.id, metadata: { score, auditType, totalChecks: results.length } as unknown as Prisma.InputJsonValue },
    });

    return this.getAudit(audit.id);
  }

  private groupByCategory(results: CheckResult[]) {
    const groups: Record<string, { pass: number; warning: number; fail: number }> = {};
    for (const r of results) {
      if (!groups[r.category]) groups[r.category] = { pass: 0, warning: 0, fail: 0 };
      groups[r.category][r.status === 'PASS' ? 'pass' : r.status === 'WARNING' ? 'warning' : 'fail']++;
    }
    return groups;
  }
}
