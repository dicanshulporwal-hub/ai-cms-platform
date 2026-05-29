import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFields(formId: string) {
    return this.prisma.formField.findMany({ where: { formId }, orderBy: { sortOrder: 'asc' } });
  }

  async addField(formId: string, dto: { fieldKey: string; label: string; fieldType: string; placeholder?: string; helpText?: string; isRequired?: boolean; validationJson?: Record<string, unknown>; optionsJson?: string[]; defaultValue?: string; sortOrder?: number }) {
    return this.prisma.formField.create({
      data: { formId, fieldKey: dto.fieldKey, label: dto.label, fieldType: dto.fieldType as any, placeholder: dto.placeholder, helpText: dto.helpText, isRequired: dto.isRequired ?? false, validationJson: dto.validationJson ? (dto.validationJson as unknown as Prisma.InputJsonValue) : undefined, optionsJson: dto.optionsJson ? (dto.optionsJson as unknown as Prisma.InputJsonValue) : undefined, defaultValue: dto.defaultValue, sortOrder: dto.sortOrder ?? 0 },
    });
  }

  async updateField(formId: string, fieldId: string, dto: any) {
    const field = await this.prisma.formField.findFirst({ where: { id: fieldId, formId } });
    if (!field) throw new NotFoundException('Field not found.');
    return this.prisma.formField.update({ where: { id: fieldId }, data: { label: dto.label, fieldKey: dto.fieldKey, fieldType: dto.fieldType, placeholder: dto.placeholder, helpText: dto.helpText, isRequired: dto.isRequired, validationJson: dto.validationJson ? (dto.validationJson as unknown as Prisma.InputJsonValue) : undefined, optionsJson: dto.optionsJson ? (dto.optionsJson as unknown as Prisma.InputJsonValue) : undefined, defaultValue: dto.defaultValue, sortOrder: dto.sortOrder, isVisible: dto.isVisible } });
  }

  async deleteField(formId: string, fieldId: string) {
    const field = await this.prisma.formField.findFirst({ where: { id: fieldId, formId } });
    if (!field) throw new NotFoundException('Field not found.');
    await this.prisma.formField.delete({ where: { id: fieldId } });
    return { message: 'Field deleted.' };
  }

  async reorderFields(formId: string, fieldIds: string[]) {
    for (let i = 0; i < fieldIds.length; i++) {
      await this.prisma.formField.update({ where: { id: fieldIds[i] }, data: { sortOrder: i } });
    }
    return this.getFields(formId);
  }
}
