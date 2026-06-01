import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Public Pages')
@Controller('public/pages')
export class PublicPagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get a published page by slug (public, no auth).' })
  async getBySlug(@Param('slug') slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
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
      },
    });

    if (!page || page.status !== 'PUBLISHED') {
      throw new NotFoundException('Page not found.');
    }

    return page;
  }
}
