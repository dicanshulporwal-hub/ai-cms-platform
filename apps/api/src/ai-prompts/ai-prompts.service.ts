import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiPromptRenderingService } from './ai-prompt-rendering.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class AiPromptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rendering: AiPromptRenderingService,
  ) {}

  async list(filters?: { taskType?: string; moduleKey?: string; status?: string }) {
    const where: any = { deletedAt: null };
    if (filters?.taskType) where.taskType = filters.taskType;
    if (filters?.moduleKey) where.moduleKey = filters.moduleKey;
    if (filters?.status) where.status = filters.status;

    return this.prisma.aiPromptTemplate.findMany({
      where,
      select: { id: true, promptKey: true, name: true, taskType: true, moduleKey: true, status: true, isSystemPrompt: true, isDefault: true, currentVersionId: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
  }

  async getById(id: string) {
    const prompt = await this.prisma.aiPromptTemplate.findUnique({
      where: { id },
      include: { versions: { orderBy: { version: 'desc' }, take: 10 } },
    });
    if (!prompt || prompt.deletedAt) throw new NotFoundException('Prompt not found.');
    return prompt;
  }

  async create(dto: { promptKey: string; name: string; description?: string; taskType: string; moduleKey?: string; systemPrompt: string; userPromptTemplate: string; variablesJson?: any; outputFormatJson?: any; safetyRulesJson?: any; temperature?: number; maxTokens?: number }, user: AuthenticatedUser) {
    // Check uniqueness
    const existing = await this.prisma.aiPromptTemplate.findUnique({ where: { promptKey: dto.promptKey } });
    if (existing) throw new BadRequestException('Prompt key already exists.');

    const template = await this.prisma.aiPromptTemplate.create({
      data: { promptKey: dto.promptKey, name: dto.name, description: dto.description, taskType: dto.taskType as any, moduleKey: dto.moduleKey, status: 'PROMPT_DRAFT', createdById: user.id },
    });

    // Create first version
    await this.prisma.aiPromptVersion.create({
      data: {
        promptTemplateId: template.id, version: 1, systemPrompt: dto.systemPrompt, userPromptTemplate: dto.userPromptTemplate,
        variablesJson: dto.variablesJson ? (dto.variablesJson as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        outputFormatJson: dto.outputFormatJson ? (dto.outputFormatJson as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        safetyRulesJson: dto.safetyRulesJson ? (dto.safetyRulesJson as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        temperature: dto.temperature ?? 0.7, maxTokens: dto.maxTokens ?? 1200, status: 'VERSION_DRAFT', createdById: user.id,
      },
    });

    await this.audit(template.id, null, 'CREATED', user.id);
    return this.getById(template.id);
  }

  async createVersion(id: string, dto: { systemPrompt: string; userPromptTemplate: string; variablesJson?: any; outputFormatJson?: any; safetyRulesJson?: any; temperature?: number; maxTokens?: number; changeNote?: string }, user: AuthenticatedUser) {
    const template = await this.prisma.aiPromptTemplate.findUnique({ where: { id } });
    if (!template || template.deletedAt) throw new NotFoundException('Prompt not found.');

    const lastVersion = await this.prisma.aiPromptVersion.findFirst({ where: { promptTemplateId: id }, orderBy: { version: 'desc' } });
    const nextVersion = (lastVersion?.version ?? 0) + 1;

    const version = await this.prisma.aiPromptVersion.create({
      data: {
        promptTemplateId: id, version: nextVersion, systemPrompt: dto.systemPrompt, userPromptTemplate: dto.userPromptTemplate,
        variablesJson: dto.variablesJson ? (dto.variablesJson as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        outputFormatJson: dto.outputFormatJson ? (dto.outputFormatJson as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        safetyRulesJson: dto.safetyRulesJson ? (dto.safetyRulesJson as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        temperature: dto.temperature ?? 0.7, maxTokens: dto.maxTokens ?? 1200, status: 'VERSION_DRAFT', changeNote: dto.changeNote, createdById: user.id,
      },
    });

    await this.audit(id, version.id, 'UPDATED', user.id);
    return version;
  }

  async activateVersion(id: string, versionId: string, user: AuthenticatedUser) {
    const version = await this.prisma.aiPromptVersion.findFirst({ where: { id: versionId, promptTemplateId: id } });
    if (!version) throw new NotFoundException('Version not found.');

    // Deactivate other versions
    await this.prisma.aiPromptVersion.updateMany({ where: { promptTemplateId: id, status: 'VERSION_ACTIVE' }, data: { status: 'VERSION_ARCHIVED' } });

    // Activate this version
    await this.prisma.aiPromptVersion.update({ where: { id: versionId }, data: { status: 'VERSION_ACTIVE', approvedById: user.id, approvedAt: new Date() } });

    // Update template
    await this.prisma.aiPromptTemplate.update({ where: { id }, data: { status: 'PROMPT_ACTIVE', currentVersionId: versionId } });

    this.rendering.invalidateCache();
    await this.audit(id, versionId, 'ACTIVATED', user.id);
    return this.getById(id);
  }

  async rollback(id: string, versionId: string, user: AuthenticatedUser) {
    return this.activateVersion(id, versionId, user);
  }

  async deletePrompt(id: string, user: AuthenticatedUser) {
    const template = await this.prisma.aiPromptTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Prompt not found.');
    if (template.isSystemPrompt) throw new BadRequestException('System prompts cannot be deleted.');

    await this.prisma.aiPromptTemplate.update({ where: { id }, data: { deletedAt: new Date() } });
    this.rendering.invalidateCache();
    await this.audit(id, null, 'DELETED', user.id);
    return { message: 'Prompt deleted.' };
  }

  async getGovernanceSummary() {
    const [total, active, pending, disabled] = await Promise.all([
      this.prisma.aiPromptTemplate.count({ where: { deletedAt: null } }),
      this.prisma.aiPromptTemplate.count({ where: { status: 'PROMPT_ACTIVE', deletedAt: null } }),
      this.prisma.aiPromptTemplate.count({ where: { status: 'PENDING_APPROVAL', deletedAt: null } }),
      this.prisma.aiPromptTemplate.count({ where: { status: 'PROMPT_DISABLED', deletedAt: null } }),
    ]);
    return { total, active, pending, disabled };
  }

  private async audit(templateId: string, versionId: string | null, action: string, userId: string) {
    await this.prisma.auditLog.create({
      data: { action: `ai_prompt.${action.toLowerCase()}`, entityId: templateId, entityType: 'AiPromptTemplate', userId, metadata: { versionId } as unknown as Prisma.InputJsonValue },
    });
  }
}
