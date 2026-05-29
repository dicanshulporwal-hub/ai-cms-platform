import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FaqStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class FaqsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { search?: string; status?: string; categoryId?: string; isFeatured?: string; page?: number; limit?: number }) {
    const { search, status, categoryId, isFeatured, page = 1, limit = 50 } = query;
    const where: Prisma.FaqWhereInput = {
      deletedAt: null,
      ...(search ? { OR: [{ question: { contains: search } }, { answer: { contains: search } }] } : {}),
      ...(status ? { status: status as FaqStatus } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(isFeatured === 'true' ? { isFeatured: true } : {}),
    };
    const [faqs, total] = await Promise.all([
      this.prisma.faq.findMany({ where, orderBy: { sortOrder: 'asc' }, skip: (page - 1) * limit, take: limit, include: { category: { select: { id: true, name: true, slug: true } } } }),
      this.prisma.faq.count({ where }),
    ]);
    return { data: faqs, total, page, limit };
  }

  async findOne(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id }, include: { category: true } });
    if (!faq || faq.deletedAt) throw new NotFoundException('FAQ not found.');
    return faq;
  }

  async create(dto: { question: string; answer: string; slug: string; categoryId?: string; isFeatured?: boolean; tagsJson?: string[]; seoTitle?: string; seoDescription?: string; sourceType?: string; sourceId?: string }, user: AuthenticatedUser) {
    const existing = await this.prisma.faq.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug already in use.');
    const faq = await this.prisma.faq.create({
      data: { question: dto.question, answer: dto.answer, slug: dto.slug, categoryId: dto.categoryId, isFeatured: dto.isFeatured ?? false, tagsJson: dto.tagsJson ? (dto.tagsJson as unknown as Prisma.InputJsonValue) : undefined, seoTitle: dto.seoTitle, seoDescription: dto.seoDescription, sourceType: dto.sourceType, sourceId: dto.sourceId, createdById: user.id },
    });
    await this.prisma.auditLog.create({ data: { action: 'faq.created', entityId: faq.id, entityType: 'Faq', metadata: { question: faq.question } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return faq;
  }

  async update(id: string, dto: any, user: AuthenticatedUser) {
    await this.findOne(id);
    if (dto.slug) { const ex = await this.prisma.faq.findFirst({ where: { slug: dto.slug, id: { not: id } } }); if (ex) throw new BadRequestException('Slug already in use.'); }
    const updated = await this.prisma.faq.update({ where: { id }, data: { question: dto.question, answer: dto.answer, slug: dto.slug, categoryId: dto.categoryId, isFeatured: dto.isFeatured, tagsJson: dto.tagsJson ? (dto.tagsJson as unknown as Prisma.InputJsonValue) : undefined, seoTitle: dto.seoTitle, seoDescription: dto.seoDescription, sortOrder: dto.sortOrder } });
    await this.prisma.auditLog.create({ data: { action: 'faq.updated', entityId: id, entityType: 'Faq', metadata: { question: updated.question } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return updated;
  }

  async publish(id: string, user: AuthenticatedUser) {
    await this.findOne(id);
    const published = await this.prisma.faq.update({ where: { id }, data: { status: FaqStatus.PUBLISHED, publishedAt: new Date() } });
    await this.prisma.auditLog.create({ data: { action: 'faq.published', entityId: id, entityType: 'Faq', metadata: { question: published.question } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return published;
  }

  async archive(id: string, user: AuthenticatedUser) {
    await this.findOne(id);
    const archived = await this.prisma.faq.update({ where: { id }, data: { status: FaqStatus.ARCHIVED } });
    await this.prisma.auditLog.create({ data: { action: 'faq.archived', entityId: id, entityType: 'Faq', metadata: { question: archived.question } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return archived;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const faq = await this.findOne(id);
    await this.prisma.faq.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.auditLog.create({ data: { action: 'faq.deleted', entityId: id, entityType: 'Faq', metadata: { question: faq.question } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return { message: 'FAQ deleted.' };
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    for (const item of items) { await this.prisma.faq.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } }); }
    return { message: 'Reordered.' };
  }
}
