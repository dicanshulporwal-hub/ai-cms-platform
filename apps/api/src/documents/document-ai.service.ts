import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AI_PROVIDER_CLIENT, AiProvider } from '../ai/providers/ai-provider.interface';

@Injectable()
export class DocumentAIService {
  constructor(
    @Inject(AI_PROVIDER_CLIENT) private readonly aiProvider: AiProvider,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async generateMetadata(documentId: string, user: AuthenticatedUser) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc || doc.deletedAt) throw new NotFoundException('Document not found.');

    // Try to extract text from PDF
    let extractedText = '';
    let extractionNote = '';

    if (doc.mimeType === 'application/pdf') {
      try {
        const uploadDir = this.configService.get<string>('DOCUMENT_UPLOAD_DIR') ?? 'uploads/documents';
        const filePath = resolve(uploadDir, doc.fileName);
        if (existsSync(filePath)) {
          const pdfParse = require('pdf-parse');
          const buffer = readFileSync(filePath);
          const pdfData = await pdfParse(buffer);
          extractedText = (pdfData.text ?? '').replace(/\s+/g, ' ').trim();
        }
      } catch (err) {
        extractionNote = 'PDF text extraction failed. Generating metadata from filename and document info only.';
      }
    } else {
      extractionNote = `Non-PDF document (${doc.documentType}). Generating metadata from filename and document info.`;
    }

    const maxChars = this.configService.get<number>('DOCUMENT_TEXT_EXTRACTION_MAX_CHARS') ?? 15000;
    const textPreview = extractedText.slice(0, maxChars);

    if (!textPreview) {
      extractionNote = extractionNote || 'No selectable text found in PDF. Generating metadata from filename and available info.';
    }

    // Always proceed with AI generation - use whatever info we have
    const job = await this.prisma.documentMetadataGenerationJob.create({
      data: {
        documentId,
        status: 'PROCESSING',
        createdById: user.id,
        extractedTextPreview: textPreview ? textPreview.slice(0, 500) : extractionNote,
      },
    });

    try {
      const systemPrompt = `You are a document metadata specialist. Analyze the provided document information and generate structured metadata. Return ONLY valid JSON with these exact keys:
{"suggestedTitle":"","summary":"","shortDescription":"","documentType":"","language":"","keywords":[],"seoTitle":"","seoDescription":"","suggestedCategory":"","tags":[],"accessibilityText":"","readingAudience":"","importantDates":[],"departmentOrOwner":"","documentPurpose":"","publicFriendlyLabel":""}

Rules:
- seoTitle max 60 chars
- seoDescription max 160 chars
- If information is not available, make reasonable inferences from the filename
- Do not invent specific government departments, dates, or policy claims
- For documents without extracted text, generate metadata based on filename, file type, and any available context
- Always provide at least a suggestedTitle, shortDescription, and seoTitle based on the filename
- Be helpful and generate useful metadata even with limited information`;

      // Build context from all available info
      const contextParts = [
        `Document filename: ${doc.originalFileName}`,
        `File type: ${doc.documentType}`,
        `MIME type: ${doc.mimeType}`,
        `File size: ${(doc.fileSize / 1024).toFixed(1)} KB`,
      ];

      if (doc.pageCount) {
        contextParts.push(`Page count: ${doc.pageCount}`);
      }

      if (doc.title && doc.title !== doc.originalFileName.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')) {
        contextParts.push(`Current title: ${doc.title}`);
      }

      if (extractionNote) {
        contextParts.push(`Note: ${extractionNote}`);
      }

      if (textPreview) {
        contextParts.push(`\nExtracted text content:\n${textPreview}`);
      } else {
        contextParts.push(`\nNo text content could be extracted. Please generate metadata based on the filename and file information above.`);
      }

      const result = await this.aiProvider.generateText({
        systemPrompt,
        userPrompt: contextParts.join('\n'),
      });

      let parsed: Record<string, unknown>;
      try {
        const jsonMatch = result.result.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch {
        parsed = {};
      }

      await this.prisma.documentMetadataGenerationJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          generatedMetadataJson: parsed as unknown as Prisma.InputJsonValue,
          aiProvider: result.metadata.provider,
          aiModel: result.metadata.model,
          promptSummary: `Document: ${doc.originalFileName}`,
        },
      });

      // Log AI usage
      await this.prisma.aIUsageLog.create({
        data: {
          action: 'document-metadata-generation',
          feature: 'document-metadata-generation',
          provider: result.metadata.provider,
          model: result.metadata.model,
          modelName: result.metadata.model,
          promptSummary: `Metadata for: ${doc.originalFileName}`,
          tokenInput: result.metadata.tokenInput ?? 0,
          tokenOutput: result.metadata.tokenOutput ?? 0,
          promptTokens: result.metadata.tokenInput ?? 0,
          completionTokens: result.metadata.tokenOutput ?? 0,
          totalTokens: (result.metadata.tokenInput ?? 0) + (result.metadata.tokenOutput ?? 0),
          userId: user.id,
        },
      });

      return this.prisma.documentMetadataGenerationJob.findUnique({ where: { id: job.id } });
    } catch (error) {
      await this.prisma.documentMetadataGenerationJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', errorMessage: error instanceof Error ? error.message : 'AI generation failed.' },
      });
      return this.prisma.documentMetadataGenerationJob.findUnique({ where: { id: job.id } });
    }
  }

  async getJob(documentId: string, jobId: string) {
    const job = await this.prisma.documentMetadataGenerationJob.findUnique({ where: { id: jobId } });
    if (!job || job.documentId !== documentId) throw new NotFoundException('Job not found.');
    return job;
  }
}
