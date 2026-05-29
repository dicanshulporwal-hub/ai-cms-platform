import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Public FAQs')
@Controller('public/faqs')
export class PublicFaqsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get() @ApiOperation({ summary: 'List published FAQs.' })
  async findAll(@Query() query: { search?: string; categorySlug?: string; featured?: string }) {
    const where: any = { status: 'PUBLISHED', deletedAt: null };
    if (query.search) where.OR = [{ question: { contains: query.search } }, { answer: { contains: query.search } }];
    if (query.categorySlug) where.category = { slug: query.categorySlug, status: 'ACTIVE' };
    if (query.featured === 'true') where.isFeatured = true;
    return this.prisma.faq.findMany({ where, orderBy: { sortOrder: 'asc' }, select: { id: true, question: true, answer: true, slug: true, isFeatured: true, category: { select: { name: true, slug: true } }, seoTitle: true, seoDescription: true, publishedAt: true } });
  }

  @Get(':slug') @ApiOperation({ summary: 'Get published FAQ by slug.' })
  async findBySlug(@Param('slug') slug: string) {
    const faq = await this.prisma.faq.findUnique({ where: { slug }, select: { id: true, question: true, answer: true, slug: true, isFeatured: true, category: { select: { name: true, slug: true } }, tagsJson: true, seoTitle: true, seoDescription: true, publishedAt: true } });
    if (!faq) return { error: 'FAQ not found.', statusCode: 404 };
    return faq;
  }
}
