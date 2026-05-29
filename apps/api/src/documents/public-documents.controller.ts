import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Public Documents')
@Controller('public/documents')
export class PublicDocumentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List published documents.' })
  async findAll(@Query() query: { categorySlug?: string }) {
    const where: any = { status: 'PUBLISHED', deletedAt: null };
    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }
    return this.prisma.document.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, title: true, slug: true, description: true,
        summary: true, documentType: true, fileSize: true,
        fileUrl: true, seoTitle: true, seoDescription: true,
        publishedAt: true, category: { select: { name: true, slug: true } },
      },
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get published document by slug.' })
  async findBySlug(@Param('slug') slug: string) {
    const doc = await this.prisma.document.findUnique({
      where: { slug },
      select: {
        id: true, title: true, slug: true, description: true,
        summary: true, documentType: true, fileSize: true, fileUrl: true,
        pageCount: true, language: true, seoTitle: true, seoDescription: true,
        accessibilityText: true, tagsJson: true, publishedAt: true,
        category: { select: { name: true, slug: true } },
      },
    });
    if (!doc) return { error: 'Document not found.', statusCode: 404 };
    return doc;
  }
}
