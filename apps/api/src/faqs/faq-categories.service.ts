import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class FaqCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.faqCategory.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' }, include: { _count: { select: { faqs: true } } } });
  }

  async create(dto: { name: string; slug: string; description?: string }, user: AuthenticatedUser) {
    const existing = await this.prisma.faqCategory.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug already exists.');
    const cat = await this.prisma.faqCategory.create({ data: { name: dto.name, slug: dto.slug, description: dto.description } });
    await this.prisma.auditLog.create({ data: { action: 'faq_category.created', entityId: cat.id, entityType: 'FaqCategory', metadata: { name: cat.name } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return cat;
  }

  async update(id: string, dto: any, user: AuthenticatedUser) {
    const cat = await this.prisma.faqCategory.findUnique({ where: { id } });
    if (!cat || cat.deletedAt) throw new NotFoundException('Category not found.');
    return this.prisma.faqCategory.update({ where: { id }, data: { name: dto.name, slug: dto.slug, description: dto.description, sortOrder: dto.sortOrder, status: dto.status } });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const cat = await this.prisma.faqCategory.findUnique({ where: { id } });
    if (!cat || cat.deletedAt) throw new NotFoundException('Category not found.');
    await this.prisma.faqCategory.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.auditLog.create({ data: { action: 'faq_category.deleted', entityId: id, entityType: 'FaqCategory', metadata: { name: cat.name } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return { message: 'Category deleted.' };
  }
}
