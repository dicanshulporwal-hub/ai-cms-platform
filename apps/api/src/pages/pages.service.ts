import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { ListPagesQueryDto } from './dto/list-pages-query.dto';
import { UpdatePageDto } from './dto/update-page.dto';

const pageInclude = {
  author: {
    select: {
      email: true,
      id: true,
      name: true,
    },
  },
} satisfies Prisma.PageInclude;

type PageWithAuthor = Prisma.PageGetPayload<{ include: typeof pageInclude }>;

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListPagesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.PageWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            title: {
              contains: query.search,
            },
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.page.findMany({
        include: pageInclude,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        where,
      }),
      this.prisma.page.count({ where }),
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
    return this.toResponse(await this.getActivePage(id));
  }

  async create(dto: CreatePageDto, user: AuthenticatedUser) {
    await this.ensureSlugAvailable(dto.slug);

    const page = await this.prisma.page.create({
      data: {
        authorId: user.id,
        content: dto.content,
        excerpt: dto.excerpt,
        featuredImage: dto.featuredImage,
        metaDescription: dto.metaDescription,
        metaTitle: dto.metaTitle,
        slug: dto.slug,
        status: ContentStatus.DRAFT,
        title: dto.title,
      },
      include: pageInclude,
    });

    await this.audit('page.created', page, user, {
      status: page.status,
      title: page.title,
    });

    return this.toResponse(page);
  }

  async update(id: string, dto: UpdatePageDto, user: AuthenticatedUser) {
    const page = await this.getActivePage(id);

    this.ensureCanEdit(page, user);

    if (dto.slug && dto.slug !== page.slug) {
      await this.ensureSlugAvailable(dto.slug, page.id);
    }

    const updatedPage = await this.prisma.page.update({
      data: {
        content: dto.content,
        excerpt: dto.excerpt,
        featuredImage: dto.featuredImage,
        metaDescription: dto.metaDescription,
        metaTitle: dto.metaTitle,
        slug: dto.slug,
        title: dto.title,
      },
      include: pageInclude,
      where: { id },
    });

    await this.audit('page.updated', updatedPage, user, {
      status: updatedPage.status,
      title: updatedPage.title,
    });

    return this.toResponse(updatedPage);
  }

  async remove(id: string, user: AuthenticatedUser) {
    const page = await this.getActivePage(id);
    const deletedPage = await this.prisma.page.update({
      data: {
        deletedAt: new Date(),
        status: ContentStatus.ARCHIVED,
      },
      include: pageInclude,
      where: { id },
    });

    await this.audit('page.deleted', page, user, {
      status: ContentStatus.ARCHIVED,
      title: page.title,
    });

    return this.toResponse(deletedPage);
  }

  async submit(id: string, user: AuthenticatedUser) {
    const page = await this.getActivePage(id);

    if (page.status !== ContentStatus.DRAFT) {
      throw new BadRequestException('Only draft pages can be submitted.');
    }

    const submittedPage = await this.prisma.page.update({
      data: { status: ContentStatus.SUBMITTED },
      include: pageInclude,
      where: { id },
    });

    await this.prisma.workflow.create({
      data: {
        pageId: id,
        status: ContentStatus.SUBMITTED,
        submittedById: user.id,
      },
    });
    await this.audit('page.submitted', submittedPage, user, {
      status: submittedPage.status,
      title: submittedPage.title,
    });

    return this.toResponse(submittedPage);
  }

  async approve(id: string, user: AuthenticatedUser) {
    const page = await this.getActivePage(id);

    if (
      page.status !== ContentStatus.SUBMITTED &&
      page.status !== ContentStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException('Only submitted pages can be approved.');
    }

    const approvedPage = await this.prisma.page.update({
      data: {
        reviewerId: user.id,
        status: ContentStatus.APPROVED,
      },
      include: pageInclude,
      where: { id },
    });

    await this.audit('page.approved', approvedPage, user, {
      status: approvedPage.status,
      title: approvedPage.title,
    });

    return this.toResponse(approvedPage);
  }

  async publish(id: string, user: AuthenticatedUser) {
    const page = await this.getActivePage(id);

    if (page.status !== ContentStatus.APPROVED) {
      throw new BadRequestException('Only approved pages can be published.');
    }

    const publishedPage = await this.prisma.page.update({
      data: {
        publishedAt: new Date(),
        publisherId: user.id,
        status: ContentStatus.PUBLISHED,
      },
      include: pageInclude,
      where: { id },
    });

    await this.audit('page.published', publishedPage, user, {
      publishedAt: publishedPage.publishedAt,
      status: publishedPage.status,
      title: publishedPage.title,
    });

    return this.toResponse(publishedPage);
  }

  private async getActivePage(id: string) {
    const page = await this.prisma.page.findUnique({
      include: pageInclude,
      where: { id },
    });

    if (!page || page.deletedAt) {
      throw new NotFoundException('Page not found.');
    }

    return page;
  }

  private ensureCanEdit(page: PageWithAuthor, user: AuthenticatedUser) {
    if (user.role === 'Super Admin') {
      return;
    }

    if (page.status !== ContentStatus.DRAFT) {
      throw new ForbiddenException('Editors can only edit draft pages.');
    }
  }

  private async ensureSlugAvailable(slug: string, currentPageId?: string) {
    const existingPage = await this.prisma.page.findUnique({
      select: { id: true },
      where: { slug },
    });

    if (existingPage && existingPage.id !== currentPageId) {
      throw new ConflictException('Page slug already exists.');
    }
  }

  private async audit(
    action: string,
    page: Pick<PageWithAuthor, 'id' | 'slug' | 'title'>,
    user: AuthenticatedUser,
    metadata?: Prisma.InputJsonValue,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        entityId: page.id,
        entityType: 'Page',
        metadata,
        pageId: page.id,
        userId: user.id,
      },
    });
  }

  private toResponse(page: PageWithAuthor) {
    return {
      author: page.author,
      authorId: page.authorId,
      content: page.content ?? '',
      createdAt: page.createdAt,
      excerpt: page.excerpt,
      featuredImage: page.featuredImage,
      id: page.id,
      metaDescription: page.metaDescription,
      metaTitle: page.metaTitle,
      publishedAt: page.publishedAt,
      slug: page.slug,
      status: page.status,
      title: page.title,
      updatedAt: page.updatedAt,
    };
  }
}
