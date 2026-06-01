import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, TemplateStatus } from '@prisma/client';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { HtmlTemplateAnalyzerService } from './html-template-analyzer.service';
import { HtmlToCmsConverterService } from './html-to-cms-converter.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.ps1', '.sh', '.php', '.jsp', '.asp', '.aspx', '.py', '.rb', '.java', '.dll'];
const ALLOWED_EXTENSIONS = ['.html', '.htm', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.ico', '.txt', '.md'];

@Injectable()
export class TemplateImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly analyzer: HtmlTemplateAnalyzerService,
    private readonly converter: HtmlToCmsConverterService,
  ) {}

  async createPasteJob(dto: {
    html: string;
    css?: string;
    sourceUrl?: string;
    licenseName?: string;
    licenseUrl?: string;
    attributionText?: string;
  }, user: AuthenticatedUser) {
    if (!dto.html?.trim()) throw new BadRequestException('HTML content is required.');

    const job = await this.prisma.templateImportJob.create({
      data: {
        importType: 'PASTE_CODE',
        status: 'PENDING',
        originalHtml: dto.html,
        originalCss: dto.css || '',
        sourceUrl: dto.sourceUrl || null,
        licenseName: dto.licenseName || null,
        licenseUrl: dto.licenseUrl || null,
        attributionText: dto.attributionText || null,
        createdById: user.id,
      },
    });

    await this.prisma.auditLog.create({
      data: { action: 'template_import.paste_submitted', entityId: job.id, entityType: 'TemplateImportJob', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue },
    });

    return job;
  }

  async createZipJob(file: { buffer: Buffer; originalname: string; size: number }, dto: {
    sourceUrl?: string;
    licenseName?: string;
    licenseUrl?: string;
    attributionText?: string;
  }, user: AuthenticatedUser) {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!file.originalname.endsWith('.zip')) throw new BadRequestException('Only ZIP files are accepted.');

    const maxSize = (this.configService.get<number>('MAX_TEMPLATE_IMPORT_SIZE_MB') ?? 25) * 1024 * 1024;
    if (file.size > maxSize) throw new BadRequestException('File exceeds maximum upload size.');

    // Validate ZIP contents
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(file.buffer);
    const entries = zip.getEntries();

    for (const entry of entries) {
      const entryName = entry.entryName;
      if (entryName.includes('..') || entryName.startsWith('/')) {
        throw new BadRequestException('Path traversal detected in ZIP.');
      }
      const ext = extname(entryName).toLowerCase();
      if (ext && DANGEROUS_EXTENSIONS.includes(ext)) {
        throw new BadRequestException(`Dangerous file type not allowed: ${ext}`);
      }
    }

    // Find HTML file
    const htmlEntry = entries.find((e: any) => e.entryName.match(/\.(html|htm)$/i) && !e.isDirectory);
    if (!htmlEntry) throw new BadRequestException('No HTML file found in ZIP.');

    const htmlContent = htmlEntry.getData().toString('utf8');

    // Find CSS files
    const cssEntries = entries.filter((e: any) => e.entryName.endsWith('.css') && !e.isDirectory);
    const cssContent = cssEntries.map((e: any) => e.getData().toString('utf8')).join('\n\n');

    // Check for JS files
    const allowJs = this.configService.get<string>('TEMPLATE_ALLOW_IMPORTED_JS') === 'true';
    const jsEntries = entries.filter((e: any) => e.entryName.endsWith('.js') && !e.isDirectory);

    // Save ZIP to disk
    const uploadDir = this.configService.get<string>('TEMPLATE_IMPORT_UPLOAD_DIR') ?? 'uploads/template-imports';
    const fileKey = `import-${Date.now()}`;
    const importDir = resolve(uploadDir, fileKey);
    mkdirSync(importDir, { recursive: true });
    zip.extractAllTo(importDir, true);

    const warnings: any[] = [];
    if (jsEntries.length > 0 && !allowJs) {
      warnings.push({ code: 'JS_BLOCKED', message: `${jsEntries.length} JavaScript file(s) found but custom JS is disabled.`, severity: 'warning' });
    }

    const job = await this.prisma.templateImportJob.create({
      data: {
        importType: 'ZIP_UPLOAD',
        status: 'PENDING',
        originalHtml: htmlContent,
        originalCss: cssContent,
        originalFileKey: fileKey,
        sourceUrl: dto.sourceUrl || null,
        licenseName: dto.licenseName || null,
        licenseUrl: dto.licenseUrl || null,
        attributionText: dto.attributionText || null,
        warningsJson: warnings.length > 0 ? (warnings as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        createdById: user.id,
      },
    });

    await this.prisma.auditLog.create({
      data: { action: 'template_import.zip_uploaded', entityId: job.id, entityType: 'TemplateImportJob', userId: user.id, metadata: { filename: file.originalname } as unknown as Prisma.InputJsonValue },
    });

    return job;
  }

  async getJob(id: string) {
    const job = await this.prisma.templateImportJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Import job not found.');
    return job;
  }

  async convertJob(id: string, user: AuthenticatedUser) {
    const job = await this.getJob(id);
    if (!job.originalHtml) throw new BadRequestException('No HTML content to convert.');
    if (job.status !== 'PENDING' && job.status !== 'FAILED') {
      throw new BadRequestException('Job is not in a convertible state.');
    }

    try {
      // Update status
      await this.prisma.templateImportJob.update({ where: { id }, data: { status: 'PROCESSING' } });

      // Sanitize HTML
      const sanitizedHtml = this.analyzer.sanitizeHtml(job.originalHtml);

      // Analyze
      const analysis = this.analyzer.analyze(sanitizedHtml);

      // Convert
      const result = this.converter.convert(sanitizedHtml, job.originalCss || '', analysis.regions, {
        sourceUrl: job.sourceUrl || undefined,
        licenseName: job.licenseName || undefined,
        licenseUrl: job.licenseUrl || undefined,
        attributionText: job.attributionText || undefined,
      });

      // Merge warnings
      const existingWarnings = (job.warningsJson as any[]) || [];
      const allWarnings = [...existingWarnings, ...analysis.warnings];

      // Update job
      const updated = await this.prisma.templateImportJob.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          detectedRegionsJson: analysis.regions as unknown as Prisma.InputJsonValue,
          convertedHtml: result.convertedHtml,
          convertedCss: result.convertedCss,
          generatedTemplateJson: result.templateJson as unknown as Prisma.InputJsonValue,
          warningsJson: allWarnings as unknown as Prisma.InputJsonValue,
        },
      });

      await this.prisma.auditLog.create({
        data: { action: 'template_import.converted', entityId: id, entityType: 'TemplateImportJob', userId: user.id, metadata: { regionsDetected: analysis.regions.length } as unknown as Prisma.InputJsonValue },
      });

      return updated;
    } catch (err) {
      await this.prisma.templateImportJob.update({
        where: { id },
        data: { status: 'FAILED', errorMessage: err instanceof Error ? err.message : 'Conversion failed.' },
      });
      throw err;
    }
  }

  async saveAsTemplate(id: string, dto: { name?: string }, user: AuthenticatedUser) {
    const job = await this.getJob(id);
    if (job.status !== 'CONVERTED') throw new BadRequestException('Job must be converted before saving.');

    const requireLicense = this.configService.get<string>('TEMPLATE_REQUIRE_LICENSE_INFO') !== 'false';
    if (requireLicense && (!job.licenseName || !job.sourceUrl)) {
      throw new BadRequestException('License name and source URL are required before saving.');
    }

    const templateJson = job.generatedTemplateJson as any;
    const name = dto.name || templateJson?.name || 'Imported Template';
    const slug = templateJson?.slug || `imported-${Date.now().toString(36)}`;

    // Check slug uniqueness
    const existing = await this.prisma.websiteTemplate.findUnique({ where: { slug } });
    if (existing && !existing.deletedAt) {
      throw new BadRequestException('A template with this slug already exists.');
    }

    // Create template
    const template = await this.prisma.websiteTemplate.create({
      data: {
        name,
        slug,
        description: templateJson?.description || null,
        version: '1.0.0',
        templateType: 'CUSTOM',
        status: TemplateStatus.DRAFT,
        isActive: false,
        configJson: {
          previewHtml: job.convertedHtml?.substring(0, 5000) || '',
          sourceType: 'HTML_IMPORTED',
          sourceUrl: job.sourceUrl,
          licenseName: job.licenseName,
          licenseUrl: job.licenseUrl,
          attributionText: job.attributionText,
        } as unknown as Prisma.InputJsonValue,
        storageProvider: 'local',
        fileKey: job.originalFileKey,
        uploadedById: user.id,
      },
    });

    // Create regions and modules from detected data
    const regions = (templateJson?.regions || []) as Array<{
      regionKey: string; regionName: string; regionType: string; sortOrder: number; isRequired: boolean; isActive: boolean;
    }>;
    const defaultModules = (templateJson?.defaultModules || []) as Array<{
      regionKey: string; moduleType: string; moduleKey: string; displayTitle: string;
    }>;

    for (const regionDef of regions) {
      const region = await this.prisma.templateRegion.create({
        data: {
          templateId: template.id,
          regionKey: regionDef.regionKey,
          regionName: regionDef.regionName,
          regionType: regionDef.regionType,
          sortOrder: regionDef.sortOrder,
          isRequired: regionDef.isRequired,
          isActive: regionDef.isActive ?? true,
        },
      });

      // Add default modules for this region
      const regionModules = defaultModules.filter(m => m.regionKey === regionDef.regionKey);
      for (let i = 0; i < regionModules.length; i++) {
        await this.prisma.templateRegionModule.create({
          data: {
            templateId: template.id,
            regionId: region.id,
            moduleType: regionModules[i].moduleType,
            moduleKey: regionModules[i].moduleKey,
            displayTitle: regionModules[i].displayTitle,
            configJson: {} as unknown as Prisma.InputJsonValue,
            sortOrder: i,
            isVisible: true,
          },
        });
      }
    }

    // Update job status
    await this.prisma.templateImportJob.update({
      where: { id },
      data: { status: 'SAVED_AS_TEMPLATE', savedTemplateId: template.id },
    });

    await this.prisma.auditLog.create({
      data: { action: 'template_import.saved_as_template', entityId: id, entityType: 'TemplateImportJob', userId: user.id, metadata: { templateId: template.id, templateName: name } as unknown as Prisma.InputJsonValue },
    });

    return template;
  }

  async deleteJob(id: string, user: AuthenticatedUser) {
    const job = await this.getJob(id);
    await this.prisma.templateImportJob.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: { action: 'template_import.deleted', entityId: id, entityType: 'TemplateImportJob', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue },
    });
    return { message: 'Import job deleted.' };
  }

  async listJobs(userId?: string) {
    return this.prisma.templateImportJob.findMany({
      where: userId ? { createdById: userId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
