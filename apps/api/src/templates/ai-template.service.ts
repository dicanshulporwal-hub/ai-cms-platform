import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import {
  AI_PROVIDER_CLIENT,
  AiProvider,
} from '../ai/providers/ai-provider.interface';

@Injectable()
export class AITemplateService {
  constructor(
    @Inject(AI_PROVIDER_CLIENT) private readonly aiProvider: AiProvider,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async generateFromScreenshot(
    screenshotUrl: string | undefined,
    prompt: string | undefined,
    templateType: string,
    user: AuthenticatedUser,
  ) {
    const enabled = this.configService.get<string>('AI_TEMPLATE_GENERATION_ENABLED') !== 'false';
    if (!enabled) {
      throw new Error('AI template generation is disabled.');
    }

    // Create job record
    const job = await this.prisma.aITemplateGenerationJob.create({
      data: {
        screenshotUrl: screenshotUrl ?? null,
        status: 'PENDING',
        prompt: prompt ?? null,
        templateType: templateType as any,
        createdById: user.id,
      },
    });

    // Process generation
    try {
      await this.prisma.aITemplateGenerationJob.update({
        where: { id: job.id },
        data: { status: 'PROCESSING' },
      });

      const systemPrompt = `You are a web template generator specializing in accessible, GIGW-ready government websites.
Generate a complete, responsive HTML template with embedded CSS.
Requirements:
- Semantic HTML5 (header, nav, main, footer, article, section)
- Skip-to-content link as first focusable element
- Responsive design with mobile-first approach
- Accessible: proper heading hierarchy, lang attribute, alt text placeholders
- Government identity: header with logo placeholder, footer with policy links
- Footer must include: Contact Us, Website Policies, Help, Feedback, Sitemap, Accessibility Statement
- Clean navigation with keyboard support
- Viewport meta tag
- No external scripts or unsafe content
- Use CSS custom properties for theming
- Template type: ${templateType}

Return ONLY a JSON object with these keys:
- html: the complete HTML document
- css: additional CSS (can be empty if embedded in HTML)
- config: a template.json object with name, slug, version, type, description, entry, regions, supports, complianceHints`;

      const userPrompt = prompt || `Generate a modern, accessible ${templateType} website template with hero section, content area, and footer.`;

      const result = await this.aiProvider.generateText({
        systemPrompt,
        userPrompt,
      });

      let parsed: { html?: string; css?: string; config?: Record<string, unknown> };
      try {
        // Try to extract JSON from the response
        const jsonMatch = result.result.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { html: result.result };
      } catch {
        parsed = { html: result.result };
      }

      await this.prisma.aITemplateGenerationJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          generatedHtml: parsed.html ?? null,
          generatedCss: parsed.css ?? null,
          generatedConfigJson: (parsed.config ?? null) as unknown as Prisma.InputJsonValue,
          aiProvider: result.metadata.provider,
          aiModel: result.metadata.model,
        },
      });

      return this.prisma.aITemplateGenerationJob.findUnique({ where: { id: job.id } });
    } catch (error) {
      await this.prisma.aITemplateGenerationJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Generation failed.',
        },
      });

      return this.prisma.aITemplateGenerationJob.findUnique({ where: { id: job.id } });
    }
  }

  async getJob(id: string) {
    const job = await this.prisma.aITemplateGenerationJob.findUnique({ where: { id } });
    if (!job) throw new Error('Generation job not found.');
    return job;
  }

  async saveAsTemplate(jobId: string, user: AuthenticatedUser) {
    const job = await this.getJob(jobId);
    if (job.status !== 'COMPLETED') {
      throw new Error('Can only save completed generation jobs as templates.');
    }

    const config = (job.generatedConfigJson as Record<string, unknown>) ?? {};
    const name = (config.name as string) ?? `AI Generated Template ${Date.now()}`;
    const slug = (config.slug as string) ?? `ai-template-${Date.now()}`;
    const version = (config.version as string) ?? '1.0.0';

    // Save HTML to disk
    const uploadDir = this.configService.get<string>('TEMPLATE_UPLOAD_DIR') ?? 'uploads/templates';
    const { mkdirSync, writeFileSync } = require('fs');
    const { resolve, join } = require('path');
    const templateDir = resolve(uploadDir, slug);
    mkdirSync(templateDir, { recursive: true });

    if (job.generatedHtml) {
      writeFileSync(join(templateDir, 'index.html'), job.generatedHtml, 'utf8');
    }
    if (job.generatedCss) {
      writeFileSync(join(templateDir, 'styles.css'), job.generatedCss, 'utf8');
    }
    writeFileSync(join(templateDir, 'template.json'), JSON.stringify(config, null, 2), 'utf8');

    const baseUrl = this.configService.get<string>('PUBLIC_TEMPLATE_BASE_URL') ?? '/uploads/templates';

    const template = await this.prisma.websiteTemplate.create({
      data: {
        name,
        slug,
        description: (config.description as string) ?? 'AI-generated template',
        version,
        templateType: job.templateType,
        status: 'DRAFT',
        isActive: false,
        configJson: config as unknown as Prisma.InputJsonValue,
        fileKey: slug,
        fileUrl: `${baseUrl}/${slug}/index.html`,
        storageProvider: 'local',
        uploadedById: user.id,
      },
    });

    await this.prisma.aITemplateGenerationJob.update({
      where: { id: jobId },
      data: { status: 'SAVED_AS_TEMPLATE' },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'template.ai_generated',
        entityId: template.id,
        entityType: 'WebsiteTemplate',
        metadata: { name, slug, jobId } as unknown as Prisma.InputJsonValue,
        userId: user.id,
      },
    });

    return template;
  }
}
