import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentStatus, Prisma } from '@prisma/client';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, resolve } from 'path';
import { randomUUID } from 'crypto';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const MIME_TO_TYPE: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
};

const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.ps1', '.sh', '.php', '.jsp', '.asp', '.aspx'];

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 180);
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(query: { search?: string; status?: string; categoryId?: string; documentType?: string; page?: number; limit?: number }) {
    const { search, status, categoryId, documentType, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.DocumentWhereInput = {
      deletedAt: null,
      ...(search ? { OR: [{ title: { contains: search } }, { originalFileName: { contains: search } }] } : {}),
      ...(status ? { status: status as DocumentStatus } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(documentType ? { documentType: documentType as any } : {}),
    };

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where, orderBy: { updatedAt: 'desc' }, skip, take: limit,
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { data: documents, total, page, limit };
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { category: true, versions: { orderBy: { createdAt: 'desc' } } },
    });
    if (!doc || doc.deletedAt) throw new NotFoundException('Document not found.');
    return doc;
  }

  async upload(file: { buffer: Buffer; originalname: string; size: number; mimetype: string }, user: AuthenticatedUser) {
    if (!file) throw new BadRequestException('No file uploaded.');

    const maxSize = (this.configService.get<number>('MAX_DOCUMENT_UPLOAD_SIZE_MB') ?? 25) * 1024 * 1024;
    if (file.size > maxSize) throw new BadRequestException('File exceeds maximum upload size.');

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }

    const ext = extname(file.originalname).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      throw new BadRequestException('Dangerous file type not allowed.');
    }

    const uploadDir = this.configService.get<string>('DOCUMENT_UPLOAD_DIR') ?? 'uploads/documents';
    mkdirSync(resolve(uploadDir), { recursive: true });

    const fileId = randomUUID();
    const safeFileName = `${fileId}${ext}`;
    const filePath = resolve(uploadDir, safeFileName);
    writeFileSync(filePath, file.buffer);

    const baseUrl = this.configService.get<string>('PUBLIC_DOCUMENT_BASE_URL') ?? '/uploads/documents';
    const fileUrl = `${baseUrl}/${safeFileName}`;
    const documentType = (MIME_TO_TYPE[file.mimetype] ?? 'OTHER') as any;
    const title = file.originalname.replace(ext, '').replace(/[_-]/g, ' ').trim();
    const slug = slugify(title) + '-' + fileId.slice(0, 8);

    // Extract page count for PDFs
    let pageCount: number | null = null;
    let metadataJson: Record<string, unknown> = {};
    if (file.mimetype === 'application/pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(file.buffer);
        pageCount = pdfData.numpages ?? null;
        metadataJson = {
          title: pdfData.info?.Title ?? null,
          author: pdfData.info?.Author ?? null,
          creationDate: pdfData.info?.CreationDate ?? null,
          textPreview: (pdfData.text ?? '').slice(0, 500),
          hasText: (pdfData.text ?? '').trim().length > 0,
        };
      } catch {
        metadataJson = { extractionError: 'Failed to parse PDF.' };
      }
    }

    const document = await this.prisma.document.create({
      data: {
        title,
        slug,
        originalFileName: file.originalname,
        fileName: safeFileName,
        fileKey: safeFileName,
        fileUrl,
        mimeType: file.mimetype,
        fileSize: file.size,
        pageCount,
        documentType,
        status: DocumentStatus.DRAFT,
        metadataJson: metadataJson as unknown as Prisma.InputJsonValue,
        uploadedById: user.id,
      },
    });

    // Create version
    await this.prisma.documentVersion.create({
      data: { documentId: document.id, version: 1, fileKey: safeFileName, fileUrl, originalFileName: file.originalname, fileSize: file.size, uploadedById: user.id },
    });

    await this.prisma.auditLog.create({
      data: { action: 'document.uploaded', entityId: document.id, entityType: 'Document', metadata: { title, fileName: file.originalname, fileSize: file.size } as unknown as Prisma.InputJsonValue, userId: user.id },
    });

    return document;
  }

  async update(id: string, dto: { title?: string; slug?: string; description?: string; summary?: string; categoryId?: string; language?: string; seoTitle?: string; seoDescription?: string; accessibilityText?: string; tagsJson?: string[] }, user: AuthenticatedUser) {
    const doc = await this.findOne(id);

    if (dto.slug && dto.slug !== doc.slug) {
      const existing = await this.prisma.document.findUnique({ where: { slug: dto.slug } });
      if (existing) throw new BadRequestException('Slug already in use.');
    }

    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        slug: dto.slug?.trim(),
        description: dto.description?.trim(),
        summary: dto.summary?.trim(),
        categoryId: dto.categoryId || undefined,
        language: dto.language?.trim(),
        seoTitle: dto.seoTitle?.trim(),
        seoDescription: dto.seoDescription?.trim(),
        accessibilityText: dto.accessibilityText?.trim(),
        tagsJson: dto.tagsJson ? (dto.tagsJson as unknown as Prisma.InputJsonValue) : undefined,
      },
    });

    await this.prisma.auditLog.create({
      data: { action: 'document.updated', entityId: id, entityType: 'Document', metadata: { changes: Object.keys(dto) } as unknown as Prisma.InputJsonValue, userId: user.id },
    });

    return updated;
  }

  async publish(id: string, user: AuthenticatedUser) {
    const doc = await this.findOne(id);
    const published = await this.prisma.document.update({
      where: { id },
      data: { status: DocumentStatus.PUBLISHED, publishedAt: new Date() },
    });
    await this.prisma.auditLog.create({
      data: { action: 'document.published', entityId: id, entityType: 'Document', metadata: { title: doc.title } as unknown as Prisma.InputJsonValue, userId: user.id },
    });
    return published;
  }

  async archive(id: string, user: AuthenticatedUser) {
    const doc = await this.findOne(id);
    const archived = await this.prisma.document.update({
      where: { id },
      data: { status: DocumentStatus.ARCHIVED },
    });
    await this.prisma.auditLog.create({
      data: { action: 'document.archived', entityId: id, entityType: 'Document', metadata: { title: doc.title } as unknown as Prisma.InputJsonValue, userId: user.id },
    });
    return archived;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const doc = await this.findOne(id);
    await this.prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.auditLog.create({
      data: { action: 'document.deleted', entityId: id, entityType: 'Document', metadata: { title: doc.title } as unknown as Prisma.InputJsonValue, userId: user.id },
    });
    return { message: 'Document deleted.' };
  }

  async applyAIMetadata(id: string, jobId: string, user: AuthenticatedUser) {
    const job = await this.prisma.documentMetadataGenerationJob.findUnique({ where: { id: jobId } });
    if (!job || job.documentId !== id) throw new NotFoundException('Metadata job not found.');
    if (job.status !== 'COMPLETED') throw new BadRequestException('Job is not completed.');

    const metadata = job.generatedMetadataJson as Record<string, unknown>;
    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        title: (metadata.suggestedTitle as string) || undefined,
        summary: (metadata.summary as string) || undefined,
        description: (metadata.shortDescription as string) || undefined,
        seoTitle: (metadata.seoTitle as string)?.slice(0, 60) || undefined,
        seoDescription: (metadata.seoDescription as string)?.slice(0, 160) || undefined,
        language: (metadata.language as string) || undefined,
        accessibilityText: (metadata.accessibilityText as string) || undefined,
        keywordsJson: metadata.keywords ? (metadata.keywords as unknown as Prisma.InputJsonValue) : undefined,
        tagsJson: metadata.tags ? (metadata.tags as unknown as Prisma.InputJsonValue) : undefined,
        aiMetadataJson: metadata as unknown as Prisma.InputJsonValue,
        status: DocumentStatus.READY_FOR_REVIEW,
      },
    });

    await this.prisma.documentMetadataGenerationJob.update({ where: { id: jobId }, data: { status: 'APPLIED' } });
    await this.prisma.auditLog.create({
      data: { action: 'document.ai_metadata_applied', entityId: id, entityType: 'Document', metadata: { jobId } as unknown as Prisma.InputJsonValue, userId: user.id },
    });

    return updated;
  }
}
