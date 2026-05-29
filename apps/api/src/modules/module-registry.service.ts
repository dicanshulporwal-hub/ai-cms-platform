import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class ModuleRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { category?: string; isEnabled?: boolean }) {
    const where: Prisma.CmsModuleWhereInput = {};
    if (filters?.category) where.category = filters.category;
    if (filters?.isEnabled !== undefined) where.isEnabledGlobally = filters.isEnabled;
    return this.prisma.cmsModule.findMany({ where, orderBy: [{ category: 'asc' }, { moduleName: 'asc' }] });
  }

  async findOne(moduleKey: string) {
    const mod = await this.prisma.cmsModule.findUnique({ where: { moduleKey } });
    if (!mod) throw new NotFoundException('Module not found.');
    return mod;
  }

  async isModuleEnabled(moduleKey: string, projectId?: string): Promise<boolean> {
    const mod = await this.prisma.cmsModule.findUnique({ where: { moduleKey } });
    if (!mod) return false;
    if (!mod.isEnabledGlobally) return false;
    if (projectId) {
      const projectConfig = await this.prisma.projectModuleConfig.findUnique({ where: { projectId_moduleKey: { projectId, moduleKey } } });
      if (projectConfig && !projectConfig.isEnabled) return false;
    }
    return true;
  }

  async isPublicEnabled(moduleKey: string, projectId?: string): Promise<boolean> {
    const mod = await this.prisma.cmsModule.findUnique({ where: { moduleKey } });
    if (!mod || !mod.isEnabledGlobally || !mod.isPublicEnabled) return false;
    if (projectId) {
      const projectConfig = await this.prisma.projectModuleConfig.findUnique({ where: { projectId_moduleKey: { projectId, moduleKey } } });
      if (projectConfig && !projectConfig.isPublicEnabled) return false;
    }
    return true;
  }

  async isAdminVisible(moduleKey: string): Promise<boolean> {
    const mod = await this.prisma.cmsModule.findUnique({ where: { moduleKey } });
    return mod ? mod.isEnabledGlobally && mod.isAdminVisible : false;
  }

  async isTemplateAvailable(moduleKey: string): Promise<boolean> {
    const mod = await this.prisma.cmsModule.findUnique({ where: { moduleKey } });
    return mod ? mod.isEnabledGlobally && mod.isTemplateAvailable : false;
  }

  async getEnabledModules() {
    return this.prisma.cmsModule.findMany({ where: { isEnabledGlobally: true }, orderBy: { moduleName: 'asc' } });
  }

  async getSidebarModules() {
    return this.prisma.cmsModule.findMany({ where: { isEnabledGlobally: true, isAdminVisible: true }, orderBy: [{ category: 'asc' }, { moduleName: 'asc' }] });
  }

  async getPublicEnabledModules() {
    return this.prisma.cmsModule.findMany({ where: { isEnabledGlobally: true, isPublicEnabled: true }, select: { moduleKey: true, moduleName: true, publicRoutePath: true, isPublicEnabled: true } });
  }

  async getTemplateAvailableModules() {
    return this.prisma.cmsModule.findMany({ where: { isEnabledGlobally: true, isTemplateAvailable: true } });
  }

  async enableModule(moduleKey: string, user: AuthenticatedUser) {
    const mod = await this.findOne(moduleKey);
    // Check dependencies
    if (mod.dependsOnJson) {
      const deps = mod.dependsOnJson as string[];
      for (const dep of deps) {
        const depMod = await this.prisma.cmsModule.findUnique({ where: { moduleKey: dep } });
        if (depMod && !depMod.isEnabledGlobally) {
          throw new ForbiddenException(`Cannot enable "${mod.moduleName}": dependency "${dep}" is disabled. Enable it first.`);
        }
      }
    }
    const updated = await this.prisma.cmsModule.update({ where: { moduleKey }, data: { isEnabledGlobally: true } });
    await this.audit('module.enabled', moduleKey, user.id, { moduleName: mod.moduleName });
    return updated;
  }

  async disableModule(moduleKey: string, user: AuthenticatedUser) {
    const mod = await this.findOne(moduleKey);
    if (mod.isCoreModule) throw new ForbiddenException('Core modules cannot be disabled.');
    // Check if other enabled modules depend on this
    const dependents = await this.prisma.cmsModule.findMany({ where: { isEnabledGlobally: true } });
    const affected = dependents.filter(d => {
      const deps = d.dependsOnJson as string[] | null;
      return deps?.includes(moduleKey);
    });
    if (affected.length > 0) {
      const names = affected.map(a => a.moduleName).join(', ');
      throw new ForbiddenException(`Cannot disable "${mod.moduleName}": these modules depend on it: ${names}. Disable them first.`);
    }
    const updated = await this.prisma.cmsModule.update({ where: { moduleKey }, data: { isEnabledGlobally: false } });
    await this.audit('module.disabled', moduleKey, user.id, { moduleName: mod.moduleName });
    return updated;
  }

  async updateAdminVisibility(moduleKey: string, isAdminVisible: boolean, user: AuthenticatedUser) {
    await this.findOne(moduleKey);
    const updated = await this.prisma.cmsModule.update({ where: { moduleKey }, data: { isAdminVisible } });
    await this.audit('module.admin_visibility_changed', moduleKey, user.id, { isAdminVisible });
    return updated;
  }

  async updatePublicVisibility(moduleKey: string, isPublicEnabled: boolean, user: AuthenticatedUser) {
    await this.findOne(moduleKey);
    const updated = await this.prisma.cmsModule.update({ where: { moduleKey }, data: { isPublicEnabled } });
    await this.audit('module.public_visibility_changed', moduleKey, user.id, { isPublicEnabled });
    return updated;
  }

  async updateTemplateAvailability(moduleKey: string, isTemplateAvailable: boolean, user: AuthenticatedUser) {
    await this.findOne(moduleKey);
    const updated = await this.prisma.cmsModule.update({ where: { moduleKey }, data: { isTemplateAvailable } });
    await this.audit('module.template_availability_changed', moduleKey, user.id, { isTemplateAvailable });
    return updated;
  }

  async registerModule(dto: { moduleKey: string; moduleName: string; description?: string; category?: string; routePath?: string; publicRoutePath?: string; isPublicEnabled?: boolean; isTemplateAvailable?: boolean; dependsOnJson?: string[] }, user: AuthenticatedUser) {
    const mod = await this.prisma.cmsModule.create({
      data: {
        moduleKey: dto.moduleKey, moduleName: dto.moduleName, description: dto.description,
        category: dto.category ?? 'CUSTOM', routePath: dto.routePath, publicRoutePath: dto.publicRoutePath,
        isPublicEnabled: dto.isPublicEnabled ?? false, isTemplateAvailable: dto.isTemplateAvailable ?? false,
        dependsOnJson: dto.dependsOnJson ? (dto.dependsOnJson as unknown as Prisma.InputJsonValue) : undefined,
      },
    });
    await this.audit('module.registered', dto.moduleKey, user.id, { moduleName: dto.moduleName });
    return mod;
  }

  async updateModule(moduleKey: string, dto: { moduleName?: string; description?: string; category?: string; routePath?: string; publicRoutePath?: string; icon?: string; settingsJson?: Record<string, unknown> }, user: AuthenticatedUser) {
    await this.findOne(moduleKey);
    const updated = await this.prisma.cmsModule.update({
      where: { moduleKey },
      data: { moduleName: dto.moduleName, description: dto.description, category: dto.category, routePath: dto.routePath, publicRoutePath: dto.publicRoutePath, icon: dto.icon, settingsJson: dto.settingsJson ? (dto.settingsJson as unknown as Prisma.InputJsonValue) : undefined },
    });
    await this.audit('module.updated', moduleKey, user.id, { moduleName: updated.moduleName });
    return updated;
  }

  private async audit(action: string, entityId: string, userId: string, metadata: Record<string, unknown>) {
    await this.prisma.auditLog.create({ data: { action, entityId, entityType: 'CmsModule', metadata: metadata as unknown as Prisma.InputJsonValue, userId } });
  }
}
