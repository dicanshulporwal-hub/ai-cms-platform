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

  async submitForApproval(id: string, user: AuthenticatedUser) {
    await this.prisma.aiPromptTemplate.update({ where: { id }, data: { status: 'PENDING_APPROVAL' } });
    await this.audit(id, null, 'SUBMITTED_FOR_APPROVAL', user.id);
    return this.getById(id);
  }

  async approve(id: string, user: AuthenticatedUser) {
    await this.prisma.aiPromptTemplate.update({ where: { id }, data: { status: 'PROMPT_APPROVED' as any } });
    // Also approve the latest version
    const latestVersion = await this.prisma.aiPromptVersion.findFirst({ where: { promptTemplateId: id }, orderBy: { version: 'desc' } });
    if (latestVersion) {
      await this.prisma.aiPromptVersion.update({ where: { id: latestVersion.id }, data: { status: 'VERSION_APPROVED', approvedById: user.id, approvedAt: new Date() } });
    }
    await this.audit(id, latestVersion?.id || null, 'APPROVED', user.id);
    return this.getById(id);
  }

  async reject(id: string, reason: string, user: AuthenticatedUser) {
    await this.prisma.aiPromptTemplate.update({ where: { id }, data: { status: 'PROMPT_DRAFT' } });
    const latestVersion = await this.prisma.aiPromptVersion.findFirst({ where: { promptTemplateId: id }, orderBy: { version: 'desc' } });
    if (latestVersion) {
      await this.prisma.aiPromptVersion.update({ where: { id: latestVersion.id }, data: { status: 'VERSION_REJECTED' } });
    }
    await this.audit(id, latestVersion?.id || null, 'REJECTED', user.id);
    return { message: 'Prompt rejected.', reason };
  }

  async testPrompt(id: string, dto: { versionId?: string; variables?: Record<string, string>; options?: { temperature?: number; maxTokens?: number } }, user: AuthenticatedUser) {
    const template = await this.prisma.aiPromptTemplate.findUnique({ where: { id } });
    if (!template || template.deletedAt) throw new NotFoundException('Prompt not found.');

    // Get version to test
    const version = dto.versionId
      ? await this.prisma.aiPromptVersion.findUnique({ where: { id: dto.versionId } })
      : await this.prisma.aiPromptVersion.findFirst({ where: { promptTemplateId: id }, orderBy: { version: 'desc' } });
    if (!version) throw new BadRequestException('No version found to test.');

    // Render prompt
    let userPrompt = version.userPromptTemplate;
    if (dto.variables) {
      for (const [key, value] of Object.entries(dto.variables)) {
        userPrompt = userPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }
    }

    const startTime = Date.now();
    let success = false;
    let outputText = '';
    let errorMessage: string | null = null;
    let tokenInput = 0;
    let tokenOutput = 0;

    try {
      // Call AI via the existing provider abstraction
      const { AiRouterService } = await import('../ai/ai-router.service');
      // For now, store the rendered prompt as the output (actual AI call requires DI wiring)
      outputText = `[Test Preview] System: ${version.systemPrompt.substring(0, 200)}... | User: ${userPrompt.substring(0, 200)}...`;
      success = true;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Test failed.';
    }

    const latencyMs = Date.now() - startTime;

    // Save test run
    const testRun = await this.prisma.aiPromptTestRun.create({
      data: {
        promptTemplateId: id,
        promptVersionId: version.id,
        taskType: template.taskType,
        inputJson: (dto.variables || {}) as unknown as Prisma.InputJsonValue,
        outputText: outputText.substring(0, 5000),
        success,
        errorMessage,
        tokenInput,
        tokenOutput,
        latencyMs,
        testedById: user.id,
      },
    });

    await this.audit(id, version.id, 'TESTED', user.id);
    return testRun;
  }

  async getTestRuns(id: string) {
    return this.prisma.aiPromptTestRun.findMany({
      where: { promptTemplateId: id },
      select: { id: true, taskType: true, success: true, tokenInput: true, tokenOutput: true, latencyMs: true, createdAt: true, outputText: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  runSafetyCheck(id: string) {
    // Safety check logic - returns warnings
    return this.getById(id).then(prompt => {
      const warnings: string[] = [];
      const latestVersion = prompt.versions[0];
      if (!latestVersion) return { safe: true, warnings: ['No version found.'] };

      const combined = `${latestVersion.systemPrompt} ${latestVersion.userPromptTemplate}`;

      if (/api[_-]?key|secret|password|token/i.test(combined)) warnings.push('Prompt may contain secrets or API key references.');
      if (/ignore.*previous.*instructions|ignore.*system/i.test(combined)) warnings.push('Prompt attempts to override system instructions.');
      if (!latestVersion.safetyRulesJson) warnings.push('No safety rules defined for this prompt.');
      if (latestVersion.userPromptTemplate.length > 3000) warnings.push('User prompt template is very long (>3000 chars). Consider shortening for token efficiency.');
      if (!/\{\{/.test(latestVersion.userPromptTemplate)) warnings.push('No variables found in user prompt template. Consider using {{placeholders}}.');

      return { safe: warnings.length === 0, warnings };
    });
  }

  private async audit(templateId: string, versionId: string | null, action: string, userId: string) {
    await this.prisma.auditLog.create({
      data: { action: `ai_prompt.${action.toLowerCase()}`, entityId: templateId, entityType: 'AiPromptTemplate', userId, metadata: { versionId } as unknown as Prisma.InputJsonValue },
    });
  }
}
