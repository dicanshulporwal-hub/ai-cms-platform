import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FormStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { search?: string; status?: string; formType?: string }) {
    const where: Prisma.FormWhereInput = {
      deletedAt: null,
      ...(query.search ? { title: { contains: query.search } } : {}),
      ...(query.status ? { status: query.status as FormStatus } : {}),
      ...(query.formType ? { formType: query.formType } : {}),
    };
    return this.prisma.form.findMany({
      where, orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { submissions: true, fields: true } } },
    });
  }

  async findOne(id: string) {
    const form = await this.prisma.form.findUnique({ where: { id }, include: { fields: { orderBy: { sortOrder: 'asc' } }, _count: { select: { submissions: true } } } });
    if (!form || form.deletedAt) throw new NotFoundException('Form not found.');
    return form;
  }

  async create(dto: { title: string; slug: string; description?: string; formType?: string; successMessage?: string; submitButtonLabel?: string; redirectUrl?: string; isPublic?: boolean; allowMultipleSubmissions?: boolean; notifyEmailsJson?: string[] }, user: AuthenticatedUser) {
    const existing = await this.prisma.form.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug already in use.');
    const form = await this.prisma.form.create({
      data: { title: dto.title, slug: dto.slug, description: dto.description, formType: dto.formType ?? 'CUSTOM', successMessage: dto.successMessage ?? 'Thank you for your submission.', submitButtonLabel: dto.submitButtonLabel ?? 'Submit', redirectUrl: dto.redirectUrl, isPublic: dto.isPublic ?? true, allowMultipleSubmissions: dto.allowMultipleSubmissions ?? true, notifyEmailsJson: dto.notifyEmailsJson ? (dto.notifyEmailsJson as unknown as Prisma.InputJsonValue) : undefined, createdById: user.id },
    });
    await this.prisma.auditLog.create({ data: { action: 'form.created', entityId: form.id, entityType: 'Form', metadata: { title: form.title } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return form;
  }

  async update(id: string, dto: any, user: AuthenticatedUser) {
    await this.findOne(id);
    if (dto.slug) {
      const existing = await this.prisma.form.findFirst({ where: { slug: dto.slug, id: { not: id } } });
      if (existing) throw new BadRequestException('Slug already in use.');
    }
    const updated = await this.prisma.form.update({ where: { id }, data: { title: dto.title, slug: dto.slug, description: dto.description, formType: dto.formType, successMessage: dto.successMessage, submitButtonLabel: dto.submitButtonLabel, redirectUrl: dto.redirectUrl, isPublic: dto.isPublic, allowMultipleSubmissions: dto.allowMultipleSubmissions, requireCaptcha: dto.requireCaptcha, notifyEmailsJson: dto.notifyEmailsJson ? (dto.notifyEmailsJson as unknown as Prisma.InputJsonValue) : undefined } });
    await this.prisma.auditLog.create({ data: { action: 'form.updated', entityId: id, entityType: 'Form', metadata: { title: updated.title } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return updated;
  }

  async publish(id: string, user: AuthenticatedUser) {
    await this.findOne(id);
    const published = await this.prisma.form.update({ where: { id }, data: { status: FormStatus.PUBLISHED, publishedAt: new Date() } });
    await this.prisma.auditLog.create({ data: { action: 'form.published', entityId: id, entityType: 'Form', metadata: { title: published.title } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return published;
  }

  async archive(id: string, user: AuthenticatedUser) {
    await this.findOne(id);
    const archived = await this.prisma.form.update({ where: { id }, data: { status: FormStatus.ARCHIVED } });
    await this.prisma.auditLog.create({ data: { action: 'form.archived', entityId: id, entityType: 'Form', metadata: { title: archived.title } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return archived;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const form = await this.findOne(id);
    await this.prisma.form.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.auditLog.create({ data: { action: 'form.deleted', entityId: id, entityType: 'Form', metadata: { title: form.title } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return { message: 'Form deleted.' };
  }
}
