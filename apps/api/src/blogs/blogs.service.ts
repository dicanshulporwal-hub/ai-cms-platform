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
import { WorkflowService } from '../workflow/workflow.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { ListBlogsQueryDto } from './dto/list-blogs-query.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

const blogInclude = {
  author: {
    select: {
      email: true,
      id: true,
      name: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  tags: {
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: {
      name: 'asc',
    },
  },
} satisfies Prisma.BlogPostInclude;

type BlogWithRelations = Prisma.BlogPostGetPayload<{
  include: typeof blogInclude;
}>;

@Injectable()
export class BlogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
  ) {}

  async findAll(query: ListBlogsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.BlogPostWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            title: {
              contains: query.search,
            },
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.tagId
        ? {
            tags: {
              some: {
                deletedAt: null,
                id: query.tagId,
              },
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        include: blogInclude,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        where,
      }),
      this.prisma.blogPost.count({ where }),
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
    return this.toResponse(await this.getActiveBlog(id));
  }

  async create(dto: CreateBlogDto, user: AuthenticatedUser) {
    await this.ensureSlugAvailable(dto.slug);
    await this.ensureCategoryExists(dto.categoryId);
    const tagIds = await this.ensureTagsExist(dto.tagIds);

    const blog = await this.prisma.blogPost.create({
      data: {
        author: { connect: { id: user.id } },
        category: dto.categoryId
          ? { connect: { id: dto.categoryId } }
          : undefined,
        content: dto.content,
        excerpt: dto.excerpt,
        featuredImage: dto.featuredImage,
        metaDescription: dto.metaDescription,
        metaTitle: dto.metaTitle,
        slug: dto.slug,
        status: ContentStatus.DRAFT,
        tags: tagIds.length
          ? { connect: tagIds.map((id) => ({ id })) }
          : undefined,
        title: dto.title,
      },
      include: blogInclude,
    });

    await this.audit('blog.created', blog, user, {
      status: blog.status,
      title: blog.title,
    });

    return this.toResponse(blog);
  }

  async update(id: string, dto: UpdateBlogDto, user: AuthenticatedUser) {
    const blog = await this.getActiveBlog(id);

    this.ensureCanEdit(blog, user);

    if (dto.slug && dto.slug !== blog.slug) {
      await this.ensureSlugAvailable(dto.slug, blog.id);
    }

    if (dto.categoryId !== undefined) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const tagIds =
      dto.tagIds === undefined ? undefined : await this.ensureTagsExist(dto.tagIds);

    const data: Prisma.BlogPostUpdateInput = {
      content: dto.content,
      excerpt: dto.excerpt,
      featuredImage: dto.featuredImage,
      metaDescription: dto.metaDescription,
      metaTitle: dto.metaTitle,
      slug: dto.slug,
      title: dto.title,
    };

    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }

    if (tagIds !== undefined) {
      data.tags = {
        set: tagIds.map((tagId) => ({ id: tagId })),
      };
    }

    const updatedBlog = await this.prisma.blogPost.update({
      data,
      include: blogInclude,
      where: { id },
    });

    await this.audit('blog.updated', updatedBlog, user, {
      status: updatedBlog.status,
      title: updatedBlog.title,
    });

    return this.toResponse(updatedBlog);
  }

  async remove(id: string, user: AuthenticatedUser) {
    const blog = await this.getActiveBlog(id);
    const deletedBlog = await this.prisma.blogPost.update({
      data: {
        deletedAt: new Date(),
        status: ContentStatus.ARCHIVED,
      },
      include: blogInclude,
      where: { id },
    });

    await this.audit('blog.deleted', blog, user, {
      status: ContentStatus.ARCHIVED,
      title: blog.title,
    });

    return this.toResponse(deletedBlog);
  }

  async submit(id: string, user: AuthenticatedUser) {
    return this.workflowService.submitBlog(id, user);
  }

  async approve(id: string, user: AuthenticatedUser) {
    return this.workflowService.approveBlog(id, user);
  }

  async publish(id: string, user: AuthenticatedUser) {
    return this.workflowService.publishBlog(id, user);
  }

  private async getActiveBlog(id: string) {
    const blog = await this.prisma.blogPost.findUnique({
      include: blogInclude,
      where: { id },
    });

    if (!blog || blog.deletedAt) {
      throw new NotFoundException('Blog not found.');
    }

    return blog;
  }

  private ensureCanEdit(blog: BlogWithRelations, user: AuthenticatedUser) {
    if (user.role === 'Super Admin') {
      return;
    }

    if (
      blog.status !== ContentStatus.DRAFT &&
      blog.status !== ContentStatus.CHANGES_REQUESTED
    ) {
      throw new ForbiddenException(
        'Editors can only edit draft or changes requested blogs.',
      );
    }
  }

  private async ensureSlugAvailable(slug: string, currentBlogId?: string) {
    const existingBlog = await this.prisma.blogPost.findUnique({
      select: { id: true },
      where: { slug },
    });

    if (existingBlog && existingBlog.id !== currentBlogId) {
      throw new ConflictException('Blog slug already exists.');
    }
  }

  private async ensureCategoryExists(categoryId?: string | null) {
    if (!categoryId) {
      return;
    }

    const category = await this.prisma.category.findFirst({
      select: { id: true },
      where: {
        deletedAt: null,
        id: categoryId,
      },
    });

    if (!category) {
      throw new BadRequestException('Category not found.');
    }
  }

  private async ensureTagsExist(tagIds?: string[]) {
    const uniqueTagIds = [...new Set(tagIds ?? [])].filter(Boolean);

    if (!uniqueTagIds.length) {
      return [];
    }

    const tags = await this.prisma.tag.findMany({
      select: { id: true },
      where: {
        deletedAt: null,
        id: { in: uniqueTagIds },
      },
    });

    if (tags.length !== uniqueTagIds.length) {
      throw new BadRequestException('One or more tags were not found.');
    }

    return uniqueTagIds;
  }

  private async audit(
    action: string,
    blog: Pick<BlogWithRelations, 'id' | 'slug' | 'title'>,
    user: AuthenticatedUser,
    metadata?: Prisma.InputJsonValue,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        blogPostId: blog.id,
        entityId: blog.id,
        entityType: 'BlogPost',
        metadata,
        userId: user.id,
      },
    });
  }

  private toResponse(blog: BlogWithRelations) {
    return {
      author: blog.author,
      authorId: blog.authorId,
      category: blog.category,
      categoryId: blog.categoryId,
      content: blog.content ?? '',
      createdAt: blog.createdAt,
      excerpt: blog.excerpt,
      featuredImage: blog.featuredImage,
      id: blog.id,
      metaDescription: blog.metaDescription,
      metaTitle: blog.metaTitle,
      publishedAt: blog.publishedAt,
      slug: blog.slug,
      status: blog.status,
      tags: blog.tags,
      title: blog.title,
      updatedAt: blog.updatedAt,
    };
  }
}
