import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ContentImportAssetStatus,
  ContentImportJobStatus,
  ContentImportSourceType,
  ContentStatus,
  Prisma,
} from '@prisma/client';
import { createHash, randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { isIP } from 'net';
import { extname, resolve } from 'path';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ModuleRegistryService } from '../modules/module-registry.service';
import { PrismaService } from '../prisma/prisma.service';
import { WebContentExtractionService, WebExtractionResult } from './web-content-extraction.service';
import { WordExtractionService } from './word-extraction.service';
import {
  ContentImportAssetQueryDto,
  ContentImportItemQueryDto,
  ContentImportListQueryDto,
  ContentImportLogQueryDto,
  ContentImportRuleQueryDto,
  CreateContentImportJobDto,
  CreateContentImportRuleDto,
  ImportUrlBatchDto,
  ImportUrlDto,
  ReorderContentImportRulesDto,
  TestContentImportRuleDto,
  UpdateContentImportAssetDto,
  UpdateContentImportItemDto,
  UpdateContentImportRuleDto,
  ValidateUrlDto,
} from './dto/content-importer.dto';

export interface UploadedImportFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

const MAX_BATCH_URLS = 10;
const MAX_SITEMAP_URLS = 25;

const wordMimeTypes = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const dangerousExtensions = new Set([
  '.asp',
  '.aspx',
  '.bat',
  '.cmd',
  '.cjs',
  '.dll',
  '.exe',
  '.html',
  '.jar',
  '.js',
  '.jsp',
  '.mjs',
  '.msi',
  '.php',
  '.ps1',
  '.scr',
  '.sh',
]);

const jobListSelect = {
  id: true,
  fileName: true,
  originalFileName: true,
  fileMimeType: true,
  fileSize: true,
  sourceType: true,
  sourceUrl: true,
  sourceDomain: true,
  status: true,
  extractionMode: true,
  importMode: true,
  aiProvider: true,
  aiModel: true,
  extractedTextPreview: true,
  warningsJson: true,
  errorMessage: true,
  createdById: true,
  reviewedById: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { assets: true, items: true, logs: true } },
} satisfies Prisma.ContentImportJobSelect;

const itemSelect = {
  id: true,
  importJobId: true,
  sourceSectionId: true,
  sourceUrl: true,
  sourceTitle: true,
  sourceCanonicalUrl: true,
  sourcePublishedAt: true,
  sourceAuthor: true,
  sourceHash: true,
  importedFromWeb: true,
  detectedContentType: true,
  targetModuleKey: true,
  targetEntityType: true,
  targetEntityId: true,
  title: true,
  slug: true,
  summary: true,
  bodyJson: true,
  extractedImagesJson: true,
  extractedTablesJson: true,
  extractedLinksJson: true,
  sourceAttributionJson: true,
  fieldMappingJson: true,
  metadataJson: true,
  confidenceScore: true,
  status: true,
  reviewNotes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ContentImportItemSelect;

const assetSelect = {
  id: true,
  importJobId: true,
  importItemId: true,
  originalFileName: true,
  assetType: true,
  mediaId: true,
  extractedPath: true,
  sourceUrl: true,
  sourceAltText: true,
  sourceCaption: true,
  sourceLicenseInfo: true,
  altText: true,
  caption: true,
  status: true,
  metadataJson: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ContentImportAssetSelect;

const ruleSelect = {
  id: true,
  name: true,
  description: true,
  isEnabled: true,
  priority: true,
  matchType: true,
  matchPattern: true,
  targetModuleKey: true,
  targetEntityType: true,
  mappingConfigJson: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ContentImportRuleSelect;

const logSelect = {
  id: true,
  importJobId: true,
  importItemId: true,
  action: true,
  status: true,
  message: true,
  metadataJson: true,
  createdById: true,
  createdAt: true,
} satisfies Prisma.ContentImportLogSelect;

@Injectable()
export class ContentImporterService {
  constructor(
    private readonly configService: ConfigService,
    private readonly moduleRegistry: ModuleRegistryService,
    private readonly prisma: PrismaService,
    private readonly webExtraction: WebContentExtractionService,
    private readonly wordExtraction: WordExtractionService,
  ) {}

  async getSummary() {
    const [totalJobs, reviewRequired, completed, failed, wordJobs, webJobs, recentItems] =
      await Promise.all([
        this.prisma.contentImportJob.count({ where: { deletedAt: null } }),
        this.prisma.contentImportJob.count({ where: { deletedAt: null, status: 'REVIEW_REQUIRED' } }),
        this.prisma.contentImportJob.count({ where: { deletedAt: null, status: 'COMPLETED' } }),
        this.prisma.contentImportJob.count({ where: { deletedAt: null, status: 'FAILED' } }),
        this.prisma.contentImportJob.count({ where: { deletedAt: null, sourceType: 'WORD_DOCX' } }),
        this.prisma.contentImportJob.count({
          where: { deletedAt: null, sourceType: { in: ['WEB_URL', 'WEB_PAGE_BATCH', 'WEB_SITEMAP'] } },
        }),
        this.prisma.contentImportItem.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            importJobId: true,
            title: true,
            targetModuleKey: true,
            detectedContentType: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
      ]);

    return {
      totalJobs,
      reviewRequired,
      completed,
      failed,
      wordJobs,
      webJobs,
      recentItems,
    };
  }

  async listJobs(query: ContentImportListQueryDto) {
    const { page, limit, skip } = this.pagination(query.page, query.limit, 20, 50);
    const where: Prisma.ContentImportJobWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.sourceType ? { sourceType: query.sourceType } : {}),
      ...(query.search
        ? {
            OR: [
              { originalFileName: { contains: query.search } },
              { sourceUrl: { contains: query.search } },
              { sourceDomain: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.contentImportJob.findMany({
        where,
        select: jobListSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contentImportJob.count({ where }),
    ]);

    return this.paginated(data, total, page, limit);
  }

  async getJob(id: string) {
    const job = await this.prisma.contentImportJob.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...jobListSelect,
        sourceUrlsJson: true,
        sourceHash: true,
        extractedJson: true,
        analysisJson: true,
        mappingJson: true,
        robotsPolicyJson: true,
        scrapeSettingsJson: true,
        attributionJson: true,
      },
    });
    if (!job) throw new NotFoundException('Import job not found.');
    return job;
  }

  async uploadWord(file: UploadedImportFile | undefined, dto: CreateContentImportJobDto, user: AuthenticatedUser) {
    if (!file) throw new BadRequestException('A DOCX file is required.');
    this.validateWordFile(file);

    const uploadDir = resolve(this.configService.get<string>('CONTENT_IMPORT_UPLOAD_DIR', 'uploads/content-imports'));
    const extension = extname(file.originalname).toLowerCase();
    const safeBase = this.safeFileBase(file.originalname.slice(0, -extension.length));
    const fileName = `${Date.now()}-${randomUUID()}-${safeBase}${extension}`;
    const filePath = resolve(uploadDir, fileName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, file.buffer, { flag: 'wx' });

    const sourceHash = this.hashBuffer(file.buffer);
    const job = await this.prisma.contentImportJob.create({
      data: {
        fileName,
        originalFileName: this.safeOriginalName(file.originalname),
        fileMimeType: file.mimetype,
        fileSize: file.size,
        sourceType: 'WORD_DOCX',
        sourceHash,
        status: 'UPLOADED',
        extractionMode: dto.extractionMode ?? 'BASIC_EXTRACTION',
        importMode: dto.importMode ?? 'EXTRACT_AS_IS',
        warningsJson: [] as Prisma.InputJsonValue,
        scrapeSettingsJson: this.scrapeSettings(dto),
        createdById: user.id,
      },
      select: jobListSelect,
    });

    await this.writeLog(job.id, null, 'content_import.word_uploaded', 'SUCCESS', user.id, {
      originalFileName: file.originalname,
      fileSize: file.size,
      sourceHash,
      privateUpload: true,
    });
    await this.writeAudit('content_import.word_uploaded', job.id, user.id, {
      sourceType: 'WORD_DOCX',
      originalFileName: file.originalname,
      fileSize: file.size,
    });

    return job;
  }

  async createUrlJob(dto: ImportUrlDto, user: AuthenticatedUser) {
    if (!dto.complianceConfirmed) {
      throw new BadRequestException('Web import requires content rights confirmation.');
    }
    if (!dto.sourceUrl) throw new BadRequestException('A source URL is required.');
    const validation = this.validatePublicUrl(dto.sourceUrl);
    const job = await this.createWebJob({
      dto,
      sourceType: 'WEB_URL',
      sourceUrl: validation.normalizedUrl,
      sourceUrls: [validation.normalizedUrl],
      sourceDomain: validation.domain,
      user,
    });

    await this.writeAudit('content_import.web_url_submitted', job.id, user.id, {
      sourceType: 'WEB_URL',
      sourceUrl: validation.normalizedUrl,
      sourceDomain: validation.domain,
    });
    return job;
  }

  async createBatchJob(dto: ImportUrlBatchDto, user: AuthenticatedUser) {
    if (!dto.complianceConfirmed) {
      throw new BadRequestException('Web import requires content rights confirmation.');
    }
    const requestedUrls = [...new Set((dto.sourceUrls ?? []).map((url) => url.trim()).filter(Boolean))];
    if (!requestedUrls.length) throw new BadRequestException('At least one URL is required.');
    if (requestedUrls.length > MAX_BATCH_URLS) {
      throw new BadRequestException(`Batch import supports up to ${MAX_BATCH_URLS} URLs.`);
    }

    const validated = requestedUrls.map((url) => this.validatePublicUrl(url));
    const firstDomain = validated[0]?.domain;
    if ((dto.sameDomainOnly ?? true) && validated.some((item) => item.domain !== firstDomain)) {
      throw new BadRequestException('Batch import is same-domain only by default.');
    }

    const job = await this.createWebJob({
      dto,
      sourceType: 'WEB_PAGE_BATCH',
      sourceUrl: validated[0].normalizedUrl,
      sourceUrls: validated.map((item) => item.normalizedUrl),
      sourceDomain: firstDomain,
      user,
    });

    await this.writeAudit('content_import.batch_url_import_started', job.id, user.id, {
      sourceType: 'WEB_PAGE_BATCH',
      sourceDomain: firstDomain,
      urlCount: validated.length,
    });
    return job;
  }

  async createSitemapJob(dto: ImportUrlDto, user: AuthenticatedUser) {
    if (!dto.complianceConfirmed) {
      throw new BadRequestException('Sitemap import requires content rights confirmation.');
    }
    if (!dto.sourceUrl) throw new BadRequestException('A sitemap URL is required.');
    const validation = this.validatePublicUrl(dto.sourceUrl);
    const maxPages = Math.min(dto.maxPages ?? MAX_SITEMAP_URLS, MAX_SITEMAP_URLS);
    const selectedUrls = [...new Set((dto.sourceUrls ?? []).map((url) => url.trim()).filter(Boolean))].slice(0, maxPages);
    const sourceUrls = selectedUrls.length
      ? selectedUrls.map((url) => this.validatePublicUrl(url).normalizedUrl)
      : [validation.normalizedUrl];
    const job = await this.createWebJob({
      dto: { ...dto, maxPages },
      sourceType: 'WEB_SITEMAP',
      sourceUrl: validation.normalizedUrl,
      sourceUrls,
      sourceDomain: validation.domain,
      user,
    });

    await this.writeAudit('content_import.sitemap_submitted', job.id, user.id, {
      sourceType: 'WEB_SITEMAP',
      sourceUrl: validation.normalizedUrl,
      sourceDomain: validation.domain,
      maxPages,
    });
    return job;
  }

  async validateUrl(dto: ValidateUrlDto, user?: AuthenticatedUser) {
    const result = this.validatePublicUrl(dto.url);
    if (user) {
      await this.prisma.auditLog.create({
        data: {
          action: 'content_import.web_url_validated',
          entityId: result.normalizedUrl.slice(0, 191),
          entityType: 'ContentImportWebUrl',
          metadata: { sourceUrl: result.normalizedUrl, sourceDomain: result.domain } as Prisma.InputJsonValue,
          userId: user.id,
        },
      });
    }
    return {
      ...result,
      robotsChecked: false,
      robotsAllowed: null,
      warnings: ['Robots.txt checks run during web extraction.'],
    };
  }

  async listItems(jobId: string, query: ContentImportItemQueryDto) {
    await this.ensureJob(jobId);
    const { page, limit, skip } = this.pagination(query.page, query.limit, 20, 50);
    const where: Prisma.ContentImportItemWhereInput = {
      importJobId: jobId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.detectedContentType ? { detectedContentType: query.detectedContentType } : {}),
      ...(query.targetModuleKey ? { targetModuleKey: query.targetModuleKey } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.contentImportItem.findMany({
        where,
        select: itemSelect,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.contentImportItem.count({ where }),
    ]);
    return this.paginated(data, total, page, limit);
  }

  async getItem(itemId: string) {
    const item = await this.prisma.contentImportItem.findFirst({
      where: { id: itemId, deletedAt: null },
      select: itemSelect,
    });
    if (!item) throw new NotFoundException('Import item not found.');
    return item;
  }

  async updateItem(itemId: string, dto: UpdateContentImportItemDto, user: AuthenticatedUser) {
    await this.getItem(itemId);
    const item = await this.prisma.contentImportItem.update({
      where: { id: itemId },
      data: {
        detectedContentType: dto.detectedContentType,
        targetModuleKey: this.nullable(dto.targetModuleKey),
        targetEntityType: this.nullable(dto.targetEntityType),
        title: dto.title?.trim(),
        slug: this.nullable(dto.slug),
        summary: this.nullable(dto.summary),
        bodyJson: this.optionalJson(dto.bodyJson),
        fieldMappingJson: this.optionalJson(dto.fieldMappingJson),
        metadataJson: this.optionalJson(dto.metadataJson),
        sourceAttributionJson: this.optionalJson(dto.sourceAttributionJson),
        reviewNotes: this.nullable(dto.reviewNotes),
      },
      select: itemSelect,
    });
    await this.writeLog(item.importJobId, item.id, 'content_import.item_edited', 'SUCCESS', user.id);
    return item;
  }

  async approveItem(itemId: string, user: AuthenticatedUser) {
    const current = await this.getItem(itemId);
    if (current.status === 'IMPORTED') throw new BadRequestException('Imported items cannot be approved again.');
    if (!current.targetModuleKey) throw new BadRequestException('Target module is required before approval.');
    await this.ensureTargetModuleEnabled(current.targetModuleKey);
    const item = await this.prisma.contentImportItem.update({
      where: { id: itemId },
      data: { status: 'APPROVED_FOR_IMPORT', reviewNotes: null },
      select: itemSelect,
    });
    await this.writeLog(item.importJobId, item.id, 'content_import.item_approved', 'SUCCESS', user.id, {
      targetModuleKey: item.targetModuleKey,
    });
    return item;
  }

  async skipItem(itemId: string, user: AuthenticatedUser) {
    const current = await this.getItem(itemId);
    const item = await this.prisma.contentImportItem.update({
      where: { id: itemId },
      data: { status: 'SKIPPED' },
      select: itemSelect,
    });
    await this.writeLog(current.importJobId, item.id, 'content_import.item_skipped', 'SUCCESS', user.id);
    return item;
  }

  async importItem(itemId: string, user: AuthenticatedUser) {
    const item = await this.getItem(itemId);
    if (item.status !== 'APPROVED_FOR_IMPORT') {
      throw new BadRequestException('Approve the item before importing it.');
    }
    return this.importApprovedItems(item.importJobId, user, [item.id]);
  }

  async importApprovedItems(id: string, user: AuthenticatedUser, itemIds?: string[]) {
    const job = await this.ensureJob(id);
    const items = await this.prisma.contentImportItem.findMany({
      where: {
        importJobId: id,
        deletedAt: null,
        status: 'APPROVED_FOR_IMPORT',
        ...(itemIds?.length ? { id: { in: itemIds } } : {}),
      },
      select: itemSelect,
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    if (!items.length) throw new BadRequestException('No approved import items are ready to process.');

    await this.prisma.contentImportJob.update({
      where: { id },
      data: { status: 'IMPORTING', errorMessage: null },
    });
    await this.writeLog(id, null, 'content_import.draft_import_started', 'SUCCESS', user.id, {
      approvedItemCount: items.length,
    });

    let importedCount = 0;
    let failedCount = 0;

    for (const item of items) {
      try {
        if (item.targetModuleKey !== 'pages' || item.targetEntityType !== 'Page') {
          throw new BadRequestException('Only Page draft imports are supported in this slice.');
        }

        const slug = await this.uniquePageSlug(item.slug ?? this.slugify(item.title));
        const content = this.itemBodyToHtml(item);
        const page = await this.prisma.$transaction(async (tx) => {
          const createdPage = await tx.page.create({
            data: {
              authorId: user.id,
              content,
              excerpt: item.summary?.slice(0, 1000) ?? null,
              metaDescription: item.summary?.slice(0, 160) ?? null,
              metaTitle: item.title.slice(0, 60),
              slug,
              status: ContentStatus.DRAFT,
              title: item.title.slice(0, 255),
            },
            select: { id: true, slug: true, title: true },
          });

          await tx.contentImportItem.update({
            where: { id: item.id },
            data: {
              status: 'IMPORTED',
              targetEntityId: createdPage.id,
              reviewNotes: null,
            },
          });

          await tx.contentImportLog.create({
            data: {
              importJobId: id,
              importItemId: item.id,
              action: 'content_import.page_draft_created',
              status: 'SUCCESS',
              message: 'Approved import item was converted to a CMS page draft.',
              createdById: user.id,
              metadataJson: {
                pageId: createdPage.id,
                slug: createdPage.slug,
              } as Prisma.InputJsonValue,
            },
          });

          await tx.auditLog.create({
            data: {
              action: 'page.created_from_content_import',
              entityId: createdPage.id,
              entityType: 'Page',
              metadata: {
                importJobId: id,
                importItemId: item.id,
                sourceType: job.sourceType,
              } as Prisma.InputJsonValue,
              pageId: createdPage.id,
              userId: user.id,
            },
          });

          return createdPage;
        });

        importedCount += 1;
        await this.writeAudit('content_import.item_imported', id, user.id, {
          importItemId: item.id,
          pageId: page.id,
          slug: page.slug,
        });
      } catch (error) {
        failedCount += 1;
        const message = error instanceof Error ? error.message : 'Import item failed.';
        await this.prisma.contentImportItem.update({
          where: { id: item.id },
          data: {
            status: 'FAILED',
            reviewNotes: message,
          },
        });
        await this.writeLog(id, item.id, 'content_import.item_import_failed', 'FAILED', user.id, { message });
      }
    }

    const remainingOpenItems = await this.prisma.contentImportItem.count({
      where: {
        importJobId: id,
        deletedAt: null,
        status: { in: ['DRAFT_MAPPING', 'REVIEW_REQUIRED', 'APPROVED_FOR_IMPORT'] },
      },
    });
    const status =
      importedCount > 0 && failedCount === 0 && remainingOpenItems === 0
        ? 'COMPLETED'
        : importedCount > 0
          ? 'PARTIALLY_COMPLETED'
          : 'FAILED';

    const updated = await this.prisma.contentImportJob.update({
      where: { id },
      data: {
        completedAt: new Date(),
        errorMessage: failedCount ? `${failedCount} approved import item(s) failed.` : null,
        status,
      },
      select: jobListSelect,
    });

    await this.writeLog(id, null, 'content_import.draft_import_completed', importedCount ? 'SUCCESS' : 'FAILED', user.id, {
      importedCount,
      failedCount,
      remainingOpenItems,
    });
    await this.writeAudit('content_import.draft_import_completed', id, user.id, {
      importedCount,
      failedCount,
      remainingOpenItems,
    });

    return updated;
  }

  async markItemActionNotReady(itemId: string, action: string, user: AuthenticatedUser) {
    const item = await this.getItem(itemId);
    await this.writeLog(item.importJobId, item.id, action, 'FAILED', user.id, {
      reason: 'This item processing action is implemented in a later slice.',
    });
    throw new BadRequestException('This item processing action is implemented in a later slice.');
  }

  async listAssets(jobId: string, query: ContentImportAssetQueryDto) {
    await this.ensureJob(jobId);
    const { page, limit, skip } = this.pagination(query.page, query.limit, 20, 50);
    const where: Prisma.ContentImportAssetWhereInput = {
      importJobId: jobId,
      ...(query.assetType ? { assetType: query.assetType } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.contentImportAsset.findMany({
        where,
        select: assetSelect,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.contentImportAsset.count({ where }),
    ]);
    return this.paginated(data, total, page, limit);
  }

  async updateAsset(assetId: string, dto: UpdateContentImportAssetDto, user: AuthenticatedUser) {
    const existing = await this.prisma.contentImportAsset.findUnique({ where: { id: assetId }, select: assetSelect });
    if (!existing) throw new NotFoundException('Import asset not found.');
    const asset = await this.prisma.contentImportAsset.update({
      where: { id: assetId },
      data: {
        altText: this.nullable(dto.altText),
        caption: this.nullable(dto.caption),
        sourceLicenseInfo: this.nullable(dto.sourceLicenseInfo),
        status: dto.status,
        metadataJson: this.optionalJson(dto.metadataJson),
      },
      select: assetSelect,
    });
    await this.writeLog(asset.importJobId, asset.importItemId, 'content_import.asset_updated', 'SUCCESS', user.id, {
      assetId: asset.id,
    });
    return asset;
  }

  async markAssetSaveNotReady(assetId: string, user: AuthenticatedUser) {
    const asset = await this.prisma.contentImportAsset.findUnique({ where: { id: assetId }, select: assetSelect });
    if (!asset) throw new NotFoundException('Import asset not found.');
    await this.writeLog(asset.importJobId, asset.importItemId, 'content_import.asset_save_blocked', 'FAILED', user.id, {
      assetId,
    });
    throw new BadRequestException('Saving importer assets to Media is implemented in a later slice.');
  }

  async cancelJob(id: string, user: AuthenticatedUser) {
    await this.ensureJob(id);
    const job = await this.prisma.contentImportJob.update({
      where: { id },
      data: { status: 'CANCELLED', completedAt: new Date() },
      select: jobListSelect,
    });
    await this.writeLog(job.id, null, 'content_import.job_cancelled', 'SUCCESS', user.id);
    await this.writeAudit('content_import.job_cancelled', job.id, user.id, { sourceType: job.sourceType });
    return job;
  }

  async deleteJob(id: string, user: AuthenticatedUser) {
    const job = await this.ensureJob(id);
    const deleted = await this.prisma.contentImportJob.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
      select: jobListSelect,
    });
    await this.writeLog(job.id, null, 'content_import.job_deleted', 'SUCCESS', user.id);
    await this.writeAudit('content_import.job_deleted', job.id, user.id, { sourceType: job.sourceType });
    return deleted;
  }

  async listRules(query: ContentImportRuleQueryDto) {
    const { page, limit, skip } = this.pagination(query.page, query.limit, 20, 50);
    const where: Prisma.ContentImportRuleWhereInput = {
      deletedAt: null,
      ...(query.isEnabled !== undefined ? { isEnabled: this.toBoolean(query.isEnabled) } : {}),
      ...(query.targetModuleKey ? { targetModuleKey: query.targetModuleKey } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.contentImportRule.findMany({
        where,
        select: ruleSelect,
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.contentImportRule.count({ where }),
    ]);
    return this.paginated(data, total, page, limit);
  }

  async getRule(id: string) {
    const rule = await this.prisma.contentImportRule.findFirst({
      where: { id, deletedAt: null },
      select: ruleSelect,
    });
    if (!rule) throw new NotFoundException('Import rule not found.');
    return rule;
  }

  async createRule(dto: CreateContentImportRuleDto, user: AuthenticatedUser) {
    await this.ensureTargetModuleEnabled(dto.targetModuleKey);
    const rule = await this.prisma.contentImportRule.create({
      data: {
        name: dto.name.trim(),
        description: this.nullable(dto.description),
        isEnabled: dto.isEnabled ?? true,
        priority: dto.priority ?? 100,
        matchType: dto.matchType,
        matchPattern: dto.matchPattern.trim(),
        targetModuleKey: dto.targetModuleKey.trim(),
        targetEntityType: dto.targetEntityType.trim(),
        mappingConfigJson: this.optionalJson(dto.mappingConfigJson),
        createdById: user.id,
      },
      select: ruleSelect,
    });
    await this.writeAudit('content_import.rule_created', rule.id, user.id, {
      targetModuleKey: rule.targetModuleKey,
      matchType: rule.matchType,
    });
    return rule;
  }

  async updateRule(id: string, dto: UpdateContentImportRuleDto, user: AuthenticatedUser) {
    await this.getRule(id);
    if (dto.targetModuleKey) await this.ensureTargetModuleEnabled(dto.targetModuleKey);
    const rule = await this.prisma.contentImportRule.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: this.nullable(dto.description),
        isEnabled: dto.isEnabled,
        priority: dto.priority,
        matchType: dto.matchType,
        matchPattern: dto.matchPattern?.trim(),
        targetModuleKey: dto.targetModuleKey?.trim(),
        targetEntityType: dto.targetEntityType?.trim(),
        mappingConfigJson: this.optionalJson(dto.mappingConfigJson),
      },
      select: ruleSelect,
    });
    await this.writeAudit('content_import.rule_updated', rule.id, user.id, {
      targetModuleKey: rule.targetModuleKey,
      matchType: rule.matchType,
    });
    return rule;
  }

  async deleteRule(id: string, user: AuthenticatedUser) {
    const existing = await this.getRule(id);
    const rule = await this.prisma.contentImportRule.update({
      where: { id },
      data: { deletedAt: new Date(), isEnabled: false },
      select: ruleSelect,
    });
    await this.writeAudit('content_import.rule_deleted', id, user.id, {
      targetModuleKey: existing.targetModuleKey,
    });
    return rule;
  }

  async reorderRules(dto: ReorderContentImportRulesDto, user: AuthenticatedUser) {
    const updates = (dto.rules ?? []).slice(0, 100).map((rule) =>
      this.prisma.contentImportRule.update({
        where: { id: rule.id },
        data: { priority: Math.max(1, Math.min(10000, Number(rule.priority) || 100)) },
        select: ruleSelect,
      }),
    );
    const rules = await this.prisma.$transaction(updates);
    await this.prisma.auditLog.create({
      data: {
        action: 'content_import.rules_reordered',
        entityId: 'content_import_rules',
        entityType: 'ContentImportRule',
        metadata: { count: rules.length } as Prisma.InputJsonValue,
        userId: user.id,
      },
    });
    return rules;
  }

  async testRule(id: string, dto: TestContentImportRuleDto) {
    const rule = await this.getRule(id);
    const haystack = [dto.sampleTitle, dto.sampleUrl, dto.sampleText].filter(Boolean).join('\n').toLowerCase();
    const pattern = rule.matchPattern.toLowerCase();
    const matched =
      rule.matchType === 'REGEX'
        ? this.safeRegexTest(rule.matchPattern, haystack)
        : haystack.includes(pattern);
    return {
      ruleId: rule.id,
      matched,
      targetModuleKey: rule.targetModuleKey,
      targetEntityType: rule.targetEntityType,
    };
  }

  async listLogs(query: ContentImportLogQueryDto & { jobId?: string }) {
    const { page, limit, skip } = this.pagination(query.page, query.limit, 50, 100);
    const where: Prisma.ContentImportLogWhereInput = {
      ...(query.jobId ? { importJobId: query.jobId } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.contentImportLog.findMany({
        where,
        select: logSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contentImportLog.count({ where }),
    ]);
    return this.paginated(data, total, page, limit);
  }

  async markJobActionNotReady(id: string, action: string, user: AuthenticatedUser) {
    const job = await this.ensureJob(id);
    await this.writeLog(job.id, null, action, 'FAILED', user.id, {
      reason: 'This processing action is implemented in a later slice.',
    });
    throw new BadRequestException('This processing action is implemented in a later slice.');
  }

  async fetchWebJob(id: string, user: AuthenticatedUser) {
    const job = await this.prisma.contentImportJob.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        sourceType: true,
        sourceUrl: true,
        sourceUrlsJson: true,
        sourceDomain: true,
        scrapeSettingsJson: true,
      },
    });
    if (!job) throw new NotFoundException('Import job not found.');
    if (!['WEB_URL', 'WEB_PAGE_BATCH', 'WEB_SITEMAP'].includes(job.sourceType)) {
      return this.markJobActionNotReady(id, 'content_import.web_fetch_started', user);
    }

    const settings = this.parseScrapeSettings(job.scrapeSettingsJson);
    let urls = this.parseSourceUrls(job.sourceUrlsJson, job.sourceUrl);
    if (job.sourceType === 'WEB_SITEMAP' && urls.length === 1 && urls[0] === job.sourceUrl) {
      const sitemapUrls = await this.webExtraction.extractSitemapUrls(
        urls[0],
        Math.min(settings.maxPages ?? MAX_SITEMAP_URLS, MAX_SITEMAP_URLS),
        settings.sameDomainOnly ?? true,
      );
      await this.prisma.contentImportJob.update({
        where: { id },
        data: {
          status: 'EXTRACTED',
          sourceUrlsJson: sitemapUrls as Prisma.InputJsonValue,
          extractedJson: { sitemapUrls } as Prisma.InputJsonValue,
          extractedTextPreview: sitemapUrls.slice(0, 25).join('\n'),
          warningsJson: sitemapUrls.length ? [] : ['No sitemap URLs were found.'],
        },
      });
      await this.writeLog(id, null, 'content_import.sitemap_urls_extracted', 'SUCCESS', user.id, {
        urlCount: sitemapUrls.length,
      });
      return this.getJob(id);
    }

    urls = urls.slice(0, job.sourceType === 'WEB_SITEMAP' ? MAX_SITEMAP_URLS : MAX_BATCH_URLS);
    if (!urls.length) throw new BadRequestException('No URLs are available for web extraction.');

    await this.prisma.contentImportJob.update({
      where: { id },
      data: { status: 'FETCHING', errorMessage: null },
    });
    await this.writeLog(id, null, 'content_import.web_fetch_started', 'SUCCESS', user.id, { urlCount: urls.length });

    try {
      const targetModuleKey = (await this.moduleRegistry.isModuleEnabled('pages')) ? 'pages' : null;
      const extractions: WebExtractionResult[] = [];
      for (const url of urls) {
        extractions.push(await this.webExtraction.extractUrl(url, {
          includeImages: settings.includeImages,
          includeLinks: settings.includeLinks,
          includeTables: settings.includeTables,
          respectRobots: settings.respectRobots,
          maxResponseBytes: this.configService.get<number>('CONTENT_IMPORT_MAX_RESPONSE_BYTES', 1024 * 1024),
          timeoutMs: this.configService.get<number>('CONTENT_IMPORT_FETCH_TIMEOUT_MS', 10000),
        }));
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.contentImportAsset.deleteMany({ where: { importJobId: id } });
        await tx.contentImportItem.updateMany({
          where: { importJobId: id, status: { not: 'IMPORTED' }, deletedAt: null },
          data: { deletedAt: new Date() },
        });

        for (const extraction of extractions) {
          const item = await tx.contentImportItem.create({
            data: {
              importJobId: id,
              sourceUrl: extraction.sourceUrl,
              sourceTitle: extraction.title,
              sourceCanonicalUrl: extraction.canonicalUrl,
              sourcePublishedAt: extraction.publishedAt ? new Date(extraction.publishedAt) : null,
              sourceAuthor: extraction.author || null,
              sourceHash: extraction.metadata.contentHash,
              importedFromWeb: true,
              detectedContentType: 'PAGE',
              targetModuleKey,
              targetEntityType: 'Page',
              title: extraction.title,
              slug: this.slugify(extraction.title),
              summary: extraction.metaDescription || extraction.paragraphs[0]?.slice(0, 500) || null,
              bodyJson: {
                title: extraction.title,
                headings: extraction.headings,
                paragraphs: extraction.paragraphs,
              } as unknown as Prisma.InputJsonValue,
              extractedImagesJson: extraction.images as unknown as Prisma.InputJsonValue,
              extractedTablesJson: extraction.tables as unknown as Prisma.InputJsonValue,
              extractedLinksJson: extraction.links as unknown as Prisma.InputJsonValue,
              sourceAttributionJson: {
                sourceUrl: extraction.sourceUrl,
                sourceTitle: extraction.title,
                sourceDomain: extraction.domain,
                fetchedAt: extraction.metadata.fetchedAt,
                requiresAttribution: settings.attributionRequired ?? false,
              } as Prisma.InputJsonValue,
              metadataJson: extraction.metadata as unknown as Prisma.InputJsonValue,
              confidenceScore: extraction.paragraphs.length ? 0.72 : 0.35,
              status: 'REVIEW_REQUIRED',
              reviewNotes: extraction.warnings.length ? extraction.warnings.join('\n') : null,
            },
            select: { id: true },
          });

          if (extraction.images.length) {
            await tx.contentImportAsset.createMany({
              data: extraction.images.map((image) => ({
                importJobId: id,
                importItemId: item.id,
                assetType: 'IMAGE',
                sourceUrl: image.sourceUrl,
                sourceAltText: image.altText || null,
                sourceCaption: image.caption || null,
                altText: image.altText || null,
                caption: image.caption || null,
                status: 'EXTRACTED',
                metadataJson: { isDownloadAllowed: image.isDownloadAllowed } as Prisma.InputJsonValue,
              })),
            });
          }
        }

        await tx.contentImportJob.update({
          where: { id },
          data: {
            status: 'REVIEW_REQUIRED',
            sourceDomain: extractions[0]?.domain ?? job.sourceDomain,
            extractedTextPreview: extractions
              .flatMap((extraction) => [extraction.title, ...extraction.paragraphs.slice(0, 5)])
              .join('\n\n')
              .slice(0, 3000),
            extractedJson: extractions as unknown as Prisma.InputJsonValue,
            warningsJson: extractions.flatMap((extraction) => extraction.warnings) as Prisma.InputJsonValue,
            robotsPolicyJson: extractions.map((extraction) => ({
              sourceUrl: extraction.sourceUrl,
              robotsChecked: extraction.metadata.robotsChecked,
              robotsAllowed: extraction.metadata.robotsAllowed,
            })) as Prisma.InputJsonValue,
          },
        });

        await tx.contentImportLog.create({
          data: {
            importJobId: id,
            action: 'content_import.web_extraction_completed',
            status: 'SUCCESS',
            message: 'Web content extracted and review items created.',
            createdById: user.id,
            metadataJson: {
              urlCount: extractions.length,
              imageCount: extractions.reduce((sum, extraction) => sum + extraction.images.length, 0),
              tableCount: extractions.reduce((sum, extraction) => sum + extraction.tables.length, 0),
              linkCount: extractions.reduce((sum, extraction) => sum + extraction.links.length, 0),
            } as Prisma.InputJsonValue,
          },
        });
      });

      await this.writeAudit('content_import.web_extraction_completed', id, user.id, {
        sourceType: job.sourceType,
        urlCount: extractions.length,
      });

      return this.getJob(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Web extraction failed.';
      await this.prisma.contentImportJob.update({
        where: { id },
        data: { status: 'FAILED', errorMessage: message },
      });
      await this.writeLog(id, null, 'content_import.web_extraction_failed', 'FAILED', user.id, { message });
      throw new BadRequestException(message);
    }
  }

  async extractJob(id: string, user: AuthenticatedUser) {
    const job = await this.prisma.contentImportJob.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        fileName: true,
        originalFileName: true,
        sourceType: true,
        sourceHash: true,
      },
    });
    if (!job) throw new NotFoundException('Import job not found.');
    if (job.sourceType !== 'WORD_DOCX') {
      return this.markJobActionNotReady(id, 'content_import.extraction_started', user);
    }
    if (!job.fileName) throw new BadRequestException('Import job has no stored DOCX file.');

    await this.prisma.contentImportJob.update({
      where: { id },
      data: { status: 'EXTRACTING', errorMessage: null },
    });
    await this.writeLog(id, null, 'content_import.extraction_started', 'SUCCESS', user.id, {
      sourceType: job.sourceType,
    });

    try {
      const uploadDir = resolve(this.configService.get<string>('CONTENT_IMPORT_UPLOAD_DIR', 'uploads/content-imports'));
      const filePath = resolve(uploadDir, job.fileName);
      const extractedDir = resolve(uploadDir, 'extracted', job.id);
      const extraction = await this.wordExtraction.extractDocx(filePath, extractedDir, job.id);
      const targetModuleKey = (await this.moduleRegistry.isModuleEnabled('pages')) ? 'pages' : null;
      const confidenceScore = extraction.paragraphs.length > 0 ? 0.75 : 0.4;
      const itemStatus = confidenceScore >= 0.7 ? 'REVIEW_REQUIRED' : 'REVIEW_REQUIRED';

      const item = await this.prisma.$transaction(async (tx) => {
        await tx.contentImportAsset.deleteMany({ where: { importJobId: id } });
        await tx.contentImportItem.updateMany({
          where: { importJobId: id, status: { not: 'IMPORTED' }, deletedAt: null },
          data: { deletedAt: new Date() },
        });

        const createdItem = await tx.contentImportItem.create({
          data: {
            importJobId: id,
            sourceTitle: extraction.title,
            sourceHash: extraction.metadata.contentHash,
            detectedContentType: 'PAGE',
            targetModuleKey,
            targetEntityType: 'Page',
            title: extraction.title,
            slug: this.slugify(extraction.title),
            summary: extraction.paragraphs[0]?.slice(0, 500) ?? null,
            bodyJson: {
              title: extraction.title,
              headings: extraction.headings,
              paragraphs: extraction.paragraphs,
            } as unknown as Prisma.InputJsonValue,
            extractedImagesJson: extraction.images as unknown as Prisma.InputJsonValue,
            extractedTablesJson: extraction.tables as unknown as Prisma.InputJsonValue,
            extractedLinksJson: extraction.links as unknown as Prisma.InputJsonValue,
            sourceAttributionJson: {
              sourceType: 'WORD_DOCX',
              originalFileName: job.originalFileName,
              importJobId: id,
              extractedAt: new Date().toISOString(),
            } as Prisma.InputJsonValue,
            metadataJson: extraction.metadata as unknown as Prisma.InputJsonValue,
            confidenceScore,
            status: itemStatus,
            reviewNotes: extraction.warnings.length ? extraction.warnings.join('\n') : null,
          },
          select: itemSelect,
        });

        if (extraction.images.length) {
          await tx.contentImportAsset.createMany({
            data: extraction.images.map((image) => ({
              importJobId: id,
              importItemId: createdItem.id,
              originalFileName: image.fileName,
              assetType: 'IMAGE',
              extractedPath: image.extractedPath,
              sourceAltText: image.altText || null,
              sourceCaption: image.caption || null,
              altText: image.altText || null,
              caption: image.caption || null,
              status: 'EXTRACTED',
              metadataJson: {
                sectionId: image.sectionId,
                assetId: image.assetId,
              } as Prisma.InputJsonValue,
            })),
          });
        }

        await tx.contentImportJob.update({
          where: { id },
          data: {
            status: 'REVIEW_REQUIRED',
            extractedTextPreview: extraction.paragraphs.join('\n\n').slice(0, 3000),
            extractedJson: extraction as unknown as Prisma.InputJsonValue,
            warningsJson: extraction.warnings as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.contentImportLog.create({
          data: {
            importJobId: id,
            importItemId: createdItem.id,
            action: 'content_import.extraction_completed',
            status: 'SUCCESS',
            message: 'DOCX extracted and review item created.',
            createdById: user.id,
            metadataJson: {
              wordCount: extraction.metadata.wordCount,
              imageCount: extraction.images.length,
              tableCount: extraction.tables.length,
              linkCount: extraction.links.length,
              warningCount: extraction.warnings.length,
            } as Prisma.InputJsonValue,
          },
        });

        return createdItem;
      });

      await this.writeAudit('content_import.extraction_completed', id, user.id, {
        sourceType: 'WORD_DOCX',
        importItemId: item.id,
        wordCount: extraction.metadata.wordCount,
      });

      return this.getJob(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'DOCX extraction failed.';
      await this.prisma.contentImportJob.update({
        where: { id },
        data: { status: 'FAILED', errorMessage: message },
      });
      await this.writeLog(id, null, 'content_import.extraction_failed', 'FAILED', user.id, { message });
      throw new BadRequestException(message);
    }
  }

  private async createWebJob(args: {
    dto: CreateContentImportJobDto;
    sourceType: ContentImportSourceType;
    sourceUrl: string;
    sourceUrls: string[];
    sourceDomain: string;
    user: AuthenticatedUser;
  }) {
    const sourceHash = this.hashText(args.sourceUrls.join('\n'));
    const job = await this.prisma.contentImportJob.create({
      data: {
        sourceType: args.sourceType,
        sourceUrl: args.sourceUrl,
        sourceDomain: args.sourceDomain,
        sourceUrlsJson: args.sourceUrls as Prisma.InputJsonValue,
        sourceHash,
        status: 'VALIDATING',
        extractionMode: args.dto.extractionMode ?? 'HYBRID',
        importMode: args.dto.importMode ?? 'CLASSIFY_INTO_MODULES',
        warningsJson: [] as Prisma.InputJsonValue,
        scrapeSettingsJson: this.scrapeSettings(args.dto),
        attributionJson: {
          attributionRequired: args.dto.attributionRequired ?? false,
          complianceConfirmed: args.dto.complianceConfirmed === true,
          submittedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
        createdById: args.user.id,
      },
      select: jobListSelect,
    });
    await this.writeLog(job.id, null, 'content_import.web_job_created', 'SUCCESS', args.user.id, {
      sourceType: args.sourceType,
      sourceDomain: args.sourceDomain,
      urlCount: args.sourceUrls.length,
    });
    return job;
  }

  private async ensureJob(id: string) {
    const job = await this.prisma.contentImportJob.findFirst({
      where: { id, deletedAt: null },
      select: jobListSelect,
    });
    if (!job) throw new NotFoundException('Import job not found.');
    return job;
  }

  private async ensureTargetModuleEnabled(moduleKey: string) {
    const enabled = await this.moduleRegistry.isModuleEnabled(moduleKey);
    if (!enabled) throw new BadRequestException(`Target module "${moduleKey}" is disabled.`);
  }

  private validateWordFile(file: UploadedImportFile) {
    const maxSize = this.configService.get<number>('MAX_CONTENT_IMPORT_FILE_SIZE_MB', 25) * 1024 * 1024;
    const extension = extname(file.originalname).toLowerCase();
    if (file.size > maxSize) throw new BadRequestException('Word file exceeds maximum upload size.');
    if (dangerousExtensions.has(extension)) throw new BadRequestException('Executable files are not allowed.');
    if (extension !== '.docx' || !wordMimeTypes.has(file.mimetype)) {
      throw new BadRequestException('Only safe .docx Word files are supported for MVP import.');
    }
  }

  private validatePublicUrl(rawUrl: string) {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl.trim());
    } catch {
      throw new BadRequestException('Invalid URL.');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new BadRequestException('Only HTTP and HTTPS URLs are allowed.');
    }
    if (parsed.username || parsed.password) {
      throw new BadRequestException('Credentialed URLs are not allowed.');
    }

    const hostname = parsed.hostname.toLowerCase();
    if (this.isBlockedHostname(hostname)) {
      throw new BadRequestException('Private, internal, or unsafe URLs cannot be imported.');
    }

    parsed.hash = '';
    return {
      normalizedUrl: parsed.toString(),
      domain: hostname.replace(/^www\./, ''),
      isSafe: true,
    };
  }

  private isBlockedHostname(hostname: string): boolean {
    const cleaned = hostname.replace(/^\[|\]$/g, '');
    if (
      cleaned === 'localhost' ||
      cleaned.endsWith('.localhost') ||
      cleaned.endsWith('.local') ||
      cleaned.endsWith('.internal') ||
      !cleaned.includes('.')
    ) {
      return true;
    }

    const ipVersion = isIP(cleaned);
    if (ipVersion === 4) {
      const parts = cleaned.split('.').map((part) => Number(part));
      const [a, b, c] = parts;
      return (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 0) ||
        (a === 192 && b === 168) ||
        (a === 169 && b === 254) ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 198 && (b === 18 || b === 19)) ||
        (a === 192 && b === 0 && c === 2) ||
        (a === 198 && b === 51 && c === 100) ||
        (a === 203 && b === 0 && c === 113) ||
        a >= 224
      );
    }
    if (ipVersion === 6) {
      const ipv4Mapped = cleaned.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
      if (ipv4Mapped) return this.isBlockedHostname(ipv4Mapped[1]);
      return (
        cleaned === '::' ||
        cleaned === '::1' ||
        cleaned.startsWith('2001:db8') ||
        /^fe[89ab]/.test(cleaned) ||
        cleaned.startsWith('fc') ||
        cleaned.startsWith('fd') ||
        cleaned.startsWith('ff')
      );
    }
    return false;
  }

  private pagination(rawPage: unknown, rawLimit: unknown, defaultLimit: number, maxLimit: number) {
    const page = Math.max(1, Number(rawPage) || 1);
    const limit = Math.min(maxLimit, Math.max(1, Number(rawLimit) || defaultLimit));
    return { page, limit, skip: (page - 1) * limit };
  }

  private paginated<T>(data: T[], total: number, page: number, limit: number) {
    return { data, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  }

  private scrapeSettings(dto: CreateContentImportJobDto): Prisma.InputJsonValue {
    return {
      includeImages: dto.includeImages ?? false,
      includeTables: dto.includeTables ?? true,
      includeLinks: dto.includeLinks ?? true,
      respectRobots: dto.respectRobots ?? true,
      maxPages: dto.maxPages ?? (dto.sourceType === 'WEB_SITEMAP' ? MAX_SITEMAP_URLS : MAX_BATCH_URLS),
      sameDomainOnly: dto.sameDomainOnly ?? true,
      attributionRequired: dto.attributionRequired ?? false,
    } as Prisma.InputJsonValue;
  }

  private parseScrapeSettings(value: unknown) {
    const settings = (value ?? {}) as {
      includeImages?: boolean;
      includeTables?: boolean;
      includeLinks?: boolean;
      respectRobots?: boolean;
      maxPages?: number;
      sameDomainOnly?: boolean;
      attributionRequired?: boolean;
    };
    return {
      includeImages: settings.includeImages ?? false,
      includeTables: settings.includeTables ?? true,
      includeLinks: settings.includeLinks ?? true,
      respectRobots: settings.respectRobots ?? true,
      maxPages: settings.maxPages,
      sameDomainOnly: settings.sameDomainOnly ?? true,
      attributionRequired: settings.attributionRequired ?? false,
    };
  }

  private parseSourceUrls(value: unknown, fallback?: string | null) {
    const urls = Array.isArray(value) ? value.filter((url): url is string => typeof url === 'string') : [];
    return urls.length ? [...new Set(urls)] : fallback ? [fallback] : [];
  }

  private optionalJson(value: unknown) {
    return value === undefined ? undefined : (value as Prisma.InputJsonValue);
  }

  private nullable(value?: string | null) {
    const cleaned = value?.trim();
    return cleaned ? cleaned : value === null ? null : undefined;
  }

  private toBoolean(value: unknown) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  }

  private safeRegexTest(pattern: string, value: string) {
    try {
      return new RegExp(pattern, 'i').test(value);
    } catch {
      return false;
    }
  }

  private safeFileBase(value: string) {
    return (
      value
        .normalize('NFKD')
        .replace(/[^\w.-]+/g, '-')
        .replace(/[^a-zA-Z0-9_.-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^[-.]+|[-.]+$/g, '')
        .toLowerCase()
        .slice(0, 120) || 'word-import'
    );
  }

  private safeOriginalName(value: string) {
    return value.replace(/[\\/:*?"<>|]+/g, '-').trim().slice(0, 500) || 'word-import.docx';
  }

  private hashBuffer(buffer: Buffer) {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private hashText(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private async uniquePageSlug(rawSlug: string) {
    const base =
      rawSlug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 180) || 'imported-content';

    for (let suffix = 0; suffix < 25; suffix += 1) {
      const suffixText = suffix ? `-${suffix}` : '';
      const candidate = `${base.slice(0, 191 - suffixText.length)}${suffixText}`;
      const existing = await this.prisma.page.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!existing) return candidate;
    }

    return `${base.slice(0, 182)}-${randomUUID().slice(0, 8)}`;
  }

  private itemBodyToHtml(item: Prisma.ContentImportItemGetPayload<{ select: typeof itemSelect }>) {
    const body = (item.bodyJson ?? {}) as {
      headings?: { level?: number; text?: string; content?: string[] }[];
      paragraphs?: string[];
      tables?: string[][][];
    };
    const sections: string[] = [`<h1>${this.escapeHtml(item.title)}</h1>`];
    const headings = Array.isArray(body.headings) ? body.headings : [];
    const paragraphs = Array.isArray(body.paragraphs) ? body.paragraphs.filter((value) => typeof value === 'string') : [];
    const tables = Array.isArray(body.tables) ? body.tables : this.parseTables(item.extractedTablesJson);

    for (const heading of headings) {
      const headingText = typeof heading.text === 'string' ? heading.text.trim() : '';
      const level = Math.min(6, Math.max(2, Number(heading.level) || 2));
      if (headingText) sections.push(`<h${level}>${this.escapeHtml(headingText)}</h${level}>`);
      const content = Array.isArray(heading.content) ? heading.content : [];
      for (const paragraph of content) {
        if (typeof paragraph === 'string' && paragraph.trim()) {
          sections.push(`<p>${this.escapeHtml(paragraph.trim())}</p>`);
        }
      }
    }

    if (sections.length === 1) {
      for (const paragraph of paragraphs) {
        if (paragraph.trim()) sections.push(`<p>${this.escapeHtml(paragraph.trim())}</p>`);
      }
    }

    for (const table of tables) {
      sections.push(this.tableToHtml(table));
    }

    const attribution = (item.sourceAttributionJson ?? {}) as {
      originalFileName?: string;
      sourceTitle?: string;
      sourceType?: string;
      sourceUrl?: string;
    };
    if (attribution.sourceUrl) {
      const label = attribution.sourceTitle || attribution.sourceUrl;
      sections.push(
        `<p><small>Source: <a href="${this.escapeAttribute(attribution.sourceUrl)}">${this.escapeHtml(label)}</a></small></p>`,
      );
    } else if (attribution.originalFileName) {
      sections.push(`<p><small>Source document: ${this.escapeHtml(attribution.originalFileName)}</small></p>`);
    }

    return sections.length > 1 ? sections.join('\n') : `<p>${this.escapeHtml(item.summary ?? item.title)}</p>`;
  }

  private parseTables(value: unknown): string[][][] {
    if (!Array.isArray(value)) return [];
    return value
      .filter((table): table is unknown[] => Array.isArray(table))
      .map((table) =>
        table
          .filter((row): row is unknown[] => Array.isArray(row))
          .map((row) => row.map((cell) => (typeof cell === 'string' ? cell : String(cell ?? '')))),
      )
      .filter((table) => table.length > 0);
  }

  private tableToHtml(table: string[][]) {
    const rows = table
      .map((row) => `<tr>${row.map((cell) => `<td>${this.escapeHtml(cell)}</td>`).join('')}</tr>`)
      .join('');
    return rows ? `<table><tbody>${rows}</tbody></table>` : '';
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttribute(value: string) {
    return this.escapeHtml(value).replace(/`/g, '&#96;');
  }

  private slugify(value: string) {
    const slug =
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 160) || 'imported-content';
    return `${slug}-${randomUUID().slice(0, 8)}`;
  }

  private async writeLog(
    importJobId: string,
    importItemId: string | null,
    action: string,
    status: string,
    createdById?: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.contentImportLog.create({
      data: {
        importJobId,
        importItemId,
        action,
        status,
        createdById,
        metadataJson: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  private async writeAudit(action: string, entityId: string, userId: string, metadata: Record<string, unknown>) {
    await this.prisma.auditLog.create({
      data: {
        action,
        entityId,
        entityType: 'ContentImportJob',
        metadata: metadata as Prisma.InputJsonValue,
        userId,
      },
    });
  }
}
