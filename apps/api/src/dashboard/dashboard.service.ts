import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';

const SUBMITTED_STATUSES = [
  ContentStatus.SUBMITTED,
  ContentStatus.UNDER_REVIEW,
  ContentStatus.CHANGES_REQUESTED,
];

const PENDING_WORKFLOW_STATUSES = [
  ContentStatus.SUBMITTED,
  ContentStatus.UNDER_REVIEW,
  ContentStatus.APPROVED,
];

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(user: AuthenticatedUser) {
    try {
      const pageWhere = this.getPageWhereForRole(user);
      const blogWhere = this.getBlogWhereForRole(user);
      const isAdmin = this.isAdmin(user);
      const aiWhere = isAdmin ? {} : { userId: user.id };

      const [
        totalPages,
        publishedPages,
        draftPages,
        submittedPages,
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        submittedBlogs,
        totalMedia,
        totalUsers,
        totalAIRequests,
        totalChatbotConversations,
        totalLeads,
        recentActivities,
        recentPages,
        recentBlogs,
        recentLeads,
      ] = await Promise.all([
        this.prisma.page.count({ where: pageWhere }),
        this.prisma.page.count({
          where: { ...pageWhere, status: ContentStatus.PUBLISHED },
        }),
        this.prisma.page.count({
          where: { ...pageWhere, status: ContentStatus.DRAFT },
        }),
        this.prisma.page.count({
          where: { ...pageWhere, status: { in: SUBMITTED_STATUSES } },
        }),
        this.prisma.blogPost.count({ where: blogWhere }),
        this.prisma.blogPost.count({
          where: { ...blogWhere, status: ContentStatus.PUBLISHED },
        }),
        this.prisma.blogPost.count({
          where: { ...blogWhere, status: ContentStatus.DRAFT },
        }),
        this.prisma.blogPost.count({
          where: { ...blogWhere, status: { in: SUBMITTED_STATUSES } },
        }),
        this.prisma.media.count({
          where: isAdmin
            ? { deletedAt: null }
            : { deletedAt: null, uploadedById: user.id },
        }),
        isAdmin ? this.prisma.user.count() : this.zero(),
        this.prisma.aIUsageLog.count({ where: aiWhere }),
        isAdmin ? this.prisma.chatbotConversation.count() : this.zero(),
        isAdmin ? this.prisma.lead.count() : this.zero(),
        this.prisma.auditLog.findMany({
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
          where: isAdmin ? {} : { userId: user.id },
        }),
        this.prisma.page.findMany({
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            slug: true,
            status: true,
            title: true,
            updatedAt: true,
          },
          take: 5,
          where: pageWhere,
        }),
        this.prisma.blogPost.findMany({
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            slug: true,
            status: true,
            title: true,
            updatedAt: true,
          },
          take: 5,
          where: blogWhere,
        }),
        isAdmin
          ? this.prisma.lead.findMany({
              orderBy: { createdAt: 'desc' },
              select: {
                createdAt: true,
                email: true,
                id: true,
                name: true,
                sourcePage: true,
              },
              take: 5,
            })
          : this.emptyLeads(),
      ]);

      const pendingWorkflowItems =
        (await this.prisma.page.count({
          where: { ...pageWhere, status: { in: this.getPendingStatuses(user) } },
        })) +
        (await this.prisma.blogPost.count({
          where: { ...blogWhere, status: { in: this.getPendingStatuses(user) } },
        }));

      return {
        draftBlogs,
        draftPages,
        pendingWorkflowItems,
        publishedBlogs,
        publishedPages,
        recentActivities: recentActivities.map((activity) => ({
          action: activity.action,
          createdAt: activity.createdAt,
          entityId: activity.entityId,
          entityType: activity.entityType,
          id: activity.id,
          userName: activity.user?.name ?? null,
        })),
        recentBlogs,
        recentLeads,
        recentPages,
        scope: this.getScope(user),
        submittedBlogs,
        submittedPages,
        totalAIRequests,
        totalBlogs,
        totalChatbotConversations,
        totalLeads,
        totalMedia,
        totalPages,
        totalUsers,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? 'Dashboard summary could not be loaded.'
          : 'Dashboard summary failed.',
      );
    }
  }

  async getContentStats(user: AuthenticatedUser) {
    const summary = await this.getSummary(user);

    return {
      draftBlogs: summary.draftBlogs,
      draftPages: summary.draftPages,
      pendingWorkflowItems: summary.pendingWorkflowItems,
      publishedBlogs: summary.publishedBlogs,
      publishedPages: summary.publishedPages,
      submittedBlogs: summary.submittedBlogs,
      submittedPages: summary.submittedPages,
      totalBlogs: summary.totalBlogs,
      totalPages: summary.totalPages,
    };
  }

  async getAiStats(user: AuthenticatedUser) {
    const summary = await this.getSummary(user);

    return { totalAIRequests: summary.totalAIRequests };
  }

  async getChatbotStats(user: AuthenticatedUser) {
    const summary = await this.getSummary(user);

    return {
      totalChatbotConversations: summary.totalChatbotConversations,
      totalLeads: summary.totalLeads,
    };
  }

  async getRecentActivity(user: AuthenticatedUser) {
    const summary = await this.getSummary(user);

    return { data: summary.recentActivities };
  }

  private getPageWhereForRole(user: AuthenticatedUser): Prisma.PageWhereInput {
    const base: Prisma.PageWhereInput = { deletedAt: null };

    if (this.isAdmin(user) || user.role === 'Viewer') {
      return base;
    }

    if (user.role === 'Editor') {
      return {
        ...base,
        authorId: user.id,
      };
    }

    if (user.role === 'Reviewer') {
      return {
        ...base,
        status: { in: [ContentStatus.SUBMITTED, ContentStatus.UNDER_REVIEW] },
      };
    }

    if (user.role === 'Publisher') {
      return {
        ...base,
        status: ContentStatus.APPROVED,
      };
    }

    return base;
  }

  private getBlogWhereForRole(user: AuthenticatedUser): Prisma.BlogPostWhereInput {
    const base: Prisma.BlogPostWhereInput = { deletedAt: null };

    if (this.isAdmin(user) || user.role === 'Viewer') {
      return base;
    }

    if (user.role === 'Editor') {
      return {
        ...base,
        authorId: user.id,
      };
    }

    if (user.role === 'Reviewer') {
      return {
        ...base,
        status: { in: [ContentStatus.SUBMITTED, ContentStatus.UNDER_REVIEW] },
      };
    }

    if (user.role === 'Publisher') {
      return {
        ...base,
        status: ContentStatus.APPROVED,
      };
    }

    return base;
  }

  private getPendingStatuses(user: AuthenticatedUser) {
    if (user.role === 'Reviewer') {
      return [ContentStatus.SUBMITTED, ContentStatus.UNDER_REVIEW];
    }

    if (user.role === 'Publisher') {
      return [ContentStatus.APPROVED];
    }

    return PENDING_WORKFLOW_STATUSES;
  }

  private isAdmin(user: AuthenticatedUser) {
    return user.role === 'Super Admin' || user.role === 'Admin';
  }

  private getScope(user: AuthenticatedUser) {
    if (this.isAdmin(user)) {
      return 'system';
    }

    if (user.role === 'Editor') {
      return 'own_content';
    }

    if (user.role === 'Reviewer') {
      return 'review_queue';
    }

    if (user.role === 'Publisher') {
      return 'publish_queue';
    }

    return 'read_only';
  }

  private zero() {
    return Promise.resolve(0);
  }

  private emptyLeads() {
    return Promise.resolve([]);
  }
}
