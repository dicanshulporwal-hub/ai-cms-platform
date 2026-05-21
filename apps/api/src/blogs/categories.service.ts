import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      where: { deletedAt: null },
    });
  }

  async create(dto: CreateCategoryDto, user: AuthenticatedUser) {
    await this.ensureSlugAvailable(dto.slug);

    const category = await this.prisma.category.create({
      data: {
        description: dto.description,
        name: dto.name,
        slug: dto.slug,
      },
    });

    await this.audit('category.created', category, user);

    return category;
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    user: AuthenticatedUser,
  ) {
    const category = await this.getActiveCategory(id);

    if (dto.slug && dto.slug !== category.slug) {
      await this.ensureSlugAvailable(dto.slug, category.id);
    }

    const updatedCategory = await this.prisma.category.update({
      data: {
        description: dto.description,
        name: dto.name,
        slug: dto.slug,
      },
      where: { id },
    });

    await this.audit('category.updated', updatedCategory, user);

    return updatedCategory;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const category = await this.getActiveCategory(id);
    const deletedCategory = await this.prisma.category.update({
      data: { deletedAt: new Date() },
      where: { id },
    });

    await this.audit('category.deleted', category, user);

    return deletedCategory;
  }

  private async getActiveCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.deletedAt) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  private async ensureSlugAvailable(slug: string, currentCategoryId?: string) {
    const existingCategory = await this.prisma.category.findUnique({
      select: { id: true },
      where: { slug },
    });

    if (existingCategory && existingCategory.id !== currentCategoryId) {
      throw new ConflictException('Category slug already exists.');
    }
  }

  private async audit(
    action: string,
    category: { id: string; name: string; slug: string },
    user: AuthenticatedUser,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        entityId: category.id,
        entityType: 'Category',
        metadata: {
          name: category.name,
          slug: category.slug,
        } satisfies Prisma.InputJsonValue,
        userId: user.id,
      },
    });
  }
}
