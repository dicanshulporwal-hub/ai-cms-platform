import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class DocumentCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.documentCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { _count: { select: { documents: true } } },
    });
  }

  async create(dto: { name: string; slug: string; description?: string }, user: AuthenticatedUser) {
    const existing = await this.prisma.documentCategory.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Category slug already exists.');

    const category = await this.prisma.documentCategory.create({
      data: { name: dto.name.trim(), slug: dto.slug.trim(), description: dto.description?.trim() },
    });

    await this.prisma.auditLog.create({
      data: { action: 'document_category.created', entityId: category.id, entityType: 'DocumentCategory', metadata: { name: category.name } as unknown as Prisma.InputJsonValue, userId: user.id },
    });

    return category;
  }

  async update(id: string, dto: { name?: string; slug?: string; description?: string }, user: AuthenticatedUser) {
    const cat = await this.prisma.documentCategory.findUnique({ where: { id } });
    if (!cat || cat.deletedAt) throw new NotFoundException('Category not found.');

    if (dto.slug && dto.slug !== cat.slug) {
      const existing = await this.prisma.documentCategory.findUnique({ where: { slug: dto.slug } });
      if (existing) throw new ConflictException('Category slug already exists.');
    }

    return this.prisma.documentCategory.update({
      where: { id },
      data: { name: dto.name?.trim(), slug: dto.slug?.trim(), description: dto.description?.trim() },
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const cat = await this.prisma.documentCategory.findUnique({ where: { id } });
    if (!cat || cat.deletedAt) throw new NotFoundException('Category not found.');

    await this.prisma.documentCategory.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.auditLog.create({
      data: { action: 'document_category.deleted', entityId: id, entityType: 'DocumentCategory', metadata: { name: cat.name } as unknown as Prisma.InputJsonValue, userId: user.id },
    });
    return { message: 'Category deleted.' };
  }
}
