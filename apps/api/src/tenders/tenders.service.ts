import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class TendersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters?: { status?: string; categoryId?: string; procurementType?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.procurementType) where.procurementType = filters.procurementType;
    if (filters?.search) where.title = { contains: filters.search };
    return this.prisma.tender.findMany({ where, orderBy: [{ closingDate: 'asc' }, { createdAt: 'desc' }], take: 50, select: { id: true, title: true, slug: true, tenderNumber: true, departmentName: true, procurementType: true, status: true, closingDate: true, openingDate: true, publishedAt: true, corrigendumCount: true, category: { select: { id: true, name: true } } } });
  }

  async getById(id: string) {
    const t = await this.prisma.tender.findUnique({ where: { id }, include: { category: true, corrigenda: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } } } });
    if (!t || t.deletedAt) throw new NotFoundException('Tender not found.');
    return t;
  }

  async create(dto: any, user: AuthenticatedUser) {
    if (!dto.title || !dto.slug) throw new BadRequestException('Title and slug required.');
    const existing = await this.prisma.tender.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug exists.');
    const t = await this.prisma.tender.create({ data: { title: dto.title, slug: dto.slug, tenderNumber: dto.tenderNumber, referenceNumber: dto.referenceNumber, description: dto.description, summary: dto.summary, categoryId: dto.categoryId, departmentName: dto.departmentName, procurementType: (dto.procurementType || 'OTHER_PROCUREMENT') as any, closingDate: dto.closingDate ? new Date(dto.closingDate) : undefined, openingDate: dto.openingDate ? new Date(dto.openingDate) : undefined, estimatedValue: dto.estimatedValue, emdAmount: dto.emdAmount, contactName: dto.contactName, contactEmail: dto.contactEmail, submissionMode: dto.submissionMode, submissionUrl: dto.submissionUrl, seoTitle: dto.seoTitle, seoDescription: dto.seoDescription, createdById: user.id } });
    await this.audit('tender.created', t.id, user.id, { title: dto.title });
    return t;
  }

  async update(id: string, dto: any, user: AuthenticatedUser) {
    await this.getById(id);
    if (dto.closingDate) dto.closingDate = new Date(dto.closingDate);
    if (dto.openingDate) dto.openingDate = new Date(dto.openingDate);
    const updated = await this.prisma.tender.update({ where: { id }, data: dto });
    await this.audit('tender.updated', id, user.id, {});
    return updated;
  }

  async publish(id: string, user: AuthenticatedUser) {
    await this.prisma.tender.update({ where: { id }, data: { status: 'TENDER_PUBLISHED', publishedAt: new Date() } });
    await this.audit('tender.published', id, user.id, {});
    return this.getById(id);
  }

  async close(id: string, user: AuthenticatedUser) {
    await this.prisma.tender.update({ where: { id }, data: { status: 'TENDER_CLOSED' } });
    await this.audit('tender.closed', id, user.id, {});
    return { message: 'Tender closed.' };
  }

  async archive(id: string, user: AuthenticatedUser) {
    await this.prisma.tender.update({ where: { id }, data: { status: 'TENDER_ARCHIVED', archivedAt: new Date() } });
    await this.audit('tender.archived', id, user.id, {});
    return { message: 'Archived.' };
  }

  async deleteTender(id: string, user: AuthenticatedUser) {
    await this.prisma.tender.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit('tender.deleted', id, user.id, {});
    return { message: 'Deleted.' };
  }

  // === PUBLIC ===
  async publicList(filters?: { categorySlug?: string; procurementType?: string; search?: string; archive?: boolean }) {
    const where: any = { deletedAt: null };
    if (filters?.archive) { where.status = { in: ['TENDER_CLOSED', 'TENDER_AWARDED', 'TENDER_ARCHIVED'] }; }
    else { where.status = { in: ['TENDER_PUBLISHED', 'TENDER_OPEN'] }; }
    if (filters?.procurementType) where.procurementType = filters.procurementType;
    if (filters?.search) where.title = { contains: filters.search };
    return this.prisma.tender.findMany({ where, orderBy: { closingDate: 'asc' }, take: 50, select: { id: true, title: true, slug: true, tenderNumber: true, departmentName: true, procurementType: true, status: true, closingDate: true, openingDate: true, publishedAt: true, corrigendumCount: true, category: { select: { name: true, slug: true } } } });
  }

  async publicGetBySlug(slug: string) {
    const t = await this.prisma.tender.findUnique({ where: { slug }, include: { category: true, corrigenda: { where: { status: 'PUBLISHED', deletedAt: null }, orderBy: { createdAt: 'desc' } } } });
    if (!t || t.deletedAt || t.status === 'TENDER_DRAFT' || t.status === 'TENDER_UNDER_REVIEW') throw new NotFoundException('Tender not found.');
    return t;
  }

  // === CORRIGENDA ===
  async addCorrigendum(tenderId: string, dto: { title: string; description?: string; corrigendumNumber?: string }, user: AuthenticatedUser) {
    const corr = await this.prisma.tenderCorrigendum.create({ data: { tenderId, title: dto.title, description: dto.description, corrigendumNumber: dto.corrigendumNumber, createdById: user.id } });
    await this.prisma.tender.update({ where: { id: tenderId }, data: { corrigendumCount: { increment: 1 } } });
    await this.audit('corrigendum.created', tenderId, user.id, { title: dto.title });
    return corr;
  }

  async publishCorrigendum(corrigendumId: string, user: AuthenticatedUser) {
    await this.prisma.tenderCorrigendum.update({ where: { id: corrigendumId }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
    return { message: 'Corrigendum published.' };
  }

  // === CATEGORIES ===
  async listCategories() { return this.prisma.tenderCategory.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' }, take: 50 }); }
  async createCategory(dto: { name: string; slug: string; description?: string }, user: AuthenticatedUser) {
    return this.prisma.tenderCategory.create({ data: dto });
  }
  async deleteCategory(id: string) { await this.prisma.tenderCategory.update({ where: { id }, data: { deletedAt: new Date() } }); return { message: 'Deleted.' }; }

  // === SUMMARY ===
  async getSummary() {
    const [total, published, open, closed] = await Promise.all([
      this.prisma.tender.count({ where: { deletedAt: null } }),
      this.prisma.tender.count({ where: { status: 'TENDER_PUBLISHED', deletedAt: null } }),
      this.prisma.tender.count({ where: { status: 'TENDER_OPEN', deletedAt: null } }),
      this.prisma.tender.count({ where: { status: 'TENDER_CLOSED', deletedAt: null } }),
    ]);
    return { total, published, open, closed };
  }

  private async audit(action: string, entityId: string, userId: string, metadata: any) {
    await this.prisma.auditLog.create({ data: { action, entityId, entityType: 'Tender', userId, metadata: metadata as unknown as Prisma.InputJsonValue } });
  }
}
