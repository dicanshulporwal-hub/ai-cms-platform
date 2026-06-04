import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RtiService {
  constructor(private readonly prisma: PrismaService) {}

  // === ADMIN ===

  async getSummary() {
    const [total, received, underProcess, responseSent, overdue] = await Promise.all([
      this.prisma.rtiRequest.count({ where: { deletedAt: null } }),
      this.prisma.rtiRequest.count({ where: { status: 'RTI_RECEIVED', deletedAt: null } }),
      this.prisma.rtiRequest.count({ where: { status: 'RTI_UNDER_PROCESS', deletedAt: null } }),
      this.prisma.rtiRequest.count({ where: { status: 'RTI_RESPONSE_SENT', deletedAt: null } }),
      this.prisma.rtiRequest.count({ where: { dueDate: { lt: new Date() }, status: { in: ['RTI_RECEIVED', 'RTI_UNDER_PROCESS'] }, deletedAt: null } }),
    ]);
    const totalOfficers = await this.prisma.rtiOfficer.count({ where: { isActive: true } });
    return { total, received, underProcess, responseSent, overdue, totalOfficers };
  }

  async listRequests(query: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { requestNumber: { contains: query.search } },
        { applicantName: { contains: query.search } },
        { subject: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.rtiRequest.findMany({
        where,
        select: {
          id: true, requestNumber: true, applicantName: true, subject: true,
          department: true, status: true, receivedDate: true, dueDate: true,
          responseDate: true, isPublic: true, createdAt: true,
        },
        orderBy: { receivedDate: 'desc' },
        skip, take: limit,
      }),
      this.prisma.rtiRequest.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getRequestById(id: string) {
    const req = await this.prisma.rtiRequest.findFirst({ where: { id, deletedAt: null } });
    if (!req) throw new NotFoundException('RTI request not found.');
    return req;
  }

  async createRequest(dto: {
    applicantName: string;
    applicantEmail?: string;
    applicantPhone?: string;
    applicantAddress?: string;
    subject: string;
    description: string;
    department?: string;
    attachmentUrl?: string;
  }, userId?: string) {
    if (!dto.applicantName || !dto.subject || !dto.description) {
      throw new BadRequestException('Applicant name, subject, and description are required.');
    }

    const requestNumber = `RTI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30-day statutory deadline

    return this.prisma.rtiRequest.create({
      data: {
        requestNumber,
        applicantName: dto.applicantName,
        applicantEmail: dto.applicantEmail,
        applicantPhone: dto.applicantPhone,
        applicantAddress: dto.applicantAddress,
        subject: dto.subject,
        description: dto.description,
        department: dto.department,
        attachmentUrl: dto.attachmentUrl,
        dueDate,
        createdById: userId,
      },
    });
  }

  async updateRequest(id: string, dto: Record<string, any>) {
    const req = await this.prisma.rtiRequest.findFirst({ where: { id, deletedAt: null } });
    if (!req) throw new NotFoundException('RTI request not found.');
    const data: any = { ...dto };
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    if (data.responseDate) data.responseDate = new Date(data.responseDate);
    return this.prisma.rtiRequest.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string, remarks?: string) {
    const req = await this.prisma.rtiRequest.findFirst({ where: { id, deletedAt: null } });
    if (!req) throw new NotFoundException('RTI request not found.');

    const data: any = { status, remarks };
    if (status === 'RTI_RESPONSE_SENT') data.responseDate = new Date();

    return this.prisma.rtiRequest.update({ where: { id }, data });
  }

  async deleteRequest(id: string) {
    const req = await this.prisma.rtiRequest.findFirst({ where: { id, deletedAt: null } });
    if (!req) throw new NotFoundException('RTI request not found.');
    return this.prisma.rtiRequest.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // === OFFICERS ===

  async listOfficers() {
    return this.prisma.rtiOfficer.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createOfficer(dto: {
    name: string;
    designation?: string;
    department?: string;
    email?: string;
    phone?: string;
    address?: string;
    officerType?: string;
  }) {
    if (!dto.name) throw new BadRequestException('Name is required.');
    return this.prisma.rtiOfficer.create({ data: dto as any });
  }

  async updateOfficer(id: string, dto: Record<string, any>) {
    const officer = await this.prisma.rtiOfficer.findUnique({ where: { id } });
    if (!officer) throw new NotFoundException('Officer not found.');
    return this.prisma.rtiOfficer.update({ where: { id }, data: dto });
  }

  async deleteOfficer(id: string) {
    const officer = await this.prisma.rtiOfficer.findUnique({ where: { id } });
    if (!officer) throw new NotFoundException('Officer not found.');
    return this.prisma.rtiOfficer.update({ where: { id }, data: { isActive: false } });
  }

  // === PUBLIC ===

  async getPublicOfficers() {
    return this.prisma.rtiOfficer.findMany({
      where: { isActive: true },
      select: { id: true, name: true, designation: true, department: true, email: true, phone: true, address: true, officerType: true },
      orderBy: [{ officerType: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async getPublicDisclosures(query: { page?: number; limit?: number }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where = { isPublic: true, status: 'RTI_RESPONSE_SENT' as any, deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.rtiRequest.findMany({
        where,
        select: {
          id: true, requestNumber: true, subject: true, department: true,
          receivedDate: true, responseDate: true, responseText: true,
        },
        orderBy: { responseDate: 'desc' },
        skip, take: limit,
      }),
      this.prisma.rtiRequest.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async submitPublicRequest(dto: {
    applicantName: string;
    applicantEmail?: string;
    applicantPhone?: string;
    applicantAddress?: string;
    subject: string;
    description: string;
    department?: string;
  }) {
    return this.createRequest(dto);
  }
}
