import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      where: { deletedAt: null },
    });
  }

  async create(dto: CreateTagDto, user: AuthenticatedUser) {
    await this.ensureSlugAvailable(dto.slug);

    const tag = await this.prisma.tag.create({
      data: {
        name: dto.name,
        slug: dto.slug,
      },
    });

    await this.audit('tag.created', tag, user);

    return tag;
  }

  async update(id: string, dto: UpdateTagDto, user: AuthenticatedUser) {
    const tag = await this.getActiveTag(id);

    if (dto.slug && dto.slug !== tag.slug) {
      await this.ensureSlugAvailable(dto.slug, tag.id);
    }

    const updatedTag = await this.prisma.tag.update({
      data: {
        name: dto.name,
        slug: dto.slug,
      },
      where: { id },
    });

    await this.audit('tag.updated', updatedTag, user);

    return updatedTag;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const tag = await this.getActiveTag(id);
    const deletedTag = await this.prisma.tag.update({
      data: { deletedAt: new Date() },
      where: { id },
    });

    await this.audit('tag.deleted', tag, user);

    return deletedTag;
  }

  private async getActiveTag(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag || tag.deletedAt) {
      throw new NotFoundException('Tag not found.');
    }

    return tag;
  }

  private async ensureSlugAvailable(slug: string, currentTagId?: string) {
    const existingTag = await this.prisma.tag.findUnique({
      select: { id: true },
      where: { slug },
    });

    if (existingTag && existingTag.id !== currentTagId) {
      throw new ConflictException('Tag slug already exists.');
    }
  }

  private async audit(
    action: string,
    tag: { id: string; name: string; slug: string },
    user: AuthenticatedUser,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        entityId: tag.id,
        entityType: 'Tag',
        metadata: {
          name: tag.name,
          slug: tag.slug,
        } satisfies Prisma.InputJsonValue,
        userId: user.id,
      },
    });
  }
}
