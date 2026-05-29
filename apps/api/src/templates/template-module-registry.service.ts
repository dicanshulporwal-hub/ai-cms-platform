import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class TemplateModuleRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.templateModuleRegistry.findMany({ orderBy: [{ category: 'asc' }, { moduleName: 'asc' }] });
  }

  async findOne(id: string) {
    const mod = await this.prisma.templateModuleRegistry.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found.');
    return mod;
  }

  async findActivePublic() {
    return this.prisma.templateModuleRegistry.findMany({ where: { isActive: true, isPublicEnabled: true }, orderBy: [{ category: 'asc' }, { moduleName: 'asc' }] });
  }

  async create(dto: { moduleKey: string; moduleName: string; moduleType: string; description?: string; category?: string; defaultConfigJson?: Record<string, unknown>; supportedRegionTypesJson?: string[] }, user: AuthenticatedUser) {
    const existing = await this.prisma.templateModuleRegistry.findUnique({ where: { moduleKey: dto.moduleKey } });
    if (existing) throw new ConflictException('Module key already exists.');
    const mod = await this.prisma.templateModuleRegistry.create({
      data: {
        moduleKey: dto.moduleKey, moduleName: dto.moduleName, moduleType: dto.moduleType,
        description: dto.description, category: dto.category ?? 'Custom',
        defaultConfigJson: (dto.defaultConfigJson ?? {}) as unknown as Prisma.InputJsonValue,
        supportedRegionTypesJson: (dto.supportedRegionTypesJson ?? []) as unknown as Prisma.InputJsonValue,
      },
    });
    await this.prisma.auditLog.create({ data: { action: 'module_registry.created', entityId: mod.id, entityType: 'TemplateModuleRegistry', metadata: { moduleKey: dto.moduleKey } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return mod;
  }

  async update(id: string, dto: { moduleName?: string; description?: string; category?: string; defaultConfigJson?: Record<string, unknown>; supportedRegionTypesJson?: string[] }, user: AuthenticatedUser) {
    const mod = await this.findOne(id);
    if (mod.isSystemModule && dto.moduleName) {
      // Allow description/config changes but not key changes for system modules
    }
    const updated = await this.prisma.templateModuleRegistry.update({
      where: { id },
      data: {
        moduleName: dto.moduleName, description: dto.description, category: dto.category,
        defaultConfigJson: dto.defaultConfigJson ? (dto.defaultConfigJson as unknown as Prisma.InputJsonValue) : undefined,
        supportedRegionTypesJson: dto.supportedRegionTypesJson ? (dto.supportedRegionTypesJson as unknown as Prisma.InputJsonValue) : undefined,
      },
    });
    await this.prisma.auditLog.create({ data: { action: 'module_registry.updated', entityId: id, entityType: 'TemplateModuleRegistry', metadata: { moduleName: updated.moduleName } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return updated;
  }

  async updateStatus(id: string, isActive: boolean, user: AuthenticatedUser) {
    const mod = await this.findOne(id);
    const updated = await this.prisma.templateModuleRegistry.update({ where: { id }, data: { isActive } });
    await this.prisma.auditLog.create({ data: { action: isActive ? 'module_registry.activated' : 'module_registry.deactivated', entityId: id, entityType: 'TemplateModuleRegistry', metadata: { moduleKey: mod.moduleKey } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return updated;
  }

  async updatePublicVisibility(id: string, isPublicEnabled: boolean, user: AuthenticatedUser) {
    const mod = await this.findOne(id);
    const updated = await this.prisma.templateModuleRegistry.update({ where: { id }, data: { isPublicEnabled } });
    await this.prisma.auditLog.create({ data: { action: 'module_registry.public_visibility_changed', entityId: id, entityType: 'TemplateModuleRegistry', metadata: { moduleKey: mod.moduleKey, isPublicEnabled } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return updated;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const mod = await this.findOne(id);
    if (mod.isSystemModule) throw new ForbiddenException('System modules cannot be deleted.');
    await this.prisma.templateModuleRegistry.delete({ where: { id } });
    await this.prisma.auditLog.create({ data: { action: 'module_registry.deleted', entityId: id, entityType: 'TemplateModuleRegistry', metadata: { moduleKey: mod.moduleKey } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return { message: 'Module removed from registry.' };
  }
}
