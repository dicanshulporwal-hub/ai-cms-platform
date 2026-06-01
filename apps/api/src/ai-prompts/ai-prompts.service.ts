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

  async seedDefaultPrompts(user: AuthenticatedUser) {
    const prompts = [
      {
        promptKey: 'content_generation',
        name: 'Content Generation',
        taskType: 'CONTENT_GENERATION',
        moduleKey: 'pages',
        description: 'Generate page/blog content from a topic and parameters.',
        systemPrompt: 'You are an AI content assistant for a CMS. Return editable HTML only. Do not publish, approve, or make workflow decisions. Do not invent facts. Do not include scripts or unsafe HTML.',
        userPromptTemplate: 'Create a polished content draft in {{language}}.\nTopic: {{topic}}\nTarget audience: {{targetAudience}}\nTone: {{tone}}\nApproximate length: {{maxLength}} words.\nReturn only the HTML content body.',
        variablesJson: [{ name: 'topic', required: true }, { name: 'language', required: true, default: 'English' }, { name: 'targetAudience', required: false }, { name: 'tone', required: false, default: 'professional' }, { name: 'maxLength', required: false, default: '500' }],
        safetyRulesJson: ['Do not hallucinate facts', 'Do not include scripts', 'Do not auto-publish'],
      },
      {
        promptKey: 'content_rewrite',
        name: 'Content Rewrite',
        taskType: 'CONTENT_REWRITE',
        moduleKey: 'pages',
        description: 'Rewrite existing content with a different tone or style.',
        systemPrompt: 'You are an AI content assistant for a CMS. Return editable content only and preserve factual meaning. Do not add new claims.',
        userPromptTemplate: 'Rewrite the following content with tone: {{tone}}.\n{{instruction}}\n\nContent:\n{{content}}\n\nReturn only the rewritten HTML.',
        variablesJson: [{ name: 'content', required: true }, { name: 'tone', required: true, default: 'professional' }, { name: 'instruction', required: false }],
        safetyRulesJson: ['Preserve factual meaning', 'Do not add new claims'],
      },
      {
        promptKey: 'summarization',
        name: 'Content Summarization',
        taskType: 'SUMMARIZATION',
        moduleKey: 'pages',
        description: 'Summarize content into a concise paragraph.',
        systemPrompt: 'You are an AI summary assistant for CMS editors. Return a concise plain-text summary. Do not add information not in the source.',
        userPromptTemplate: 'Summarize this content in {{maxLength}} words or fewer.\nKeep the summary editable and factual.\n\nContent:\n{{content}}',
        variablesJson: [{ name: 'content', required: true }, { name: 'maxLength', required: false, default: '120' }],
        safetyRulesJson: ['Do not add information not in source', 'Keep factual'],
      },
      {
        promptKey: 'seo_generation',
        name: 'SEO Metadata Generation',
        taskType: 'SEO_GENERATION',
        moduleKey: 'pages',
        description: 'Generate meta title, description, and keywords for SEO.',
        systemPrompt: 'You are an AI SEO assistant. Return only valid JSON. Meta titles must be 60 characters or fewer and meta descriptions 160 characters or fewer.',
        userPromptTemplate: 'Generate SEO metadata for this content.\nTitle: {{title}}\nContent: {{content}}\nKeywords: {{keywords}}\n\nReturn valid JSON: {"metaTitle":"...","metaDescription":"...","keywords":["..."]}',
        variablesJson: [{ name: 'title', required: true }, { name: 'content', required: true }, { name: 'keywords', required: false }],
        safetyRulesJson: ['Return valid JSON only', 'Respect character limits'],
        outputFormatJson: { metaTitle: 'string (max 60)', metaDescription: 'string (max 160)', keywords: 'string[]' },
      },
      {
        promptKey: 'faq_generation',
        name: 'FAQ Generation',
        taskType: 'FAQ_GENERATION',
        moduleKey: 'faqs',
        description: 'Generate FAQ question-answer pairs from content.',
        systemPrompt: 'You are an AI FAQ assistant. Return only valid JSON with concise, editable question-answer pairs. Do not invent information not present in the source content.',
        userPromptTemplate: 'Generate {{count}} FAQ items from this content:\n\n{{content}}\n\nReturn JSON: {"faqs":[{"question":"...","answer":"..."}]}',
        variablesJson: [{ name: 'content', required: true }, { name: 'count', required: false, default: '5' }],
        safetyRulesJson: ['Do not invent information', 'Return valid JSON'],
        outputFormatJson: { faqs: [{ question: 'string', answer: 'string' }] },
      },
      {
        promptKey: 'chatbot_answer',
        name: 'Chatbot Answer',
        taskType: 'CHATBOT',
        moduleKey: 'chatbot',
        description: 'Generate chatbot responses from published CMS content context.',
        systemPrompt: 'You are a helpful website assistant. Answer questions using only the provided context. If you cannot answer from the context, say so politely. Do not invent information. Keep answers concise and helpful.',
        userPromptTemplate: 'Context from published content:\n{{context}}\n\nVisitor question: {{question}}\n\nProvide a helpful, concise answer based only on the context above.',
        variablesJson: [{ name: 'context', required: true }, { name: 'question', required: true }],
        safetyRulesJson: ['Only use provided context', 'Do not invent facts', 'Be concise'],
      },
      {
        promptKey: 'document_metadata_generation',
        name: 'Document Metadata Generation',
        taskType: 'DOCUMENT_METADATA',
        moduleKey: 'documents',
        description: 'Generate title, description, and keywords for uploaded documents.',
        systemPrompt: 'You are a document metadata assistant. Generate title, description, keywords, and summary for uploaded documents. Return valid JSON only. Do not invent content not in the document.',
        userPromptTemplate: 'Generate metadata for this document.\nFilename: {{filename}}\nFile type: {{fileType}}\nExtracted text preview:\n{{textPreview}}\n\nReturn JSON: {"title":"...","description":"...","summary":"...","keywords":["..."]}',
        variablesJson: [{ name: 'filename', required: true }, { name: 'fileType', required: true }, { name: 'textPreview', required: true }],
        safetyRulesJson: ['Return valid JSON', 'Do not invent content'],
        outputFormatJson: { title: 'string', description: 'string', summary: 'string', keywords: 'string[]' },
      },
      {
        promptKey: 'schema_generation',
        name: 'Schema / Structured Data Generation',
        taskType: 'SCHEMA_GENERATION',
        moduleKey: 'schema',
        description: 'Generate JSON-LD structured data for content.',
        systemPrompt: 'You are a structured data assistant. Generate valid JSON-LD schema.org markup. Return only valid JSON. Do not include private or admin URLs. Do not invent dates or authors.',
        userPromptTemplate: 'Generate JSON-LD structured data for:\nType: {{schemaType}}\nTitle: {{title}}\nDescription: {{description}}\nURL: {{url}}\nPublished: {{publishedAt}}\n\nReturn valid JSON-LD with @context and @type.',
        variablesJson: [{ name: 'schemaType', required: true }, { name: 'title', required: true }, { name: 'description', required: false }, { name: 'url', required: true }, { name: 'publishedAt', required: false }],
        safetyRulesJson: ['Return valid JSON-LD', 'Do not include admin URLs', 'Do not invent data'],
      },
      {
        promptKey: 'accessibility_recommendation',
        name: 'Accessibility Fix Recommendations',
        taskType: 'ACCESSIBILITY_RECOMMENDATION',
        moduleKey: 'accessibility',
        description: 'Generate actionable fix recommendations for accessibility issues.',
        systemPrompt: 'You are an accessibility expert. Provide actionable recommendations to fix accessibility issues. Be specific and concise. Do not claim official WCAG certification.',
        userPromptTemplate: 'Provide fix recommendations for these accessibility issues:\n\n{{issues}}\n\nFor each issue, suggest a specific fix in 1-2 sentences.',
        variablesJson: [{ name: 'issues', required: true }],
        safetyRulesJson: ['Do not claim certification', 'Be specific and actionable'],
      },
      {
        promptKey: 'broken_link_recommendation',
        name: 'Broken Link Fix Recommendations',
        taskType: 'BROKEN_LINK_RECOMMENDATION',
        moduleKey: 'broken_links',
        description: 'Suggest fixes for broken links found in content.',
        systemPrompt: 'You are a link maintenance assistant. Suggest fixes for broken links. Do not invent URLs. Suggest searching for similar content or removing the link if no replacement exists.',
        userPromptTemplate: 'Suggest fixes for this broken link:\nBroken URL: {{brokenUrl}}\nFound in: {{sourceTitle}} ({{sourceType}})\nLink text: {{linkText}}\nIssue: {{issueType}}\n\nSuggest a fix or alternative.',
        variablesJson: [{ name: 'brokenUrl', required: true }, { name: 'sourceTitle', required: true }, { name: 'sourceType', required: true }, { name: 'linkText', required: false }, { name: 'issueType', required: true }],
        safetyRulesJson: ['Do not invent URLs', 'Suggest removal if no replacement'],
      },
    ];

    const created: string[] = [];
    for (const p of prompts) {
      const existing = await this.prisma.aiPromptTemplate.findUnique({ where: { promptKey: p.promptKey } });
      if (existing) { created.push(`${p.promptKey} (exists)`); continue; }

      const template = await this.prisma.aiPromptTemplate.create({
        data: { promptKey: p.promptKey, name: p.name, description: p.description, taskType: p.taskType as any, moduleKey: p.moduleKey, status: 'PROMPT_ACTIVE', isSystemPrompt: true, isDefault: true, createdById: user.id },
      });

      const version = await this.prisma.aiPromptVersion.create({
        data: {
          promptTemplateId: template.id, version: 1, systemPrompt: p.systemPrompt, userPromptTemplate: p.userPromptTemplate,
          variablesJson: p.variablesJson as unknown as Prisma.InputJsonValue,
          safetyRulesJson: p.safetyRulesJson as unknown as Prisma.InputJsonValue,
          outputFormatJson: (p as any).outputFormatJson ? ((p as any).outputFormatJson as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          temperature: 0.7, maxTokens: 1200, status: 'VERSION_ACTIVE', createdById: user.id, approvedById: user.id, approvedAt: new Date(),
        },
      });

      await this.prisma.aiPromptTemplate.update({ where: { id: template.id }, data: { currentVersionId: version.id } });
      created.push(p.promptKey);
    }

    this.rendering.invalidateCache();
    return { message: `Seeded ${created.length} prompts.`, prompts: created };
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
