import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, TemplateStatus } from '@prisma/client';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve, extname } from 'path';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { ComplianceCheckerService } from './compliance-checker.service';

const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.ps1', '.sh', '.php', '.jsp', '.asp', '.aspx'];
const ALLOWED_EXTENSIONS = ['.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.ico', '.txt', '.md'];

@Injectable()
export class TemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly complianceChecker: ComplianceCheckerService,
  ) {}

  async findAll() {
    const templates = await this.prisma.websiteTemplate.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
    return templates;
  }

  async findOne(id: string) {
    const template = await this.prisma.websiteTemplate.findUnique({ where: { id } });
    if (!template || template.deletedAt) throw new NotFoundException('Template not found.');
    return template;
  }

  async getActiveTemplate() {
    const template = await this.prisma.websiteTemplate.findFirst({
      where: { isActive: true, deletedAt: null },
    });
    return template;
  }

  async upload(
    file: Express.Multer.File,
    user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!file.originalname.endsWith('.zip')) throw new BadRequestException('Only ZIP files are accepted.');

    const maxSize = (this.configService.get<number>('MAX_TEMPLATE_UPLOAD_SIZE_MB') ?? 25) * 1024 * 1024;
    if (file.size > maxSize) throw new BadRequestException('File exceeds maximum upload size.');

    // Parse the ZIP and extract template.json
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(file.buffer);
    const entries = zip.getEntries();

    // Security: check for dangerous files and path traversal
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

    // Find template.json
    const templateJsonEntry = entries.find((e: any) => e.entryName.endsWith('template.json'));
    if (!templateJsonEntry) throw new BadRequestException('template.json is required in the ZIP package.');

    let templateConfig: Record<string, unknown>;
    try {
      templateConfig = JSON.parse(templateJsonEntry.getData().toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid template.json format.');
    }

    // Validate required fields
    const name = templateConfig.name as string;
    const slug = templateConfig.slug as string;
    const version = templateConfig.version as string;
    const entry = templateConfig.entry as string;
    const type = (templateConfig.type as string) ?? 'CUSTOM';

    if (!name) throw new BadRequestException('template.json: name is required.');
    if (!slug) throw new BadRequestException('template.json: slug is required.');
    if (!version) throw new BadRequestException('template.json: version is required.');
    if (!entry) throw new BadRequestException('template.json: entry file is required.');

    // Check slug uniqueness
    const existing = await this.prisma.websiteTemplate.findUnique({ where: { slug } });
    if (existing && !existing.deletedAt) throw new ConflictException('A template with this slug already exists.');

    // Check entry file exists in ZIP
    const entryFile = entries.find((e: any) => e.entryName.endsWith(entry));
    if (!entryFile) throw new BadRequestException(`Entry file "${entry}" not found in ZIP.`);

    // Check for custom JS
    const allowJs = this.configService.get<string>('TEMPLATE_ALLOW_CUSTOM_JS') === 'true';
    if (!allowJs) {
      const jsFiles = entries.filter((e: any) => extname(e.entryName).toLowerCase() === '.js');
      if (jsFiles.length > 0) {
        throw new BadRequestException('Custom JavaScript files are not allowed (TEMPLATE_ALLOW_CUSTOM_JS=false).');
      }
    }

    // Extract to upload directory
    const uploadDir = this.configService.get<string>('TEMPLATE_UPLOAD_DIR') ?? 'uploads/templates';
    const templateDir = resolve(uploadDir, slug);
    mkdirSync(templateDir, { recursive: true });
    zip.extractAllTo(templateDir, true);

    // Get HTML content for compliance check
    const htmlPath = join(templateDir, entry);
    let htmlContent: string | undefined;
    if (existsSync(htmlPath)) {
      htmlContent = readFileSync(htmlPath, 'utf8');
    }

    // Run compliance check
    const complianceReport = this.complianceChecker.runChecks(templateConfig, htmlContent);

    // Get thumbnail
    const thumbnailFile = templateConfig.thumbnail as string | undefined;
    const baseUrl = this.configService.get<string>('PUBLIC_TEMPLATE_BASE_URL') ?? '/uploads/templates';
    const thumbnailUrl = thumbnailFile ? `${baseUrl}/${slug}/${thumbnailFile}` : null;
    const fileUrl = `${baseUrl}/${slug}/${entry}`;

    // Create template record
    const template = await this.prisma.websiteTemplate.create({
      data: {
        name,
        slug,
        description: (templateConfig.description as string) ?? null,
        version,
        templateType: type as any,
        status: TemplateStatus.DRAFT,
        isActive: false,
        thumbnailUrl,
        configJson: templateConfig as unknown as Prisma.InputJsonValue,
        complianceJson: complianceReport as unknown as Prisma.InputJsonValue,
        fileKey: slug,
        fileUrl,
        storageProvider: 'local',
        uploadedById: user.id,
      },
    });

    // Create version record
    await this.prisma.templateVersion.create({
      data: {
        templateId: template.id,
        version,
        fileKey: slug,
        fileUrl,
        configJson: templateConfig as unknown as Prisma.InputJsonValue,
        complianceJson: complianceReport as unknown as Prisma.InputJsonValue,
        uploadedById: user.id,
      },
    });

    // Store compliance checks
    for (const check of complianceReport.checks) {
      await this.prisma.templateComplianceCheck.create({
        data: {
          templateId: template.id,
          checkKey: check.checkKey,
          checkTitle: check.checkTitle,
          checkCategory: check.checkCategory,
          status: check.status as any,
          severity: check.severity as any,
          message: check.message,
          recommendation: check.recommendation,
        },
      });
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'template.uploaded',
        entityId: template.id,
        entityType: 'WebsiteTemplate',
        metadata: { name, slug, version } as unknown as Prisma.InputJsonValue,
        userId: user.id,
      },
    });

    return { ...template, complianceReport };
  }

  async update(id: string, dto: { name?: string; description?: string; templateType?: string }, user: AuthenticatedUser) {
    const template = await this.findOne(id);

    const updated = await this.prisma.websiteTemplate.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        templateType: dto.templateType as any,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'template.updated',
        entityId: id,
        entityType: 'WebsiteTemplate',
        metadata: dto as unknown as Prisma.InputJsonValue,
        userId: user.id,
      },
    });

    return updated;
  }

  async activate(id: string, user: AuthenticatedUser) {
    const template = await this.findOne(id);
    if (template.status === TemplateStatus.ARCHIVED) {
      throw new ForbiddenException('Cannot activate an archived template.');
    }

    // Deactivate all other templates
    await this.prisma.websiteTemplate.updateMany({
      where: { isActive: true },
      data: { isActive: false, status: TemplateStatus.INACTIVE },
    });

    // Activate this one
    const activated = await this.prisma.websiteTemplate.update({
      where: { id },
      data: { isActive: true, status: TemplateStatus.ACTIVE },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'template.activated',
        entityId: id,
        entityType: 'WebsiteTemplate',
        metadata: { name: template.name } as unknown as Prisma.InputJsonValue,
        userId: user.id,
      },
    });

    return activated;
  }

  async deactivate(id: string, user: AuthenticatedUser) {
    const template = await this.findOne(id);

    const deactivated = await this.prisma.websiteTemplate.update({
      where: { id },
      data: { isActive: false, status: TemplateStatus.INACTIVE },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'template.deactivated',
        entityId: id,
        entityType: 'WebsiteTemplate',
        metadata: { name: template.name } as unknown as Prisma.InputJsonValue,
        userId: user.id,
      },
    });

    return deactivated;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const template = await this.findOne(id);
    if (template.isActive) throw new ForbiddenException('Cannot delete an active template. Deactivate it first.');

    await this.prisma.websiteTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'template.deleted',
        entityId: id,
        entityType: 'WebsiteTemplate',
        metadata: { name: template.name } as unknown as Prisma.InputJsonValue,
        userId: user.id,
      },
    });

    return { message: 'Template deleted successfully.' };
  }

  async runComplianceCheck(id: string) {
    const template = await this.findOne(id);
    const config = (template.configJson as Record<string, unknown>) ?? {};

    // Try to read HTML from file
    const uploadDir = this.configService.get<string>('TEMPLATE_UPLOAD_DIR') ?? 'uploads/templates';
    const entry = (config.entry as string) ?? 'index.html';
    const htmlPath = resolve(uploadDir, template.slug, entry);
    let htmlContent: string | undefined;
    if (existsSync(htmlPath)) {
      htmlContent = readFileSync(htmlPath, 'utf8');
    }

    const report = this.complianceChecker.runChecks(config, htmlContent);

    // Update template compliance
    await this.prisma.websiteTemplate.update({
      where: { id },
      data: { complianceJson: report as unknown as Prisma.InputJsonValue },
    });

    // Upsert compliance checks
    await this.prisma.templateComplianceCheck.deleteMany({ where: { templateId: id } });
    for (const check of report.checks) {
      await this.prisma.templateComplianceCheck.create({
        data: {
          templateId: id,
          checkKey: check.checkKey,
          checkTitle: check.checkTitle,
          checkCategory: check.checkCategory,
          status: check.status as any,
          severity: check.severity as any,
          message: check.message,
          recommendation: check.recommendation,
        },
      });
    }

    return report;
  }

  async getComplianceReport(id: string) {
    const template = await this.findOne(id);
    if (template.complianceJson) return template.complianceJson;
    return this.runComplianceCheck(id);
  }
}
