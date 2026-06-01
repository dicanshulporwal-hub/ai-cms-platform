import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class NavigationService {
  private publicCache = new Map<string, { data: any; cachedAt: number }>();
  private CACHE_TTL = 60_000;

  constructor(private readonly prisma: PrismaService) {}

  // === ADMIN CRUD ===
  async listMenus() {
    return this.prisma.menu.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: 'desc' }, take: 50, select: { id: true, name: true, slug: true, location: true, status: true, languageCode: true, isDefault: true, updatedAt: true, _count: { select: { items: true } } } });
  }

  async getMenu(id: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id }, include: { items: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } } });
    if (!menu || menu.deletedAt) throw new NotFoundException('Menu not found.');
    return menu;
  }

  async createMenu(dto: { name: string; slug: string; description?: string; location?: string; languageCode?: string }, user: AuthenticatedUser) {
    if (!dto.name || !dto.slug) throw new BadRequestException('Name and slug are required.');
    const existing = await this.prisma.menu.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug already exists.');
    const menu = await this.prisma.menu.create({ data: { name: dto.name, slug: dto.slug, description: dto.description, location: (dto.location || 'HEADER') as any, languageCode: dto.languageCode, createdById: user.id } });
    await this.audit('menu.created', menu.id, user.id, { name: dto.name });
    return menu;
  }

  async updateMenu(id: string, dto: any, user: AuthenticatedUser) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu || menu.deletedAt) throw new NotFoundException('Menu not found.');
    const updated = await this.prisma.menu.update({ where: { id }, data: dto });
    this.invalidateCache();
    await this.audit('menu.updated', id, user.id, {});
    return updated;
  }

  async activateMenu(id: string, user: AuthenticatedUser) {
    await this.prisma.menu.update({ where: { id }, data: { status: 'MENU_ACTIVE' } });
    this.invalidateCache();
    await this.audit('menu.activated', id, user.id, {});
    return this.getMenu(id);
  }

  async deleteMenu(id: string, user: AuthenticatedUser) {
    await this.prisma.menu.update({ where: { id }, data: { deletedAt: new Date() } });
    this.invalidateCache();
    await this.audit('menu.deleted', id, user.id, {});
    return { message: 'Menu deleted.' };
  }

  // === MENU ITEMS ===
  async addItem(menuId: string, dto: { label: string; linkType: string; url?: string; parentId?: string; linkedSourceType?: string; linkedSourceId?: string; moduleKey?: string; sortOrder?: number; openInNewTab?: boolean; noFollow?: boolean }, user: AuthenticatedUser) {
    if (!dto.label || !dto.linkType) throw new BadRequestException('Label and link type are required.');
    const item = await this.prisma.menuItem.create({ data: { menuId, label: dto.label, linkType: dto.linkType, url: dto.url, parentId: dto.parentId, linkedSourceType: dto.linkedSourceType, linkedSourceId: dto.linkedSourceId, moduleKey: dto.moduleKey, sortOrder: dto.sortOrder ?? 0, openInNewTab: dto.openInNewTab ?? false, noFollow: dto.noFollow ?? false } });
    this.invalidateCache();
    await this.audit('menu_item.created', menuId, user.id, { label: dto.label });
    return item;
  }

  async updateItem(menuId: string, itemId: string, dto: any, user: AuthenticatedUser) {
    const item = await this.prisma.menuItem.findFirst({ where: { id: itemId, menuId } });
    if (!item) throw new NotFoundException('Menu item not found.');
    const updated = await this.prisma.menuItem.update({ where: { id: itemId }, data: dto });
    this.invalidateCache();
    await this.audit('menu_item.updated', menuId, user.id, { itemId });
    return updated;
  }

  async deleteItem(menuId: string, itemId: string, user: AuthenticatedUser) {
    await this.prisma.menuItem.update({ where: { id: itemId }, data: { deletedAt: new Date() } });
    this.invalidateCache();
    await this.audit('menu_item.deleted', menuId, user.id, { itemId });
    return { message: 'Item deleted.' };
  }

  async reorderItems(menuId: string, items: { id: string; sortOrder: number }[], user: AuthenticatedUser) {
    for (const item of items) {
      await this.prisma.menuItem.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } });
    }
    this.invalidateCache();
    return { message: 'Reordered.' };
  }

  // === PUBLIC (cached) ===
  async getPublicMenuByLocation(location: string, languageCode?: string) {
    const cacheKey = `${location}_${languageCode || 'default'}`;
    const cached = this.publicCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) return cached.data;

    const menu = await this.prisma.menu.findFirst({ where: { location: location as any, status: 'MENU_ACTIVE', deletedAt: null, ...(languageCode ? { languageCode } : {}) }, include: { items: { where: { isVisible: true, deletedAt: null }, orderBy: { sortOrder: 'asc' }, select: { id: true, label: true, url: true, target: true, parentId: true, openInNewTab: true, noFollow: true, sortOrder: true, linkType: true } } } });

    if (!menu) { this.publicCache.set(cacheKey, { data: null, cachedAt: Date.now() }); return null; }

    // Build tree
    const items = menu.items;
    const topLevel = items.filter(i => !i.parentId);
    const tree = topLevel.map(item => ({ ...item, children: items.filter(c => c.parentId === item.id) }));

    const result = { id: menu.id, name: menu.name, slug: menu.slug, location: menu.location, items: tree };
    this.publicCache.set(cacheKey, { data: result, cachedAt: Date.now() });
    return result;
  }

  async getPublicMenus() {
    return this.prisma.menu.findMany({ where: { status: 'MENU_ACTIVE', deletedAt: null }, select: { id: true, name: true, slug: true, location: true, languageCode: true }, take: 20 });
  }

  // === SUMMARY ===
  async getSummary() {
    const [total, active, headerMenus, footerMenus] = await Promise.all([
      this.prisma.menu.count({ where: { deletedAt: null } }),
      this.prisma.menu.count({ where: { status: 'MENU_ACTIVE', deletedAt: null } }),
      this.prisma.menu.count({ where: { location: 'HEADER', status: 'MENU_ACTIVE', deletedAt: null } }),
      this.prisma.menu.count({ where: { location: 'FOOTER', status: 'MENU_ACTIVE', deletedAt: null } }),
    ]);
    return { total, active, headerMenus, footerMenus };
  }

  private invalidateCache() { this.publicCache.clear(); }

  private async audit(action: string, entityId: string, userId: string, metadata: any) {
    await this.prisma.auditLog.create({ data: { action, entityId, entityType: 'Menu', userId, metadata: metadata as unknown as Prisma.InputJsonValue } });
  }
}
