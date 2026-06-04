import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

  // === ADMIN ===

  async getSummary() {
    const [total, published, draft] = await Promise.all([
      this.prisma.gallery.count({ where: { deletedAt: null } }),
      this.prisma.gallery.count({ where: { status: 'GALLERY_PUBLISHED', deletedAt: null } }),
      this.prisma.gallery.count({ where: { status: 'GALLERY_DRAFT', deletedAt: null } }),
    ]);
    const totalImages = await this.prisma.galleryImage.count();
    return { total, published, draft, totalImages };
  }

  async list(query: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.gallery.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImageUrl: true,
          status: true,
          isFeatured: true,
          sortOrder: true,
          publishedAt: true,
          createdAt: true,
          _count: { select: { images: true } },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.gallery.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const gallery = await this.prisma.gallery.findFirst({
      where: { id, deletedAt: null },
      include: {
        images: { where: { isVisible: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!gallery) throw new NotFoundException('Gallery not found.');
    return gallery;
  }

  async create(dto: {
    title: string;
    slug: string;
    description?: string;
    coverImageUrl?: string;
    isFeatured?: boolean;
    metaTitle?: string;
    metaDescription?: string;
  }, userId: string) {
    if (!dto.title || !dto.slug) throw new BadRequestException('Title and slug are required.');

    const existing = await this.prisma.gallery.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('A gallery with this slug already exists.');

    return this.prisma.gallery.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        coverImageUrl: dto.coverImageUrl,
        isFeatured: dto.isFeatured ?? false,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        createdById: userId,
      },
    });
  }

  async update(id: string, dto: {
    title?: string;
    slug?: string;
    description?: string;
    coverImageUrl?: string;
    isFeatured?: boolean;
    sortOrder?: number;
    metaTitle?: string;
    metaDescription?: string;
  }) {
    const gallery = await this.prisma.gallery.findFirst({ where: { id, deletedAt: null } });
    if (!gallery) throw new NotFoundException('Gallery not found.');

    if (dto.slug && dto.slug !== gallery.slug) {
      const dup = await this.prisma.gallery.findUnique({ where: { slug: dto.slug } });
      if (dup) throw new BadRequestException('Slug already in use.');
    }

    return this.prisma.gallery.update({ where: { id }, data: dto });
  }

  async publish(id: string) {
    const gallery = await this.prisma.gallery.findFirst({ where: { id, deletedAt: null } });
    if (!gallery) throw new NotFoundException('Gallery not found.');
    return this.prisma.gallery.update({
      where: { id },
      data: { status: 'GALLERY_PUBLISHED', publishedAt: new Date() },
    });
  }

  async archive(id: string) {
    const gallery = await this.prisma.gallery.findFirst({ where: { id, deletedAt: null } });
    if (!gallery) throw new NotFoundException('Gallery not found.');
    return this.prisma.gallery.update({
      where: { id },
      data: { status: 'GALLERY_ARCHIVED' },
    });
  }

  async delete(id: string) {
    const gallery = await this.prisma.gallery.findFirst({ where: { id, deletedAt: null } });
    if (!gallery) throw new NotFoundException('Gallery not found.');
    return this.prisma.gallery.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // === IMAGE MANAGEMENT ===

  async addImage(galleryId: string, dto: {
    imageUrl: string;
    title?: string;
    description?: string;
    altText?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    sortOrder?: number;
  }) {
    const gallery = await this.prisma.gallery.findFirst({ where: { id: galleryId, deletedAt: null } });
    if (!gallery) throw new NotFoundException('Gallery not found.');

    if (!dto.imageUrl) throw new BadRequestException('imageUrl is required.');

    const maxOrder = await this.prisma.galleryImage.aggregate({
      where: { galleryId },
      _max: { sortOrder: true },
    });

    return this.prisma.galleryImage.create({
      data: {
        galleryId,
        imageUrl: dto.imageUrl,
        title: dto.title,
        description: dto.description,
        altText: dto.altText,
        thumbnailUrl: dto.thumbnailUrl,
        width: dto.width,
        height: dto.height,
        fileSize: dto.fileSize,
        sortOrder: dto.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
  }

  async addImages(galleryId: string, images: Array<{
    imageUrl: string;
    title?: string;
    description?: string;
    altText?: string;
    thumbnailUrl?: string;
    sortOrder?: number;
  }>) {
    const gallery = await this.prisma.gallery.findFirst({ where: { id: galleryId, deletedAt: null } });
    if (!gallery) throw new NotFoundException('Gallery not found.');

    const maxOrder = await this.prisma.galleryImage.aggregate({
      where: { galleryId },
      _max: { sortOrder: true },
    });
    let nextOrder = (maxOrder._max.sortOrder ?? 0) + 1;

    const data = images.map((img) => ({
      galleryId,
      imageUrl: img.imageUrl,
      title: img.title ?? null,
      description: img.description ?? null,
      altText: img.altText ?? null,
      thumbnailUrl: img.thumbnailUrl ?? null,
      sortOrder: img.sortOrder ?? nextOrder++,
    }));

    await this.prisma.galleryImage.createMany({ data });
    return { added: data.length };
  }

  async updateImage(imageId: string, dto: {
    title?: string;
    description?: string;
    altText?: string;
    sortOrder?: number;
    isVisible?: boolean;
  }) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found.');
    return this.prisma.galleryImage.update({ where: { id: imageId }, data: dto });
  }

  async removeImage(imageId: string) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found.');
    await this.prisma.galleryImage.delete({ where: { id: imageId } });
    return { deleted: true };
  }

  async reorderImages(galleryId: string, imageIds: string[]) {
    const gallery = await this.prisma.gallery.findFirst({ where: { id: galleryId, deletedAt: null } });
    if (!gallery) throw new NotFoundException('Gallery not found.');

    const updates = imageIds.map((id, index) =>
      this.prisma.galleryImage.update({ where: { id }, data: { sortOrder: index } }),
    );
    await this.prisma.$transaction(updates);
    return { reordered: imageIds.length };
  }

  // === PUBLIC ===

  async getPublicGalleries(query: { page?: number; limit?: number; featured?: boolean }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = { status: 'GALLERY_PUBLISHED', deletedAt: null };
    if (query.featured !== undefined) where.isFeatured = query.featured;

    const [data, total] = await Promise.all([
      this.prisma.gallery.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImageUrl: true,
          isFeatured: true,
          publishedAt: true,
          _count: { select: { images: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { publishedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.gallery.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getPublicGalleryBySlug(slug: string) {
    const gallery = await this.prisma.gallery.findFirst({
      where: { slug, status: 'GALLERY_PUBLISHED', deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImageUrl: true,
        metaTitle: true,
        metaDescription: true,
        publishedAt: true,
        images: {
          where: { isVisible: true },
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            thumbnailUrl: true,
            altText: true,
            width: true,
            height: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!gallery) throw new NotFoundException('Gallery not found.');
    return gallery;
  }
}
