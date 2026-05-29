import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Public Blogs')
@Controller('public/blogs')
export class PublicBlogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List published blog posts.' })
  async findAll(@Query() query: { page?: string; limit?: string }) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '10', 10) || 10));

    const where = { status: 'PUBLISHED' as const, deletedAt: null };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          status: true,
          metaTitle: true,
          metaDescription: true,
          publishedAt: true,
          category: { select: { id: true, name: true, slug: true } },
          tags: {
            where: { deletedAt: null },
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { data, total };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get published blog post by slug.' })
  async findBySlug(@Param('slug') slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        featuredImage: true,
        status: true,
        metaTitle: true,
        metaDescription: true,
        publishedAt: true,
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          where: { deletedAt: null },
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!post) return { error: 'Blog post not found.', statusCode: 404 };
    return post;
  }
}
