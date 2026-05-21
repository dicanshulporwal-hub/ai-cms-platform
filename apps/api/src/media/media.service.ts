import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { MediaQueryDto } from './dto/media-query.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import {
  normalizePublicMediaBaseUrl,
  resolveMediaUploadDir,
} from './media-storage';

export interface UploadedMediaFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

const mediaInclude = {
  uploadedBy: {
    select: {
      email: true,
      id: true,
      name: true,
    },
  },
} satisfies Prisma.MediaInclude;

const supportedTypes = new Map<string, string[]>([
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/svg+xml', ['.svg']],
  ['image/webp', ['.webp']],
]);

const executableExtensions = new Set([
  '.asp',
  '.aspx',
  '.bat',
  '.cmd',
  '.cjs',
  '.dll',
  '.exe',
  '.html',
  '.jar',
  '.js',
  '.jsp',
  '.mjs',
  '.msi',
  '.php',
  '.ps1',
  '.scr',
  '.sh',
]);

type MediaWithUploader = Prisma.MediaGetPayload<{ include: typeof mediaInclude }>;

@Injectable()
export class MediaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: MediaQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.MediaWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            originalName: {
              contains: query.search,
            },
          }
        : {}),
      ...(query.mimeType ? { mimeType: query.mimeType } : {}),
      ...(query.folder ? { folder: this.cleanText(query.folder) } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        include: mediaInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        where,
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      data: items.map((item) => this.toResponse(item)),
      meta: {
        limit,
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string) {
    return this.toResponse(await this.getActiveMedia(id));
  }

  async upload(
    file: UploadedMediaFile | undefined,
    body: UpdateMediaDto,
    user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException('A media file is required.');
    }

    this.validateFile(file);

    const uploadDir = resolveMediaUploadDir(
      this.configService.get<string>('MEDIA_UPLOAD_DIR', 'uploads/media'),
    );
    const fileName = this.createSafeFileName(file.originalname);
    const filePath = join(uploadDir, fileName);
    const fileUrl = `${this.publicMediaBaseUrl()}/${encodeURIComponent(fileName)}`;

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, file.buffer, { flag: 'wx' });

    const media = await this.prisma.media.create({
      data: {
        altText: this.cleanText(body.altText),
        caption: this.cleanText(body.caption),
        fileName,
        fileSize: file.size,
        fileUrl,
        folder: this.cleanText(body.folder),
        mimeType: file.mimetype,
        originalName: this.safeOriginalName(file.originalname),
        uploadedById: user.id,
      },
      include: mediaInclude,
    });

    await this.audit('media.uploaded', media, user, {
      fileName: media.fileName,
      mimeType: media.mimeType,
      originalName: media.originalName,
    });

    return this.toResponse(media);
  }

  async update(id: string, dto: UpdateMediaDto, user: AuthenticatedUser) {
    await this.getActiveMedia(id);

    const media = await this.prisma.media.update({
      data: {
        altText: this.cleanText(dto.altText),
        caption: this.cleanText(dto.caption),
        folder: this.cleanText(dto.folder),
      },
      include: mediaInclude,
      where: { id },
    });

    await this.audit('media.updated', media, user, {
      altText: media.altText,
      caption: media.caption,
      folder: media.folder,
    });

    return this.toResponse(media);
  }

  async remove(id: string, user: AuthenticatedUser) {
    const currentMedia = await this.getActiveMedia(id);
    const media = await this.prisma.media.update({
      data: { deletedAt: new Date() },
      include: mediaInclude,
      where: { id },
    });

    await this.audit('media.deleted', currentMedia, user, {
      fileName: currentMedia.fileName,
      originalName: currentMedia.originalName,
    });

    return this.toResponse(media);
  }

  private async getActiveMedia(id: string) {
    const media = await this.prisma.media.findUnique({
      include: mediaInclude,
      where: { id },
    });

    if (!media || media.deletedAt) {
      throw new NotFoundException('Media asset not found.');
    }

    return media;
  }

  private validateFile(file: UploadedMediaFile) {
    const extension = extname(file.originalname).toLowerCase();
    const allowedExtensions = supportedTypes.get(file.mimetype);
    const maxSizeBytes =
      this.configService.get<number>('MAX_UPLOAD_SIZE_MB', 5) * 1024 * 1024;

    if (!allowedExtensions || !allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        'Unsupported media type. Upload JPG, PNG, WebP, or safe SVG files.',
      );
    }

    if (executableExtensions.has(extension)) {
      throw new BadRequestException('Executable files are not allowed.');
    }

    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `File is too large. Maximum upload size is ${this.configService.get<number>(
          'MAX_UPLOAD_SIZE_MB',
          5,
        )} MB.`,
      );
    }

    if (file.mimetype === 'image/svg+xml') {
      this.validateSvg(file.buffer);
    }
  }

  private validateSvg(buffer: Buffer) {
    const svg = buffer.toString('utf8').toLowerCase();
    const blockedPatterns = [
      /<script/,
      /javascript:/,
      /\son[a-z]+\s*=/,
      /<foreignobject/,
      /<iframe/,
      /<object/,
      /<embed/,
      /<link/,
      /<\?xml-stylesheet/,
    ];

    if (!svg.includes('<svg') || blockedPatterns.some((pattern) => pattern.test(svg))) {
      throw new BadRequestException('SVG file failed safety validation.');
    }
  }

  private createSafeFileName(originalName: string) {
    const extension = extname(originalName).toLowerCase();
    const baseName = originalName.slice(0, -extension.length);
    const sanitizedBaseName =
      baseName
        .normalize('NFKD')
        .replace(/[^\w.-]+/g, '-')
        .replace(/[^a-zA-Z0-9_.-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^[-.]+|[-.]+$/g, '')
        .toLowerCase() || 'media';

    return `${Date.now()}-${randomUUID()}-${sanitizedBaseName}${extension}`;
  }

  private safeOriginalName(originalName: string) {
    return originalName.replace(/[\\/:*?"<>|]+/g, '-').trim() || 'media';
  }

  private cleanText(value?: string | null) {
    const cleaned = value?.trim();

    return cleaned ? cleaned : null;
  }

  private publicMediaBaseUrl() {
    return normalizePublicMediaBaseUrl(
      this.configService.get<string>(
        'PUBLIC_MEDIA_BASE_URL',
        'http://localhost:3001/uploads/media',
      ),
    );
  }

  private async audit(
    action: string,
    media: Pick<MediaWithUploader, 'id'>,
    user: AuthenticatedUser,
    metadata?: Prisma.InputJsonValue,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        entityId: media.id,
        entityType: 'Media',
        mediaId: media.id,
        metadata,
        userId: user.id,
      },
    });
  }

  private toResponse(media: MediaWithUploader) {
    return {
      altText: media.altText,
      caption: media.caption,
      createdAt: media.createdAt,
      fileName: media.fileName,
      fileSize: media.fileSize,
      fileUrl: media.fileUrl,
      folder: media.folder,
      id: media.id,
      mimeType: media.mimeType,
      originalName: media.originalName,
      updatedAt: media.updatedAt,
      uploadedBy: media.uploadedBy,
      uploadedById: media.uploadedById,
    };
  }
}
