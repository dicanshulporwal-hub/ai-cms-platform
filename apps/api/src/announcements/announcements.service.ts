import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters?: { status?: string; type?: string; categoryId?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.announcementType = filters.type;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.search) where.title = { contains: filters.search };
    return this.prisma.announcement.findMany({ where, orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }], take: 50, select: { id: true, title: true, slug: true, summary: true, announcementType: true, status: true, priority: true, isPinned: true, isImportant: true, publishedAt: true, expiresAt: true, createdAt: true, category: { select: { id: true, name: true } } } });
  }

  async getById(id: string) {
    const a = await this.prisma.announcement.findUnique({ where: { id }, include: { category: true } });
    if (!a || a.deletedAt) throw new NotFoundException('Announcement not found.');
    return a;
  }

  async create(dto: { title: string; slug: string; summary?: string; content?: string; announcementType?: string; categoryId?: string; priority?: string; publishAt?: string; expiresAt?: string; seoTitle?: string; seoDescription?: string }, user: AuthenticatedUser) {
    if (!dto.title || !dto.slug) throw new BadRequestException('Title and slug are required.');
    const existing = await this.prisma.announcement.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug already exists.');
    const a = await this.prisma.announcement.create({ data: { title: dto.title, slug: dto.slug, summary: dto.summary, content: dto.content, announcementType: (dto.announcementType || 'ANNOUNCEMENT') as any, categoryId: dto.categoryId, priority: (dto.priority || 'ANN_NORMAL') as any, publishAt: dto.publishAt ? new Date(dto.publishAt) : undefined, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined, seoTitle: dto.seoTitle, seoDescription: dto.seoDescription, createdById: user.id } });
    await this.audit('announcement.created', a.id, user.id, { title: dto.title });
    return a;
  }

  async update(id: string, dto: any, user: AuthenticatedUser) {
    await this.getById(id);
    if (dto.publishAt) dto.publishAt = new Date(dto.publishAt);
    if (dto.expiresAt) dto.expiresAt = new Date(dto.expiresAt);
    const updated = await this.prisma.announcement.update({ where: { id }, data: dto });
    await this.audit('announcement.updated', id, user.id, {});
    return updated;
  }

  async publish(id: string, user: AuthenticatedUser) {
    await this.prisma.announcement.update({ where: { id }, data: { status: 'ANN_PUBLISHED', publishedAt: new Date() } });
    await this.audit('announcement.published', id, user.id, {});
    return this.getById(id);
  }

  async archive(id: string, user: AuthenticatedUser) {
    await this.prisma.announcement.update({ where: { id }, data: { status: 'ANN_ARCHIVED', archivedAt: new Date() } });
    await this.audit('announcement.archived', id, user.id, {});
    return { message: 'Archived.' };
  }

  async deleteAnnouncement(id: string, user: AuthenticatedUser) {
    await this.prisma.announcement.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit('announcement.deleted', id, user.id, {});
    return { message: 'Deleted.' };
  }

  async togglePin(id: string, user: AuthenticatedUser) {
    const a = await this.getById(id);
    await this.prisma.announcement.update({ where: { id }, data: { isPinned: !a.isPinned } });
    return { isPinned: !a.isPinned };
  }

  async toggleImportant(id: string, user: AuthenticatedUser) {
    const a = await this.getById(id);
    await this.prisma.announcement.update({ where: { id }, data: { isImportant: !a.isImportant } });
    return { isImportant: !a.isImportant };
  }

  // === PUBLIC ===
  async publicList(filters?: { type?: string; categorySlug?: string; search?: string }) {
    const where: any = { status: 'ANN_PUBLISHED', deletedAt: null };
    if (filters?.type) where.announcementType = filters.type;
    if (filters?.search) where.title = { contains: filters.search };
    // Hide expired
    where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];

    return this.prisma.announcement.findMany({ where, orderBy: [{ isPinned: 'desc' }, { isImportant: 'desc' }, { publishedAt: 'desc' }], take: 50, select: { id: true, title: true, slug: true, summary: true, announcementType: true, priority: true, isPinned: true, isImportant: true, publishedAt: true, expiresAt: true, category: { select: { name: true, slug: true } } } });
  }

  async publicGetBySlug(slug: string) {
    const a = await this.prisma.announcement.findUnique({ where: { slug }, select: { id: true, title: true, slug: true, summary: true, content: true, announcementType: true, priority: true, isPinned: true, isImportant: true, publishedAt: true, expiresAt: true, seoTitle: true, seoDescription: true, category: { select: { name: true, slug: true } } } });
    if (!a) throw new NotFoundException('Announcement not found.');
    return a;
  }

  // === CATEGORIES ===
  async listCategories() { return this.prisma.announcementCategory.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' }, take: 50 }); }
  async createCategory(dto: { name: string; slug: string; description?: string }, user: AuthenticatedUser) {
    if (!dto.name || !dto.slug) throw new BadRequestException('Name and slug required.');
    return this.prisma.announcementCategory.create({ data: dto });
  }
  async updateCategory(id: string, dto: any) { return this.prisma.announcementCategory.update({ where: { id }, data: dto }); }
  async deleteCategory(id: string) { await this.prisma.announcementCategory.update({ where: { id }, data: { deletedAt: new Date() } }); return { message: 'Deleted.' }; }

  // === SUMMARY ===
  async getSummary() {
    const [total, published, draft, expired] = await Promise.all([
      this.prisma.announcement.count({ where: { deletedAt: null } }),
      this.prisma.announcement.count({ where: { status: 'ANN_PUBLISHED', deletedAt: null } }),
      this.prisma.announcement.count({ where: { status: 'ANN_DRAFT', deletedAt: null } }),
      this.prisma.announcement.count({ where: { status: 'ANN_EXPIRED', deletedAt: null } }),
    ]);
    return { total, published, draft, expired };
  }

  private async audit(action: string, entityId: string, userId: string, metadata: any) {
    await this.prisma.auditLog.create({ data: { action, entityId, entityType: 'Announcement', userId, metadata: metadata as unknown as Prisma.InputJsonValue } });
  }
}
