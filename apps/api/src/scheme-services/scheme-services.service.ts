import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchemeServicesService {
  constructor(private readonly prisma: PrismaService) {}

  // === SUMMARY ===
  async getSummary() {
    const [total, schemes, services, published, draft, underReview] = await Promise.all([
      this.prisma.schemeService.count({ where: { deletedAt: null } }),
      this.prisma.schemeService.count({ where: { type: 'SCHEME', deletedAt: null } }),
      this.prisma.schemeService.count({ where: { type: 'SERVICE', deletedAt: null } }),
      this.prisma.schemeService.count({ where: { status: 'SS_PUBLISHED', deletedAt: null } }),
      this.prisma.schemeService.count({ where: { status: 'SS_DRAFT', deletedAt: null } }),
      this.prisma.schemeService.count({ where: { status: 'SS_UNDER_REVIEW', deletedAt: null } }),
    ]);
    const categories = await this.prisma.schemeServiceCategory.count({ where: { deletedAt: null } });
    const departments = await this.prisma.department.count({ where: { deletedAt: null } });
    return { total, schemes, services, published, draft, underReview, categories, departments };
  }

  // === ADMIN CRUD ===
  async list(query: { page?: number; limit?: number; type?: string; status?: string; categoryId?: string; departmentId?: string; search?: string; sort?: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { summary: { contains: query.search } },
      ];
    }

    const orderBy: any = query.sort === 'title' ? { title: 'asc' } : query.sort === 'publishedAt' ? { publishedAt: 'desc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.schemeService.findMany({
        where,
        select: {
          id: true, title: true, slug: true, summary: true, type: true, status: true,
          applicationMode: true, publishedAt: true, createdAt: true, updatedAt: true,
          category: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
        orderBy, skip, take: limit,
      }),
      this.prisma.schemeService.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const item = await this.prisma.schemeService.findFirst({
      where: { id, deletedAt: null },
      include: { category: true, department: true },
    });
    if (!item) throw new NotFoundException('Scheme/Service not found.');
    return item;
  }

  async create(dto: any, userId: string) {
    if (!dto.title || !dto.slug || !dto.type) throw new BadRequestException('Title, slug, and type are required.');
    const existing = await this.prisma.schemeService.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug already exists.');

    return this.prisma.schemeService.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        summary: dto.summary,
        description: dto.description,
        type: dto.type,
        categoryId: dto.categoryId || null,
        departmentId: dto.departmentId || null,
        targetAudience: dto.targetAudience,
        eligibilityCriteria: dto.eligibilityCriteria,
        benefits: dto.benefits,
        applicationProcess: dto.applicationProcess,
        requiredDocumentsJson: dto.requiredDocumentsJson,
        feesJson: dto.feesJson,
        timeline: dto.timeline,
        applicationMode: dto.applicationMode || 'NOT_APPLICABLE',
        applicationUrl: dto.applicationUrl,
        formId: dto.formId,
        documentIdsJson: dto.documentIdsJson,
        faqIdsJson: dto.faqIdsJson,
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        officeAddress: dto.officeAddress,
        publishAt: dto.publishAt ? new Date(dto.publishAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        createdById: userId,
      },
    });
  }

  async update(id: string, dto: any, userId: string) {
    const item = await this.prisma.schemeService.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundException('Not found.');
    if (dto.slug && dto.slug !== item.slug) {
      const dup = await this.prisma.schemeService.findUnique({ where: { slug: dto.slug } });
      if (dup) throw new BadRequestException('Slug already in use.');
    }
    const data: any = { ...dto, updatedById: userId };
    if (data.publishAt) data.publishAt = new Date(data.publishAt);
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    delete data.id; delete data.createdAt; delete data.updatedAt; delete data.deletedAt;
    return this.prisma.schemeService.update({ where: { id }, data });
  }

  async delete(id: string) {
    const item = await this.prisma.schemeService.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundException('Not found.');
    return this.prisma.schemeService.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async submitReview(id: string) {
    const item = await this.prisma.schemeService.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundException('Not found.');
    return this.prisma.schemeService.update({ where: { id }, data: { status: 'SS_UNDER_REVIEW' } });
  }

  async approve(id: string, userId: string) {
    const item = await this.prisma.schemeService.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundException('Not found.');
    return this.prisma.schemeService.update({ where: { id }, data: { status: 'SS_APPROVED', approvedById: userId } });
  }

  async publish(id: string) {
    const item = await this.prisma.schemeService.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundException('Not found.');
    return this.prisma.schemeService.update({ where: { id }, data: { status: 'SS_PUBLISHED', publishedAt: new Date() } });
  }

  async archive(id: string) {
    const item = await this.prisma.schemeService.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundException('Not found.');
    return this.prisma.schemeService.update({ where: { id }, data: { status: 'SS_ARCHIVED', archivedAt: new Date() } });
  }

  // === CATEGORIES ===
  async listCategories() {
    return this.prisma.schemeServiceCategory.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  }

  async createCategory(dto: { name: string; slug: string; description?: string }) {
    if (!dto.name || !dto.slug) throw new BadRequestException('Name and slug required.');
    const existing = await this.prisma.schemeServiceCategory.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug exists.');
    return this.prisma.schemeServiceCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: any) {
    const cat = await this.prisma.schemeServiceCategory.findFirst({ where: { id, deletedAt: null } });
    if (!cat) throw new NotFoundException('Category not found.');
    return this.prisma.schemeServiceCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    const cat = await this.prisma.schemeServiceCategory.findFirst({ where: { id, deletedAt: null } });
    if (!cat) throw new NotFoundException('Category not found.');
    return this.prisma.schemeServiceCategory.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // === DEPARTMENTS ===
  async listDepartments() {
    return this.prisma.department.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  }

  async createDepartment(dto: { name: string; slug: string; description?: string; contactEmail?: string; contactPhone?: string; officeAddress?: string; websiteUrl?: string }) {
    if (!dto.name || !dto.slug) throw new BadRequestException('Name and slug required.');
    const existing = await this.prisma.department.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug exists.');
    return this.prisma.department.create({ data: dto });
  }

  async updateDepartment(id: string, dto: any) {
    const dept = await this.prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!dept) throw new NotFoundException('Department not found.');
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async deleteDepartment(id: string) {
    const dept = await this.prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!dept) throw new NotFoundException('Department not found.');
    return this.prisma.department.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // === PUBLIC ===
  async getPublicList(query: { page?: number; limit?: number; type: string; categorySlug?: string; departmentSlug?: string; search?: string; applicationMode?: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = { type: query.type, status: 'SS_PUBLISHED', deletedAt: null };
    if (query.search) where.OR = [{ title: { contains: query.search } }, { summary: { contains: query.search } }];
    if (query.applicationMode) where.applicationMode = query.applicationMode;
    if (query.categorySlug) {
      const cat = await this.prisma.schemeServiceCategory.findUnique({ where: { slug: query.categorySlug } });
      if (cat) where.categoryId = cat.id;
    }
    if (query.departmentSlug) {
      const dept = await this.prisma.department.findUnique({ where: { slug: query.departmentSlug } });
      if (dept) where.departmentId = dept.id;
    }

    const [data, total] = await Promise.all([
      this.prisma.schemeService.findMany({
        where,
        select: {
          id: true, title: true, slug: true, summary: true, type: true,
          applicationMode: true, publishedAt: true, targetAudience: true,
          category: { select: { name: true, slug: true } },
          department: { select: { name: true, slug: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip, take: limit,
      }),
      this.prisma.schemeService.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getPublicBySlug(slug: string) {
    const item = await this.prisma.schemeService.findFirst({
      where: { slug, status: 'SS_PUBLISHED', deletedAt: null },
      select: {
        id: true, title: true, slug: true, summary: true, description: true, type: true,
        targetAudience: true, eligibilityCriteria: true, benefits: true,
        applicationProcess: true, requiredDocumentsJson: true, feesJson: true,
        timeline: true, applicationMode: true, applicationUrl: true, formId: true,
        documentIdsJson: true, faqIdsJson: true,
        contactName: true, contactEmail: true, contactPhone: true, officeAddress: true,
        publishedAt: true, expiresAt: true, seoTitle: true, seoDescription: true,
        category: { select: { name: true, slug: true } },
        department: { select: { name: true, slug: true } },
      },
    });
    if (!item) throw new NotFoundException('Not found.');
    return item;
  }

  async getPublicCategories() {
    return this.prisma.schemeServiceCategory.findMany({
      where: { status: 'SS_CAT_ACTIVE', deletedAt: null },
      select: { id: true, name: true, slug: true, description: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getPublicDepartments() {
    return this.prisma.department.findMany({
      where: { status: 'DEPT_ACTIVE', deletedAt: null },
      select: { id: true, name: true, slug: true, description: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }
}
