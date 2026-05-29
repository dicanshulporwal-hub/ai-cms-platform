import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FormStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormSubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubmissions(formId: string, query: { status?: string }) {
    const where: Prisma.FormSubmissionWhereInput = { formId, ...(query.status ? { status: query.status as any } : {}) };
    return this.prisma.formSubmission.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async getSubmission(id: string) {
    const sub = await this.prisma.formSubmission.findUnique({ where: { id }, include: { notes: { orderBy: { createdAt: 'desc' } }, form: { select: { title: true } } } });
    if (!sub) throw new NotFoundException('Submission not found.');
    return sub;
  }

  async updateStatus(id: string, status: string) {
    await this.getSubmission(id);
    return this.prisma.formSubmission.update({ where: { id }, data: { status: status as any } });
  }

  async addNote(id: string, note: string, userId: string) {
    await this.getSubmission(id);
    return this.prisma.formSubmissionNote.create({ data: { submissionId: id, note, createdById: userId } });
  }

  async deleteSubmission(id: string) {
    await this.getSubmission(id);
    await this.prisma.formSubmission.delete({ where: { id } });
    return { message: 'Submission deleted.' };
  }

  async submitPublic(slug: string, data: Record<string, unknown>, ip?: string, userAgent?: string, sourcePage?: string) {
    const form = await this.prisma.form.findUnique({ where: { slug }, include: { fields: { orderBy: { sortOrder: 'asc' } } } });
    if (!form || form.deletedAt || form.status !== FormStatus.PUBLISHED || !form.isPublic) {
      throw new BadRequestException('Form not available.');
    }

    // Validate required fields
    for (const field of form.fields) {
      if (field.isRequired && !data[field.fieldKey]) {
        throw new BadRequestException(`Field "${field.label}" is required.`);
      }
      if (field.fieldType === 'EMAIL' && data[field.fieldKey]) {
        const email = String(data[field.fieldKey]);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new BadRequestException(`Field "${field.label}" must be a valid email.`);
        }
      }
    }

    const submission = await this.prisma.formSubmission.create({
      data: { formId: form.id, submissionDataJson: data as unknown as Prisma.InputJsonValue, submitterIp: ip?.slice(0, 100), userAgent: userAgent?.slice(0, 500), sourcePage: sourcePage?.slice(0, 2048) },
    });

    await this.prisma.auditLog.create({ data: { action: 'form.submitted', entityId: submission.id, entityType: 'FormSubmission', metadata: { formTitle: form.title, formId: form.id } as unknown as Prisma.InputJsonValue } });

    return { success: true, message: form.successMessage ?? 'Thank you for your submission.', submissionId: submission.id };
  }
}
