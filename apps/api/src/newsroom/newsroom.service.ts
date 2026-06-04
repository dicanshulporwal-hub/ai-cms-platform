import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsroomService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [total, pressReleases, published, draft, featured] = await Promise.all([
      this.prisma.newsroomItem.count({ where: { deletedAt: null } }),
      this.prisma.newsroomItem.count({ where: { itemType: 'PRESS_RELEASE', deletedAt: null } }),
      this.prisma.newsroomItem.count({ where: { status: 'NR_PUBLISHED', deletedAt: null } }),
      this.prisma.newsroomItem.count({ where: { status: 'NR_DRAFT', deletedAt: null } }),
      this.prisma.newsroomItem.count({ where: { priority: 'NR_FEATURED', status: 'NR_PUBLISHED', deletedAt: null } }),
    ]);
    const categories = await this.prisma.newsroomCategory.count({ where: { deletedAt: null } });
    return { total, pressReleases, published, draft, featured, categories };
  }

  async list(query: { page?: number; limit?: number; itemType?: string; status?: string; categoryId?: string; priority?: string; search?: string; sort?: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (query.itemType) where.itemType = query.itemType;
    if (query.status) where.status = query.status;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.priority) where.priority = query.priority;
    if (query.search) where.OR = [{ title: { contains: query.search } }, { summary: { contains: query.search } }];
    const orderBy: any = query.sort === 'eventDate' ? { eventDate: 'desc' } : query.sort === 'title' ? { title: 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.newsroomItem.findMany({
        where, select: { id: true, title: true, slug: true, summary: true, itemType: true, status: true, priority: true, eventDate: true, publishedAt: true, featuredImageUrl: true, createdAt: true, category: { select: { id: true, name: true } } },
        orderBy, skip, take: limit,
      }),
      this.prisma.newsroomItem.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const item = await this.prisma.newsroomItem.findFirst({ where: { id, deletedAt: null }, include: { category: true } });
    if (!item) throw new NotFoundException('Newsroom item not found.');
    return item;
  }

  async create(dto: any, userId: string) {
    if (!dto.title || !dto.slug || !dto.itemType) throw new BadRequestException('Title, slug, and itemType required.');
    const existing = await this.prisma.newsroomItem.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug exists.');
    return this.prisma.newsroomItem.create({ data: { ...dto, eventDate: dto.eventDate ? new Date(dto.eventDate) : null, publishAt: dto.publishAt ? new Date(dto.publishAt) : null, createdById: userId } });
  }

  async update(id: string, dto: any, userId: string) {
    const item = await this.prisma.newsroomItem.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundException('Not found.');
    if (dto.slug && dto.slug !== item.slug) { const dup = await this.prisma.newsroomItem.findUnique({ where: { slug: dto.slug } }); if (dup) throw new BadRequestException('Slug exists.'); }
    const data: any = { ...dto, updatedById: userId };
    if (data.eventDate) data.eventDate = new Date(data.eventDate);
    if (data.publishAt) data.publishAt = new Date(data.publishAt);
    delete data.id; delete data.createdAt; delete data.updatedAt; delete data.deletedAt;
    return this.prisma.newsroomItem.update({ where: { id }, data });
  }

  async delete(id: string) { const i = await this.prisma.newsroomItem.findFirst({ where: { id, deletedAt: null } }); if (!i) throw new NotFoundException('Not found.'); return this.prisma.newsroomItem.update({ where: { id }, data: { deletedAt: new Date() } }); }
  async submitReview(id: string) { const i = await this.prisma.newsroomItem.findFirst({ where: { id, deletedAt: null } }); if (!i) throw new NotFoundException('Not found.'); return this.prisma.newsroomItem.update({ where: { id }, data: { status: 'NR_UNDER_REVIEW' } }); }
  async approve(id: string, userId: string) { const i = await this.prisma.newsroomItem.findFirst({ where: { id, deletedAt: null } }); if (!i) throw new NotFoundException('Not found.'); return this.prisma.newsroomItem.update({ where: { id }, data: { status: 'NR_APPROVED', approvedById: userId } }); }
  async publish(id: string) { const i = await this.prisma.newsroomItem.findFirst({ where: { id, deletedAt: null } }); if (!i) throw new NotFoundException('Not found.'); return this.prisma.newsroomItem.update({ where: { id }, data: { status: 'NR_PUBLISHED', publishedAt: new Date() } }); }
  async archive(id: string) { const i = await this.prisma.newsroomItem.findFirst({ where: { id, deletedAt: null } }); if (!i) throw new NotFoundException('Not found.'); return this.prisma.newsroomItem.update({ where: { id }, data: { status: 'NR_ARCHIVED', archivedAt: new Date() } }); }

  // Categories
  async listCategories() { return this.prisma.newsroomCategory.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }); }
  async createCategory(dto: { name: string; slug: string; description?: string }) { if (!dto.name || !dto.slug) throw new BadRequestException('Name and slug required.'); const e = await this.prisma.newsroomCategory.findUnique({ where: { slug: dto.slug } }); if (e) throw new BadRequestException('Slug exists.'); return this.prisma.newsroomCategory.create({ data: dto }); }
  async updateCategory(id: string, dto: any) { const c = await this.prisma.newsroomCategory.findFirst({ where: { id, deletedAt: null } }); if (!c) throw new NotFoundException('Not found.'); return this.prisma.newsroomCategory.update({ where: { id }, data: dto }); }
  async deleteCategory(id: string) { const c = await this.prisma.newsroomCategory.findFirst({ where: { id, deletedAt: null } }); if (!c) throw new NotFoundException('Not found.'); return this.prisma.newsroomCategory.update({ where: { id }, data: { deletedAt: new Date() } }); }

  // Public
  async getPublicList(query: { page?: number; limit?: number; itemType?: string; categorySlug?: string; search?: string; featured?: boolean }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;
    const where: any = { status: 'NR_PUBLISHED', deletedAt: null };
    if (query.itemType) where.itemType = query.itemType;
    if (query.featured) where.priority = 'NR_FEATURED';
    if (query.search) where.OR = [{ title: { contains: query.search } }, { summary: { contains: query.search } }];
    if (query.categorySlug) { const cat = await this.prisma.newsroomCategory.findUnique({ where: { slug: query.categorySlug } }); if (cat) where.categoryId = cat.id; }

    const [data, total] = await Promise.all([
      this.prisma.newsroomItem.findMany({ where, select: { id: true, title: true, slug: true, summary: true, itemType: true, priority: true, eventDate: true, publishedAt: true, featuredImageUrl: true, location: true, category: { select: { name: true, slug: true } } }, orderBy: { publishedAt: 'desc' }, skip, take: limit }),
      this.prisma.newsroomItem.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getPublicBySlug(slug: string) {
    const item = await this.prisma.newsroomItem.findFirst({
      where: { slug, status: 'NR_PUBLISHED', deletedAt: null },
      select: { id: true, title: true, slug: true, summary: true, content: true, itemType: true, priority: true, eventDate: true, publishedAt: true, featuredImageUrl: true, galleryMediaIdsJson: true, videoUrl: true, videoEmbedCode: true, attachmentMediaIdsJson: true, sourceName: true, sourceUrl: true, location: true, speakerName: true, seoTitle: true, seoDescription: true, category: { select: { name: true, slug: true } } },
    });
    if (!item) throw new NotFoundException('Not found.');
    return item;
  }

  async getPublicCategories() { return this.prisma.newsroomCategory.findMany({ where: { status: 'NR_CAT_ACTIVE', deletedAt: null }, select: { id: true, name: true, slug: true, description: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }); }
}
