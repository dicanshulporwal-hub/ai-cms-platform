import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactDirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  // === SUMMARY ===
  async getSummary() {
    const [departments, officers, publicOfficers, designations, offices] = await Promise.all([
      this.prisma.department.count({ where: { deletedAt: null } }),
      this.prisma.officerProfile.count({ where: { deletedAt: null } }),
      this.prisma.officerProfile.count({ where: { isPublic: true, status: 'OFFICER_ACTIVE', deletedAt: null } }),
      this.prisma.designation.count({ where: { deletedAt: null } }),
      this.prisma.officeLocation.count({ where: { deletedAt: null } }),
    ]);
    return { departments, officers, publicOfficers, designations, offices };
  }

  // === DEPARTMENTS (Admin) ===
  async listDepartments(query: { search?: string }) {
    const where: any = { deletedAt: null };
    if (query.search) where.name = { contains: query.search };
    return this.prisma.department.findMany({
      where,
      select: { id: true, name: true, slug: true, shortName: true, departmentType: true, parentId: true, status: true, sortOrder: true, contactEmail: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getDepartmentTree() {
    const all = await this.prisma.department.findMany({
      where: { deletedAt: null, status: 'DEPT_ACTIVE' },
      select: { id: true, name: true, slug: true, shortName: true, departmentType: true, parentId: true, sortOrder: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return this.buildTree(all, null);
  }

  private buildTree(items: any[], parentId: string | null): any[] {
    return items
      .filter((i) => i.parentId === parentId)
      .map((i) => ({ ...i, children: this.buildTree(items, i.id) }));
  }

  async getDepartmentById(id: string) {
    const dept = await this.prisma.department.findFirst({ where: { id, deletedAt: null }, include: { officers: { where: { deletedAt: null }, take: 20, orderBy: { displayOrder: 'asc' } } } });
    if (!dept) throw new NotFoundException('Department not found.');
    return dept;
  }

  async createDepartment(dto: any, userId: string) {
    if (!dto.name || !dto.slug) throw new BadRequestException('Name and slug required.');
    const existing = await this.prisma.department.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug exists.');
    if (dto.parentId) {
      const parent = await this.prisma.department.findFirst({ where: { id: dto.parentId, deletedAt: null } });
      if (!parent) throw new BadRequestException('Parent department not found.');
    }
    return this.prisma.department.create({ data: { ...dto, createdById: userId } });
  }

  async updateDepartment(id: string, dto: any, userId: string) {
    const dept = await this.prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!dept) throw new NotFoundException('Not found.');
    if (dto.parentId && dto.parentId === id) throw new BadRequestException('Cannot set self as parent.');
    if (dto.slug && dto.slug !== dept.slug) {
      const dup = await this.prisma.department.findUnique({ where: { slug: dto.slug } });
      if (dup) throw new BadRequestException('Slug exists.');
    }
    const data = { ...dto, updatedById: userId };
    delete data.id; delete data.createdAt; delete data.updatedAt; delete data.deletedAt;
    return this.prisma.department.update({ where: { id }, data });
  }

  async deleteDepartment(id: string) {
    const dept = await this.prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!dept) throw new NotFoundException('Not found.');
    return this.prisma.department.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // === DESIGNATIONS ===
  async listDesignations() {
    return this.prisma.designation.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  }

  async createDesignation(dto: { name: string; slug: string; description?: string; level?: number }) {
    if (!dto.name || !dto.slug) throw new BadRequestException('Name and slug required.');
    const existing = await this.prisma.designation.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug exists.');
    return this.prisma.designation.create({ data: dto });
  }

  async updateDesignation(id: string, dto: any) {
    const d = await this.prisma.designation.findFirst({ where: { id, deletedAt: null } });
    if (!d) throw new NotFoundException('Not found.');
    return this.prisma.designation.update({ where: { id }, data: dto });
  }

  async deleteDesignation(id: string) {
    const d = await this.prisma.designation.findFirst({ where: { id, deletedAt: null } });
    if (!d) throw new NotFoundException('Not found.');
    return this.prisma.designation.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // === OFFICERS ===
  async listOfficers(query: { page?: number; limit?: number; search?: string; departmentId?: string; designationId?: string; status?: string; isPublic?: boolean }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.designationId) where.designationId = query.designationId;
    if (query.status) where.status = query.status;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;
    if (query.search) where.OR = [{ fullName: { contains: query.search } }, { publicEmail: { contains: query.search } }];

    const [data, total] = await Promise.all([
      this.prisma.officerProfile.findMany({
        where,
        select: { id: true, fullName: true, slug: true, publicEmail: true, publicPhone: true, officePhone: true, isPublic: true, status: true, displayOrder: true, designation: { select: { name: true } }, department: { select: { name: true } } },
        orderBy: [{ displayOrder: 'asc' }, { fullName: 'asc' }],
        skip, take: limit,
      }),
      this.prisma.officerProfile.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getOfficerById(id: string) {
    const officer = await this.prisma.officerProfile.findFirst({ where: { id, deletedAt: null }, include: { designation: true, department: true } });
    if (!officer) throw new NotFoundException('Officer not found.');
    return officer;
  }

  async createOfficer(dto: any, userId: string) {
    if (!dto.fullName || !dto.slug) throw new BadRequestException('Full name and slug required.');
    const existing = await this.prisma.officerProfile.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug exists.');
    return this.prisma.officerProfile.create({ data: { ...dto, createdById: userId } });
  }

  async updateOfficer(id: string, dto: any, userId: string) {
    const o = await this.prisma.officerProfile.findFirst({ where: { id, deletedAt: null } });
    if (!o) throw new NotFoundException('Not found.');
    if (dto.slug && dto.slug !== o.slug) {
      const dup = await this.prisma.officerProfile.findUnique({ where: { slug: dto.slug } });
      if (dup) throw new BadRequestException('Slug exists.');
    }
    const data = { ...dto, updatedById: userId };
    delete data.id; delete data.createdAt; delete data.updatedAt; delete data.deletedAt;
    return this.prisma.officerProfile.update({ where: { id }, data });
  }

  async deleteOfficer(id: string) {
    const o = await this.prisma.officerProfile.findFirst({ where: { id, deletedAt: null } });
    if (!o) throw new NotFoundException('Not found.');
    return this.prisma.officerProfile.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // === OFFICE LOCATIONS ===
  async listOfficeLocations() {
    return this.prisma.officeLocation.findMany({ where: { deletedAt: null }, include: { department: { select: { name: true } } }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  }

  async createOfficeLocation(dto: any) {
    if (!dto.name || !dto.slug || !dto.address) throw new BadRequestException('Name, slug, and address required.');
    const existing = await this.prisma.officeLocation.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug exists.');
    return this.prisma.officeLocation.create({ data: dto });
  }

  async updateOfficeLocation(id: string, dto: any) {
    const ol = await this.prisma.officeLocation.findFirst({ where: { id, deletedAt: null } });
    if (!ol) throw new NotFoundException('Not found.');
    return this.prisma.officeLocation.update({ where: { id }, data: dto });
  }

  async deleteOfficeLocation(id: string) {
    const ol = await this.prisma.officeLocation.findFirst({ where: { id, deletedAt: null } });
    if (!ol) throw new NotFoundException('Not found.');
    return this.prisma.officeLocation.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // === SETTINGS ===
  async getSettings() {
    return this.prisma.contactDirectorySettings.upsert({ where: { id: 'default_contact_settings' }, create: { id: 'default_contact_settings' }, update: {} });
  }

  async updateSettings(dto: any) {
    return this.prisma.contactDirectorySettings.upsert({ where: { id: 'default_contact_settings' }, create: { id: 'default_contact_settings', ...dto }, update: dto });
  }

  // === PUBLIC ===
  async getPublicDepartments() {
    return this.prisma.department.findMany({
      where: { status: 'DEPT_ACTIVE', deletedAt: null },
      select: { id: true, name: true, slug: true, shortName: true, departmentType: true, parentId: true, contactEmail: true, contactPhone: true, officeAddress: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getPublicDepartmentBySlug(slug: string) {
    const dept = await this.prisma.department.findFirst({
      where: { slug, status: 'DEPT_ACTIVE', deletedAt: null },
      select: { id: true, name: true, slug: true, shortName: true, description: true, departmentType: true, contactEmail: true, contactPhone: true, officeAddress: true, websiteUrl: true, seoTitle: true, seoDescription: true },
    });
    if (!dept) throw new NotFoundException('Department not found.');
    const officers = await this.prisma.officerProfile.findMany({
      where: { departmentId: dept.id, isPublic: true, status: 'OFFICER_ACTIVE', deletedAt: null },
      select: { id: true, fullName: true, slug: true, publicEmail: true, publicPhone: true, officePhone: true, profilePhotoUrl: true, designation: { select: { name: true } } },
      orderBy: { displayOrder: 'asc' }, take: 30,
    });
    return { ...dept, officers };
  }

  async getPublicContactDirectory(query: { page?: number; limit?: number; search?: string; departmentId?: string; designationId?: string }) {
    const settings = await this.getSettings();
    if (!settings.isPublicDirectoryEnabled) return { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 }, settings };

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;
    const where: any = { isPublic: true, status: 'OFFICER_ACTIVE', deletedAt: null };
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.designationId) where.designationId = query.designationId;
    if (query.search) where.OR = [{ fullName: { contains: query.search } }];

    const selectFields: any = { id: true, fullName: true, slug: true, profilePhotoUrl: true, designation: { select: { name: true } }, department: { select: { name: true, slug: true } } };
    if (settings.showOfficerEmail) selectFields.publicEmail = true;
    if (settings.showOfficerPhone) selectFields.publicPhone = true;
    selectFields.officePhone = true;

    const [data, total] = await Promise.all([
      this.prisma.officerProfile.findMany({ where, select: selectFields, orderBy: [{ displayOrder: 'asc' }, { fullName: 'asc' }], skip, take: limit }),
      this.prisma.officerProfile.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) }, settings };
  }

  async getPublicOfficerBySlug(slug: string) {
    const settings = await this.getSettings();
    const officer = await this.prisma.officerProfile.findFirst({
      where: { slug, isPublic: true, status: 'OFFICER_ACTIVE', deletedAt: null },
      select: {
        id: true, fullName: true, slug: true, bio: true, responsibilities: true, profilePhotoUrl: true, officeName: true, officePhone: true, roomNumber: true,
        publicEmail: settings.showOfficerEmail, publicPhone: settings.showOfficerPhone,
        designation: { select: { name: true } }, department: { select: { name: true, slug: true, officeAddress: settings.showOfficeAddress } },
      },
    });
    if (!officer) throw new NotFoundException('Officer not found.');
    return officer;
  }

  async getPublicOfficeLocations() {
    return this.prisma.officeLocation.findMany({
      where: { status: 'OFFICE_ACTIVE', deletedAt: null },
      select: { id: true, name: true, slug: true, address: true, city: true, state: true, pincode: true, phone: true, email: true, latitude: true, longitude: true, department: { select: { name: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }
}
