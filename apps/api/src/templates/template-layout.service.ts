import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TemplateModuleRegistryService } from './template-module-registry.service';

const DEFAULT_REGIONS = [
  { regionKey: 'header', regionName: 'Header', regionType: 'HEADER', sortOrder: 0, isRequired: true },
  { regionKey: 'navigation', regionName: 'Navigation', regionType: 'NAVIGATION', sortOrder: 1, isRequired: false },
  { regionKey: 'main', regionName: 'Main Content', regionType: 'CONTENT', sortOrder: 2, isRequired: true },
  { regionKey: 'footer', regionName: 'Footer', regionType: 'FOOTER', sortOrder: 3, isRequired: true },
  { regionKey: 'chatbot', regionName: 'Chatbot', regionType: 'CHATBOT', sortOrder: 4, isRequired: false },
];

@Injectable()
export class TemplateLayoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moduleRegistryService: TemplateModuleRegistryService,
  ) {}

  async getRegions(templateId: string) {
    await this.ensureTemplateExists(templateId);
    return this.prisma.templateRegion.findMany({
      where: { templateId },
      include: { modules: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createRegion(templateId: string, dto: { regionKey: string; regionName: string; regionType?: string; sortOrder?: number; isRequired?: boolean }, user: AuthenticatedUser) {
    await this.ensureTemplateExists(templateId);
    const region = await this.prisma.templateRegion.create({
      data: { templateId, regionKey: dto.regionKey, regionName: dto.regionName, regionType: dto.regionType ?? 'CONTENT', sortOrder: dto.sortOrder ?? 0, isRequired: dto.isRequired ?? false },
    });
    await this.audit('template.region_created', templateId, user.id, { regionKey: dto.regionKey });
    return region;
  }

  async updateRegion(templateId: string, regionId: string, dto: { regionName?: string; description?: string; regionType?: string; sortOrder?: number; isActive?: boolean }, user: AuthenticatedUser) {
    const region = await this.prisma.templateRegion.findFirst({ where: { id: regionId, templateId } });
    if (!region) throw new NotFoundException('Region not found.');
    const updated = await this.prisma.templateRegion.update({ where: { id: regionId }, data: { regionName: dto.regionName, description: dto.description, regionType: dto.regionType, sortOrder: dto.sortOrder, isActive: dto.isActive } });
    await this.audit('template.region_updated', templateId, user.id, { regionId });
    return updated;
  }

  async deleteRegion(templateId: string, regionId: string, user: AuthenticatedUser) {
    const region = await this.prisma.templateRegion.findFirst({ where: { id: regionId, templateId } });
    if (!region) throw new NotFoundException('Region not found.');
    await this.prisma.templateRegion.delete({ where: { id: regionId } });
    await this.audit('template.region_deleted', templateId, user.id, { regionKey: region.regionKey });
    return { message: 'Region deleted.' };
  }

  async getRegionModules(templateId: string) {
    await this.ensureTemplateExists(templateId);
    return this.prisma.templateRegionModule.findMany({
      where: { templateId },
      include: { region: { select: { regionKey: true, regionName: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async addModule(templateId: string, regionId: string, dto: { moduleType: string; moduleKey: string; displayTitle: string; configJson?: Record<string, unknown>; sortOrder?: number }, user: AuthenticatedUser) {
    const region = await this.prisma.templateRegion.findFirst({ where: { id: regionId, templateId } });
    if (!region) throw new NotFoundException('Region not found.');
    const mod = await this.prisma.templateRegionModule.create({
      data: { templateId, regionId, moduleType: dto.moduleType, moduleKey: dto.moduleKey, displayTitle: dto.displayTitle, configJson: (dto.configJson ?? {}) as unknown as Prisma.InputJsonValue, sortOrder: dto.sortOrder ?? 0 },
    });
    await this.audit('template.module_added', templateId, user.id, { moduleType: dto.moduleType, regionId });
    return mod;
  }

  async updateModule(templateId: string, regionId: string, moduleId: string, dto: { displayTitle?: string; configJson?: Record<string, unknown>; sortOrder?: number; isVisible?: boolean }, user: AuthenticatedUser) {
    const mod = await this.prisma.templateRegionModule.findFirst({ where: { id: moduleId, templateId, regionId } });
    if (!mod) throw new NotFoundException('Module not found.');
    const updated = await this.prisma.templateRegionModule.update({ where: { id: moduleId }, data: { displayTitle: dto.displayTitle, configJson: dto.configJson ? (dto.configJson as unknown as Prisma.InputJsonValue) : undefined, sortOrder: dto.sortOrder, isVisible: dto.isVisible } });
    await this.audit('template.module_updated', templateId, user.id, { moduleId });
    return updated;
  }

  async deleteModule(templateId: string, regionId: string, moduleId: string, user: AuthenticatedUser) {
    const mod = await this.prisma.templateRegionModule.findFirst({ where: { id: moduleId, templateId, regionId } });
    if (!mod) throw new NotFoundException('Module not found.');
    await this.prisma.templateRegionModule.delete({ where: { id: moduleId } });
    await this.audit('template.module_removed', templateId, user.id, { moduleType: mod.moduleType, regionId });
    return { message: 'Module removed.' };
  }

  async getPreviewData(templateId: string) {
    const template = await this.prisma.websiteTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new NotFoundException('Template not found.');
    const regions = await this.getRegions(templateId);
    return { template, regions };
  }

  async getPublicRenderData() {
    const template = await this.prisma.websiteTemplate.findFirst({ where: { isActive: true, deletedAt: null } });
    if (!template) return { template: null, regions: [], modules: [], settings: null };
    const allowedModules = await this.moduleRegistryService.findActivePublic();
    const allowedModuleTypes = new Set(allowedModules.map((mod) => mod.moduleType));
    const regions = await this.prisma.templateRegion.findMany({ where: { templateId: template.id, isActive: true }, include: { modules: { where: { isVisible: true }, orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } });
    const filteredRegions = regions.map((region) => ({
      ...region,
      modules: region.modules.filter((mod) => allowedModuleTypes.has(mod.moduleType)),
    }));
    const settings = await this.prisma.settings.findFirst();
    return { template, regions: filteredRegions, settings: settings ? { siteName: settings.siteName, siteDescription: settings.siteDescription, siteLogo: settings.siteLogo, supportEmail: settings.supportEmail } : null };
  }

  async ensureDefaultRegions(templateId: string, configRegions?: Array<{ key: string; name: string; type: string; required?: boolean }>) {
    const existing = await this.prisma.templateRegion.findMany({ where: { templateId } });
    if (existing.length > 0) return existing;

    const regionsToCreate = configRegions?.length ? configRegions.map((r, i) => ({
      templateId, regionKey: r.key, regionName: r.name, regionType: r.type.toUpperCase(), sortOrder: i, isRequired: r.required ?? false,
    })) : DEFAULT_REGIONS.map((r) => ({ templateId, ...r }));

    for (const r of regionsToCreate) {
      await this.prisma.templateRegion.create({ data: r });
    }
    return this.prisma.templateRegion.findMany({ where: { templateId }, orderBy: { sortOrder: 'asc' } });
  }

  private async ensureTemplateExists(templateId: string) {
    const t = await this.prisma.websiteTemplate.findUnique({ where: { id: templateId } });
    if (!t || t.deletedAt) throw new NotFoundException('Template not found.');
  }

  private async audit(action: string, entityId: string, userId: string, metadata: Record<string, unknown>) {
    await this.prisma.auditLog.create({ data: { action, entityId, entityType: 'WebsiteTemplate', metadata: metadata as unknown as Prisma.InputJsonValue, userId } });
  }
}
