import { Controller, Get, Headers, Param, Query, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ApiAccessService } from './api-access.service';

@ApiTags('Content Delivery API (v1)')
@Controller('api/v1/content')
export class ContentDeliveryController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly apiAccess: ApiAccessService,
  ) {}

  private async authenticate(authHeader?: string) {
    const key = authHeader?.replace('Bearer ', '') || '';
    const result = await this.apiAccess.validateApiKey(key);
    if (!result.valid) throw new UnauthorizedException('Invalid or expired API key.');
    return result;
  }

  @Get('pages')
  @ApiOperation({ summary: 'List published pages.' })
  async getPages(@Headers('authorization') auth: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    await this.authenticate(auth);
    const take = Math.min(parseInt(limit || '10'), 50);
    const skip = ((parseInt(page || '1') - 1) * take);
    const [data, total] = await Promise.all([
      this.prisma.page.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { id: true, title: true, slug: true, excerpt: true, metaTitle: true, metaDescription: true, featuredImage: true, publishedAt: true }, orderBy: { publishedAt: 'desc' }, take, skip }),
      this.prisma.page.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    ]);
    return { success: true, data, pagination: { page: parseInt(page || '1'), limit: take, total, totalPages: Math.ceil(total / take) } };
  }

  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get published page by slug.' })
  async getPage(@Headers('authorization') auth: string, @Param('slug') slug: string) {
    await this.authenticate(auth);
    const page = await this.prisma.page.findUnique({ where: { slug }, select: { id: true, title: true, slug: true, excerpt: true, content: true, metaTitle: true, metaDescription: true, featuredImage: true, publishedAt: true, updatedAt: true } });
    if (!page || (page as any).status === 'DRAFT') return { success: false, message: 'Page not found.' };
    return { success: true, data: page };
  }

  @Get('blogs')
  @ApiOperation({ summary: 'List published blogs.' })
  async getBlogs(@Headers('authorization') auth: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    await this.authenticate(auth);
    const take = Math.min(parseInt(limit || '10'), 50);
    const skip = ((parseInt(page || '1') - 1) * take);
    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { id: true, title: true, slug: true, excerpt: true, metaTitle: true, metaDescription: true, featuredImage: true, publishedAt: true }, orderBy: { publishedAt: 'desc' }, take, skip }),
      this.prisma.blogPost.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    ]);
    return { success: true, data, pagination: { page: parseInt(page || '1'), limit: take, total, totalPages: Math.ceil(total / take) } };
  }

  @Get('blogs/:slug')
  @ApiOperation({ summary: 'Get published blog by slug.' })
  async getBlog(@Headers('authorization') auth: string, @Param('slug') slug: string) {
    await this.authenticate(auth);
    const blog = await this.prisma.blogPost.findUnique({ where: { slug }, select: { id: true, title: true, slug: true, excerpt: true, content: true, metaTitle: true, metaDescription: true, featuredImage: true, publishedAt: true, updatedAt: true } });
    if (!blog) return { success: false, message: 'Blog not found.' };
    return { success: true, data: blog };
  }

  @Get('faqs')
  @ApiOperation({ summary: 'List published FAQs.' })
  async getFaqs(@Headers('authorization') auth: string) {
    await this.authenticate(auth);
    const data = await this.prisma.faq.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { id: true, question: true, answer: true, slug: true, sortOrder: true }, orderBy: { sortOrder: 'asc' }, take: 100 });
    return { success: true, data };
  }
}
