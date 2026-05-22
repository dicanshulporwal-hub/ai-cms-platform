import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, ContentType, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowActionDto } from './dto/workflow-action.dto';

const contentReadInclude = {
  author: {
    select: {
      email: true,
      id: true,
      name: true,
    },
  },
} satisfies Prisma.PageInclude;

const blogReadInclude = {
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

const historyInclude = {
  performedBy: {
    select: {
      email: true,
      id: true,
      name: true,
    },
  },
} satisfies Prisma.WorkflowHistoryInclude;

type WorkflowContentType = 'PAGE' | 'BLOG';
type WorkflowAction =
  | 'approve'
  | 'publish'
  | 'request-changes'
  | 'start-review'
  | 'submit';

type PageWithAuthor = Prisma.PageGetPayload<{ include: typeof contentReadInclude }>;
type BlogWithRelations = Prisma.BlogPostGetPayload<{ include: typeof blogReadInclude }>;

@Injectable()
export class WorkflowService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  async history(contentType: WorkflowContentType, contentId: string) {
    if (contentType !== 'PAGE' && contentType !== 'BLOG') {
      throw new BadRequestException('contentType must be PAGE or BLOG.');
    }

    if (contentType === 'PAGE') {
      await this.getActivePage(contentId);
    } else {
      await this.getActiveBlog(contentId);
    }

    const history = await this.prisma.workflowHistory.findMany({
      include: historyInclude,
      orderBy: { createdAt: 'asc' },
      where: {
        contentId,
        contentType: contentType as ContentType,
      },
    });

    return history.map((item) => ({
      action: item.action,
      comment: item.comment,
      contentId: item.contentId,
      contentType: item.contentType,
      createdAt: item.createdAt,
      fromStatus: item.fromStatus,
      id: item.id,
      performedBy: item.performedBy,
      performedById: item.performedById,
      toStatus: item.toStatus,
    }));
  }

  submitPage(id: string, user: AuthenticatedUser, dto: WorkflowActionDto = {}) {
    return this.runPageAction(id, user, 'submit', dto);
  }

  startPageReview(
    id: string,
    user: AuthenticatedUser,
    dto: WorkflowActionDto = {},
  ) {
    return this.runPageAction(id, user, 'start-review', dto);
  }

  requestPageChanges(id: string, user: AuthenticatedUser, dto: WorkflowActionDto) {
    return this.runPageAction(id, user, 'request-changes', dto);
  }

  approvePage(id: string, user: AuthenticatedUser, dto: WorkflowActionDto = {}) {
    return this.runPageAction(id, user, 'approve', dto);
  }

  publishPage(id: string, user: AuthenticatedUser, dto: WorkflowActionDto = {}) {
    return this.runPageAction(id, user, 'publish', dto);
  }

  submitBlog(id: string, user: AuthenticatedUser, dto: WorkflowActionDto = {}) {
    return this.runBlogAction(id, user, 'submit', dto);
  }

  startBlogReview(
    id: string,
    user: AuthenticatedUser,
    dto: WorkflowActionDto = {},
  ) {
    return this.runBlogAction(id, user, 'start-review', dto);
  }

  requestBlogChanges(id: string, user: AuthenticatedUser, dto: WorkflowActionDto) {
    return this.runBlogAction(id, user, 'request-changes', dto);
  }

  approveBlog(id: string, user: AuthenticatedUser, dto: WorkflowActionDto = {}) {
    return this.runBlogAction(id, user, 'approve', dto);
  }

  publishBlog(id: string, user: AuthenticatedUser, dto: WorkflowActionDto = {}) {
    return this.runBlogAction(id, user, 'publish', dto);
  }

  private async runPageAction(
    id: string,
    user: AuthenticatedUser,
    action: WorkflowAction,
    dto: WorkflowActionDto,
  ) {
    const page = await this.getActivePage(id);
    const transition = this.getTransition('PAGE', action, page.status, user, dto);

    const updatedPage = await this.prisma.$transaction(async (tx) => {
      const nextPage = await tx.page.update({
        data: {
          ...(action === 'approve' ? { reviewerId: user.id } : {}),
          ...(action === 'publish'
            ? { publishedAt: new Date(), publisherId: user.id }
            : {}),
          status: transition.toStatus,
        },
        include: contentReadInclude,
        where: { id },
      });

      await this.createWorkflowRecords(tx, {
        action: transition.auditAction,
        comment: transition.comment,
        contentId: page.id,
        contentType: ContentType.PAGE,
        entityType: 'Page',
        fromStatus: page.status,
        metadata: {
          comment: transition.comment,
          fromStatus: page.status,
          title: page.title,
          toStatus: transition.toStatus,
        },
        pageId: page.id,
        performedById: user.id,
        toStatus: transition.toStatus,
        userId: user.id,
      });

      return nextPage;
    });

    await this.sendNotifications('PAGE', action, updatedPage, user);

    return this.toPageResponse(updatedPage);
  }

  private async runBlogAction(
    id: string,
    user: AuthenticatedUser,
    action: WorkflowAction,
    dto: WorkflowActionDto,
  ) {
    const blog = await this.getActiveBlog(id);
    const transition = this.getTransition('BLOG', action, blog.status, user, dto);

    const updatedBlog = await this.prisma.$transaction(async (tx) => {
      const nextBlog = await tx.blogPost.update({
        data: {
          ...(action === 'approve' ? { reviewerId: user.id } : {}),
          ...(action === 'publish'
            ? { publishedAt: new Date(), publisherId: user.id }
            : {}),
          status: transition.toStatus,
        },
        include: blogReadInclude,
        where: { id },
      });

      await this.createWorkflowRecords(tx, {
        action: transition.auditAction,
        blogPostId: blog.id,
        comment: transition.comment,
        contentId: blog.id,
        contentType: ContentType.BLOG,
        entityType: 'BlogPost',
        fromStatus: blog.status,
        metadata: {
          comment: transition.comment,
          fromStatus: blog.status,
          title: blog.title,
          toStatus: transition.toStatus,
        },
        performedById: user.id,
        toStatus: transition.toStatus,
        userId: user.id,
      });

      return nextBlog;
    });

    await this.sendNotifications('BLOG', action, updatedBlog, user);

    return this.toBlogResponse(updatedBlog);
  }

  private getTransition(
    contentType: WorkflowContentType,
    action: WorkflowAction,
    currentStatus: ContentStatus,
    user: AuthenticatedUser,
    dto: WorkflowActionDto,
  ) {
    const label = contentType === 'PAGE' ? 'page' : 'blog';
    const comment = dto.comment?.trim() || null;

    if (action === 'submit') {
      this.ensureRole(user, ['Editor', 'Super Admin']);

      if (
        currentStatus !== ContentStatus.DRAFT &&
        currentStatus !== ContentStatus.CHANGES_REQUESTED
      ) {
        throw new BadRequestException(`Only draft or changes requested ${label}s can be submitted.`);
      }

      return {
        auditAction: `${label}.submitted`,
        comment,
        toStatus: ContentStatus.SUBMITTED,
      };
    }

    if (action === 'start-review') {
      this.ensureRole(user, ['Reviewer', 'Super Admin']);

      if (currentStatus !== ContentStatus.SUBMITTED) {
        throw new BadRequestException(`Only submitted ${label}s can be marked under review.`);
      }

      return {
        auditAction: `${label}.review_started`,
        comment,
        toStatus: ContentStatus.UNDER_REVIEW,
      };
    }

    if (action === 'request-changes') {
      this.ensureRole(user, ['Reviewer', 'Super Admin']);

      if (!comment) {
        throw new BadRequestException('Comment is required when requesting changes.');
      }

      if (
        currentStatus !== ContentStatus.SUBMITTED &&
        currentStatus !== ContentStatus.UNDER_REVIEW
      ) {
        throw new BadRequestException(`Only submitted or under review ${label}s can have changes requested.`);
      }

      return {
        auditAction: `${label}.changes_requested`,
        comment,
        toStatus: ContentStatus.CHANGES_REQUESTED,
      };
    }

    if (action === 'approve') {
      this.ensureRole(user, ['Reviewer', 'Super Admin']);

      if (
        currentStatus !== ContentStatus.SUBMITTED &&
        currentStatus !== ContentStatus.UNDER_REVIEW
      ) {
        throw new BadRequestException(`Only submitted or under review ${label}s can be approved.`);
      }

      return {
        auditAction: `${label}.approved`,
        comment,
        toStatus: ContentStatus.APPROVED,
      };
    }

    this.ensureRole(user, ['Publisher', 'Super Admin']);

    if (currentStatus !== ContentStatus.APPROVED) {
      throw new BadRequestException(`Only approved ${label}s can be published.`);
    }

    return {
      auditAction: `${label}.published`,
      comment,
      toStatus: ContentStatus.PUBLISHED,
    };
  }

  private async getActivePage(id: string) {
    const page = await this.prisma.page.findUnique({
      include: contentReadInclude,
      where: { id },
    });

    if (!page || page.deletedAt) {
      throw new NotFoundException('Page not found.');
    }

    return page;
  }

  private async getActiveBlog(id: string) {
    const blog = await this.prisma.blogPost.findUnique({
      include: blogReadInclude,
      where: { id },
    });

    if (!blog || blog.deletedAt) {
      throw new NotFoundException('Blog not found.');
    }

    return blog;
  }

  private ensureRole(user: AuthenticatedUser, roles: string[]) {
    if (!roles.includes(user.role)) {
      throw new ForbiddenException('Forbidden access.');
    }
  }

  private async createWorkflowRecords(
    tx: Prisma.TransactionClient,
    input: {
      action: string;
      blogPostId?: string;
      comment?: string | null;
      contentId: string;
      contentType: ContentType;
      entityType: string;
      fromStatus: ContentStatus;
      metadata: Prisma.InputJsonValue;
      pageId?: string;
      performedById: string;
      toStatus: ContentStatus;
      userId: string;
    },
  ) {
    await tx.workflowHistory.create({
      data: {
        action: input.action,
        comment: input.comment,
        contentId: input.contentId,
        contentType: input.contentType,
        fromStatus: input.fromStatus,
        performedById: input.performedById,
        toStatus: input.toStatus,
      },
    });

    await tx.auditLog.create({
      data: {
        action: input.action,
        blogPostId: input.blogPostId,
        entityId: input.contentId,
        entityType: input.entityType,
        metadata: input.metadata,
        pageId: input.pageId,
        userId: input.userId,
      },
    });
  }

  private async sendNotifications(
    contentType: WorkflowContentType,
    action: WorkflowAction,
    content: PageWithAuthor | BlogWithRelations,
    user: AuthenticatedUser,
  ) {
    const entityType = contentType;
    const label = contentType === 'PAGE' ? 'page' : 'blog';
    const title = 'title' in content ? content.title : 'Content';

    if (action === 'submit') {
      const reviewers = await this.notificationsService.usersWithRoles(
        ['Reviewer', 'Super Admin'],
        [user.id],
      );

      await this.notificationsService.notifyUsers(
        reviewers.map((reviewer) => ({
          entityId: content.id,
          entityType,
          message: `${user.name} submitted ${label} "${title}" for review.`,
          title: `${label === 'page' ? 'Page' : 'Blog'} submitted`,
          userId: reviewer.id,
        })),
      );
      return;
    }

    if (action === 'request-changes') {
      if (content.authorId && content.authorId !== user.id) {
        await this.notificationsService.notifyUsers([
          {
            entityId: content.id,
            entityType,
            message: `${user.name} requested changes on ${label} "${title}".`,
            title: 'Changes requested',
            userId: content.authorId,
          },
        ]);
      }
      return;
    }

    if (action === 'approve') {
      const publishers = await this.notificationsService.usersWithRoles(
        ['Publisher', 'Super Admin'],
        [user.id],
      );

      await this.notificationsService.notifyUsers(
        publishers.map((publisher) => ({
          entityId: content.id,
          entityType,
          message: `${user.name} approved ${label} "${title}" for publishing.`,
          title: `${label === 'page' ? 'Page' : 'Blog'} approved`,
          userId: publisher.id,
        })),
      );
      return;
    }

    if (action === 'publish' && content.authorId && content.authorId !== user.id) {
      await this.notificationsService.notifyUsers([
        {
          entityId: content.id,
          entityType,
          message: `${user.name} published ${label} "${title}".`,
          title: `${label === 'page' ? 'Page' : 'Blog'} published`,
          userId: content.authorId,
        },
      ]);
    }
  }

  private toPageResponse(page: PageWithAuthor) {
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

  private toBlogResponse(blog: BlogWithRelations) {
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
