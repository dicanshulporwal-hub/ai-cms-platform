import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class BackupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getBackupDir(): string {
    const dir = this.configService.get<string>('BACKUP_UPLOAD_DIR') || 'uploads/backups';
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  async createBackup(dto: { jobType: string; includeMedia?: boolean; includeTemplates?: boolean; includeUsers?: boolean; includeSettings?: boolean; includeSecrets?: boolean }, user: AuthenticatedUser) {
    // Security: only Super Admin can include secrets
    if (dto.includeSecrets && user.role !== 'Super Admin') {
      throw new BadRequestException('Only Super Admin can include secrets in backups.');
    }

    const job = await this.prisma.backupJob.create({
      data: {
        jobType: (dto.jobType || 'CONTENT_BACKUP') as any,
        status: 'BACKUP_PROCESSING',
        includeMedia: dto.includeMedia ?? false,
        includeTemplates: dto.includeTemplates ?? true,
        includeUsers: dto.includeUsers ?? false,
        includeSettings: dto.includeSettings ?? true,
        includeSecrets: dto.includeSecrets ?? false,
        createdById: user.id,
        startedAt: new Date(),
      },
    });

    try {
      const backupData: Record<string, any> = {};
      const manifest: any = {
        cmsName: 'AI-first CMS',
        backupVersion: '1.0.0',
        createdAt: new Date().toISOString(),
        createdBy: user.email,
        jobType: dto.jobType,
        includedModules: [],
      };

      // Export pages (paginated, select only needed fields)
      const pages = await this.prisma.page.findMany({
        where: { deletedAt: null },
        select: { id: true, title: true, slug: true, excerpt: true, content: true, status: true, metaTitle: true, metaDescription: true, featuredImage: true, publishedAt: true, createdAt: true, updatedAt: true },
        take: 1000,
      });
      backupData.pages = pages;
      manifest.includedModules.push('pages');

      // Export blogs
      const blogs = await this.prisma.blogPost.findMany({
        where: { deletedAt: null },
        select: { id: true, title: true, slug: true, excerpt: true, content: true, status: true, metaTitle: true, metaDescription: true, featuredImage: true, publishedAt: true, createdAt: true, updatedAt: true },
        take: 1000,
      });
      backupData.blogs = blogs;
      manifest.includedModules.push('blogs');

      // Export FAQs
      const faqs = await this.prisma.faq.findMany({
        where: { deletedAt: null },
        select: { id: true, question: true, answer: true, slug: true, status: true, sortOrder: true, createdAt: true },
        take: 1000,
      });
      backupData.faqs = faqs;
      manifest.includedModules.push('faqs');

      // Export categories/tags
      const categories = await this.prisma.category.findMany({ where: { deletedAt: null }, select: { id: true, name: true, slug: true, description: true }, take: 500 });
      const tags = await this.prisma.tag.findMany({ where: { deletedAt: null }, select: { id: true, name: true, slug: true }, take: 500 });
      backupData.categories = categories;
      backupData.tags = tags;

      // Export templates if selected
      if (dto.includeTemplates) {
        const templates = await this.prisma.websiteTemplate.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, slug: true, description: true, version: true, templateType: true, status: true, isActive: true, configJson: true, createdAt: true },
          take: 100,
        });
        backupData.templates = templates;
        manifest.includedModules.push('templates');
      }

      // Export settings if selected (mask secrets)
      if (dto.includeSettings) {
        const settings = await this.prisma.settings.findFirst();
        if (settings) {
          backupData.settings = { siteName: settings.siteName, siteDescription: settings.siteDescription, siteLogo: settings.siteLogo, defaultMetaTitle: settings.defaultMetaTitle, defaultMetaDescription: settings.defaultMetaDescription, supportEmail: settings.supportEmail, chatbotEnabled: settings.chatbotEnabled, aiEnabled: settings.aiEnabled, maintenanceMode: settings.maintenanceMode };
        }
        manifest.includedModules.push('settings');
      }

      // Write backup file
      const fileName = `backup-${job.id}-${Date.now()}.json`;
      const filePath = resolve(this.getBackupDir(), fileName);
      const backupPackage = { manifest, data: backupData };
      writeFileSync(filePath, JSON.stringify(backupPackage, null, 2));

      const fileSize = readFileSync(filePath).length;

      // Update job
      await this.prisma.backupJob.update({
        where: { id: job.id },
        data: { status: 'BACKUP_COMPLETED', fileName, fileKey: fileName, fileSize, completedAt: new Date() },
      });

      await this.prisma.auditLog.create({
        data: { action: 'backup.created', entityId: job.id, entityType: 'BackupJob', userId: user.id, metadata: { jobType: dto.jobType, fileSize } as unknown as Prisma.InputJsonValue },
      });

      return this.getJob(job.id);
    } catch (err) {
      await this.prisma.backupJob.update({ where: { id: job.id }, data: { status: 'BACKUP_FAILED', errorMessage: err instanceof Error ? err.message : 'Backup failed.' } });
      throw err;
    }
  }

  async getJob(id: string) {
    const job = await this.prisma.backupJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Backup job not found.');
    return job;
  }

  async listJobs() {
    return this.prisma.backupJob.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  }

  async downloadBackup(id: string, user: AuthenticatedUser) {
    const job = await this.getJob(id);
    if (job.status !== 'BACKUP_COMPLETED' || !job.fileKey) throw new BadRequestException('Backup not available for download.');

    const filePath = resolve(this.getBackupDir(), job.fileKey);
    if (!existsSync(filePath)) throw new NotFoundException('Backup file not found on disk.');

    await this.prisma.auditLog.create({
      data: { action: 'backup.downloaded', entityId: id, entityType: 'BackupJob', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue },
    });

    return { filePath, fileName: job.fileName };
  }

  async deleteJob(id: string, user: AuthenticatedUser) {
    const job = await this.getJob(id);
    // Delete file if exists
    if (job.fileKey) {
      const filePath = resolve(this.getBackupDir(), job.fileKey);
      if (existsSync(filePath)) unlinkSync(filePath);
    }
    await this.prisma.backupJob.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: { action: 'backup.deleted', entityId: id, entityType: 'BackupJob', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue },
    });
    return { message: 'Backup deleted.' };
  }

  async getSummary() {
    const [total, completed, failed] = await Promise.all([
      this.prisma.backupJob.count(),
      this.prisma.backupJob.count({ where: { status: 'BACKUP_COMPLETED' } }),
      this.prisma.backupJob.count({ where: { status: 'BACKUP_FAILED' } }),
    ]);
    const latest = await this.prisma.backupJob.findFirst({ where: { status: 'BACKUP_COMPLETED' }, orderBy: { completedAt: 'desc' }, select: { id: true, completedAt: true, fileSize: true, jobType: true } });
    return { total, completed, failed, latest };
  }

  async exportContent(exportType: string, user: AuthenticatedUser) {
    let data: any[] = [];
    switch (exportType) {
      case 'PAGES':
        data = await this.prisma.page.findMany({ where: { deletedAt: null }, select: { id: true, title: true, slug: true, excerpt: true, content: true, status: true, metaTitle: true, metaDescription: true, publishedAt: true }, take: 1000 });
        break;
      case 'BLOGS':
        data = await this.prisma.blogPost.findMany({ where: { deletedAt: null }, select: { id: true, title: true, slug: true, excerpt: true, content: true, status: true, metaTitle: true, metaDescription: true, publishedAt: true }, take: 1000 });
        break;
      case 'FAQS':
        data = await this.prisma.faq.findMany({ where: { deletedAt: null }, select: { id: true, question: true, answer: true, slug: true, status: true, sortOrder: true }, take: 1000 });
        break;
      default:
        throw new BadRequestException('Unsupported export type.');
    }

    const fileName = `export-${exportType.toLowerCase()}-${Date.now()}.json`;
    const filePath = resolve(this.getBackupDir(), fileName);
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    const fileSize = readFileSync(filePath).length;

    const job = await this.prisma.exportJob.create({
      data: { exportType, status: 'BACKUP_COMPLETED', fileName, fileKey: fileName, fileSize, createdById: user.id, startedAt: new Date(), completedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: { action: 'export.created', entityId: job.id, entityType: 'ExportJob', userId: user.id, metadata: { exportType, records: data.length } as unknown as Prisma.InputJsonValue },
    });

    return job;
  }

  async listExports() {
    return this.prisma.exportJob.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  }

  async validateRestore(backupJobId: string, user: AuthenticatedUser) {
    const job = await this.getJob(backupJobId);
    if (job.status !== 'BACKUP_COMPLETED' || !job.fileKey) throw new BadRequestException('Backup not available for restore.');

    const filePath = resolve(this.getBackupDir(), job.fileKey);
    if (!existsSync(filePath)) throw new NotFoundException('Backup file not found.');

    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    const manifest = content.manifest;
    const data = content.data;

    const summary = {
      valid: true,
      manifest,
      records: {
        pages: data.pages?.length ?? 0,
        blogs: data.blogs?.length ?? 0,
        faqs: data.faqs?.length ?? 0,
        categories: data.categories?.length ?? 0,
        tags: data.tags?.length ?? 0,
        templates: data.templates?.length ?? 0,
        settings: data.settings ? 1 : 0,
      },
      warnings: [] as string[],
    };

    if (!manifest) { summary.valid = false; summary.warnings.push('Missing manifest.'); }
    if (!data) { summary.valid = false; summary.warnings.push('Missing data.'); }
    if (manifest?.includeSecrets) summary.warnings.push('Backup contains secrets.');

    await this.prisma.auditLog.create({
      data: { action: 'restore.validated', entityId: backupJobId, entityType: 'BackupJob', userId: user.id, metadata: { valid: summary.valid } as unknown as Prisma.InputJsonValue },
    });

    return summary;
  }

  async executeRestore(backupJobId: string, conflictStrategy: string, user: AuthenticatedUser) {
    if (user.role !== 'Super Admin') throw new BadRequestException('Only Super Admin can execute restore.');

    const job = await this.getJob(backupJobId);
    if (job.status !== 'BACKUP_COMPLETED' || !job.fileKey) throw new BadRequestException('Backup not available.');

    const filePath = resolve(this.getBackupDir(), job.fileKey);
    if (!existsSync(filePath)) throw new NotFoundException('Backup file not found.');

    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    const data = content.data;
    const results = { pagesRestored: 0, blogsRestored: 0, faqsRestored: 0, skipped: 0, errors: [] as string[] };

    // Restore pages
    if (data.pages) {
      for (const page of data.pages) {
        try {
          const existing = await this.prisma.page.findUnique({ where: { slug: page.slug } });
          if (existing) {
            if (conflictStrategy === 'OVERWRITE') {
              await this.prisma.page.update({ where: { slug: page.slug }, data: { title: page.title, content: page.content, excerpt: page.excerpt, metaTitle: page.metaTitle, metaDescription: page.metaDescription, featuredImage: page.featuredImage } });
              results.pagesRestored++;
            } else { results.skipped++; }
          } else {
            await this.prisma.page.create({ data: { title: page.title, slug: page.slug, content: page.content, excerpt: page.excerpt, status: 'DRAFT', metaTitle: page.metaTitle, metaDescription: page.metaDescription, featuredImage: page.featuredImage } });
            results.pagesRestored++;
          }
        } catch (err) { results.errors.push(`Page ${page.slug}: ${err instanceof Error ? err.message : 'failed'}`); }
      }
    }

    // Restore blogs
    if (data.blogs) {
      for (const blog of data.blogs) {
        try {
          const existing = await this.prisma.blogPost.findUnique({ where: { slug: blog.slug } });
          if (existing) {
            if (conflictStrategy === 'OVERWRITE') {
              await this.prisma.blogPost.update({ where: { slug: blog.slug }, data: { title: blog.title, content: blog.content, excerpt: blog.excerpt, metaTitle: blog.metaTitle, metaDescription: blog.metaDescription, featuredImage: blog.featuredImage } });
              results.blogsRestored++;
            } else { results.skipped++; }
          } else {
            await this.prisma.blogPost.create({ data: { title: blog.title, slug: blog.slug, content: blog.content, excerpt: blog.excerpt, status: 'DRAFT', metaTitle: blog.metaTitle, metaDescription: blog.metaDescription, featuredImage: blog.featuredImage } });
            results.blogsRestored++;
          }
        } catch (err) { results.errors.push(`Blog ${blog.slug}: ${err instanceof Error ? err.message : 'failed'}`); }
      }
    }

    // Restore FAQs
    if (data.faqs) {
      for (const faq of data.faqs) {
        try {
          const existing = await this.prisma.faq.findUnique({ where: { slug: faq.slug } });
          if (existing) {
            if (conflictStrategy === 'OVERWRITE') {
              await this.prisma.faq.update({ where: { slug: faq.slug }, data: { question: faq.question, answer: faq.answer } });
              results.faqsRestored++;
            } else { results.skipped++; }
          } else {
            await this.prisma.faq.create({ data: { question: faq.question, answer: faq.answer, slug: faq.slug, status: 'DRAFT' } });
            results.faqsRestored++;
          }
        } catch (err) { results.errors.push(`FAQ ${faq.slug}: ${err instanceof Error ? err.message : 'failed'}`); }
      }
    }

    await this.prisma.auditLog.create({
      data: { action: 'restore.executed', entityId: backupJobId, entityType: 'BackupJob', userId: user.id, metadata: results as unknown as Prisma.InputJsonValue },
    });

    return { message: 'Restore completed.', ...results };
  }
}
