import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSocialAccountDto,
  CreateSocialPostDto,
  SocialAccountQueryDto,
  SocialPostQueryDto,
  UpdateSocialAccountDto,
  UpdateSocialPostDto,
  UpdateSocialSettingsDto,
} from './dto/social-media.dto';

const SETTINGS_ID = 'default_social_settings';

const accountSelect = {
  id: true,
  platformKey: true,
  accountName: true,
  accountHandle: true,
  accountIdExternal: true,
  profileUrl: true,
  profileImageUrl: true,
  status: true,
  connectionType: true,
  connectedById: true,
  lastConnectedAt: true,
  lastUsedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SocialAccountSelect;

const postSelect = {
  id: true,
  sourceType: true,
  sourceId: true,
  title: true,
  content: true,
  linkUrl: true,
  mediaIdsJson: true,
  hashtagsJson: true,
  status: true,
  createdById: true,
  approvedById: true,
  scheduledAt: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  targets: {
    select: {
      id: true,
      platformKey: true,
      platformCaption: true,
      status: true,
      externalPostUrl: true,
      errorMessage: true,
      attemptCount: true,
      publishedAt: true,
      socialAccount: {
        select: {
          id: true,
          accountName: true,
          accountHandle: true,
          platformKey: true,
          status: true,
        },
      },
    },
  },
} satisfies Prisma.SocialPostSelect;

@Injectable()
export class SocialMediaService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [accounts, connectedAccounts, posts, draftPosts, queuedPosts, publishedPosts, failedTargets, settings] =
      await Promise.all([
        this.prisma.socialAccount.count({ where: { deletedAt: null } }),
        this.prisma.socialAccount.count({ where: { deletedAt: null, status: 'SOCIAL_CONNECTED' } }),
        this.prisma.socialPost.count({ where: { deletedAt: null } }),
        this.prisma.socialPost.count({ where: { deletedAt: null, status: 'SOCIAL_POST_DRAFT' } }),
        this.prisma.socialPost.count({ where: { deletedAt: null, status: 'SOCIAL_POST_QUEUED' } }),
        this.prisma.socialPost.count({ where: { deletedAt: null, status: 'SOCIAL_POST_PUBLISHED' } }),
        this.prisma.socialPostTarget.count({ where: { status: 'TARGET_FAILED' } }),
        this.getSettings(),
      ]);

    return {
      accounts,
      connectedAccounts,
      posts,
      draftPosts,
      queuedPosts,
      publishedPosts,
      failedTargets,
      settings,
    };
  }

  async listAccounts(query: SocialAccountQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;
    const where: Prisma.SocialAccountWhereInput = { deletedAt: null };

    if (query.platformKey) where.platformKey = query.platformKey.toLowerCase();
    if (query.status) where.status = query.status as any;
    if (query.search) {
      where.OR = [
        { accountName: { contains: query.search } },
        { accountHandle: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.socialAccount.findMany({
        where,
        select: accountSelect,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.socialAccount.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getAccount(id: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id, deletedAt: null },
      select: accountSelect,
    });
    if (!account) throw new NotFoundException('Social account not found.');
    return account;
  }

  async createAccount(dto: CreateSocialAccountDto, userId: string) {
    const account = await this.prisma.socialAccount.create({
      data: {
        platformKey: dto.platformKey.trim().toLowerCase(),
        accountName: dto.accountName.trim(),
        accountHandle: this.nullable(dto.accountHandle),
        accountIdExternal: this.nullable(dto.accountIdExternal),
        profileUrl: this.nullable(dto.profileUrl),
        profileImageUrl: this.nullable(dto.profileImageUrl),
        status: dto.status as any,
        connectedById: userId,
        connectionType: 'MANUAL_TOKEN',
        lastConnectedAt: new Date(),
      },
      select: accountSelect,
    });
    await this.writeAudit('social_account.created', account.id, userId, {
      platformKey: account.platformKey,
      accountName: account.accountName,
    });
    return account;
  }

  async updateAccount(id: string, dto: UpdateSocialAccountDto, userId: string) {
    await this.ensureAccount(id);
    const account = await this.prisma.socialAccount.update({
      where: { id },
      data: this.cleanAccountData(dto),
      select: accountSelect,
    });
    await this.writeAudit('social_account.updated', account.id, userId, {
      platformKey: account.platformKey,
      accountName: account.accountName,
    });
    return account;
  }

  async deleteAccount(id: string, userId: string) {
    const existing = await this.ensureAccount(id);
    const inUse = await this.prisma.socialPostTarget.count({
      where: {
        socialAccountId: id,
        socialPost: { deletedAt: null },
        status: { in: ['TARGET_PENDING', 'TARGET_QUEUED', 'TARGET_PUBLISHING', 'TARGET_RETRY_SCHEDULED'] },
      },
    });
    if (inUse > 0) throw new BadRequestException('Account is used by pending social posts.');

    const account = await this.prisma.socialAccount.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'SOCIAL_DISABLED' },
      select: accountSelect,
    });
    await this.writeAudit('social_account.deleted', account.id, userId, {
      platformKey: existing.platformKey,
      accountName: existing.accountName,
    });
    return account;
  }

  async listPosts(query: SocialPostQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;
    const where: Prisma.SocialPostWhereInput = { deletedAt: null };

    if (query.status) where.status = query.status as any;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { content: { contains: query.search } },
      ];
    }
    if (query.platformKey) {
      where.targets = { some: { platformKey: query.platformKey.toLowerCase() } };
    }

    const [data, total] = await Promise.all([
      this.prisma.socialPost.findMany({
        where,
        select: postSelect,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.socialPost.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getPost(id: string) {
    const post = await this.prisma.socialPost.findFirst({
      where: { id, deletedAt: null },
      select: postSelect,
    });
    if (!post) throw new NotFoundException('Social post not found.');
    return post;
  }

  async createPost(dto: CreateSocialPostDto, userId: string) {
    const accounts = await this.getUsableAccounts(dto.accountIds ?? []);
    const post = await this.prisma.socialPost.create({
      data: {
        title: dto.title.trim(),
        content: dto.content.trim(),
        sourceType: this.nullable(dto.sourceType),
        sourceId: this.nullable(dto.sourceId),
        linkUrl: this.nullable(dto.linkUrl),
        mediaIdsJson: (dto.mediaIds ?? []) as Prisma.InputJsonValue,
        hashtagsJson: (dto.hashtags ?? []) as Prisma.InputJsonValue,
        createdById: userId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        targets: {
          create: accounts.map((account) => ({
            socialAccountId: account.id,
            platformKey: account.platformKey,
            platformCaption: dto.content.trim(),
            status: dto.scheduledAt ? 'TARGET_QUEUED' : 'TARGET_PENDING',
          })),
        },
        status: dto.scheduledAt ? 'SOCIAL_POST_QUEUED' : 'SOCIAL_POST_DRAFT',
      },
      select: postSelect,
    });
    await this.writeAudit('social_post.created', post.id, userId, { title: post.title });
    return post;
  }

  async updatePost(id: string, dto: UpdateSocialPostDto, userId: string) {
    const existing = await this.ensurePost(id);
    if (existing.status === 'SOCIAL_POST_PUBLISHED') {
      throw new BadRequestException('Published social posts cannot be edited.');
    }

    const accounts = dto.accountIds ? await this.getUsableAccounts(dto.accountIds) : null;
    const post = await this.prisma.$transaction(async (tx) => {
      if (accounts) {
        await tx.socialPostTarget.deleteMany({ where: { socialPostId: id } });
      }

      return tx.socialPost.update({
        where: { id },
        data: {
          title: dto.title?.trim(),
          content: dto.content?.trim(),
          sourceType: dto.sourceType === undefined ? undefined : this.nullable(dto.sourceType),
          sourceId: dto.sourceId === undefined ? undefined : this.nullable(dto.sourceId),
          linkUrl: dto.linkUrl === undefined ? undefined : this.nullable(dto.linkUrl),
          mediaIdsJson: dto.mediaIds === undefined ? undefined : (dto.mediaIds as Prisma.InputJsonValue),
          hashtagsJson: dto.hashtags === undefined ? undefined : (dto.hashtags as Prisma.InputJsonValue),
          scheduledAt: dto.scheduledAt === undefined ? undefined : dto.scheduledAt ? new Date(dto.scheduledAt) : null,
          targets: accounts
            ? {
                create: accounts.map((account) => ({
                  socialAccountId: account.id,
                  platformKey: account.platformKey,
                  platformCaption: dto.content?.trim() ?? existing.content,
                  status: dto.scheduledAt ? 'TARGET_QUEUED' : 'TARGET_PENDING',
                })),
              }
            : undefined,
        },
        select: postSelect,
      });
    });
    await this.writeAudit('social_post.updated', post.id, userId, { title: post.title });
    return post;
  }

  async deletePost(id: string, userId: string) {
    const existing = await this.ensurePost(id);
    const post = await this.prisma.socialPost.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'SOCIAL_POST_CANCELLED' },
      select: postSelect,
    });
    await this.writeAudit('social_post.deleted', post.id, userId, { title: existing.title });
    return post;
  }

  async submitPost(id: string, userId: string) {
    const post = await this.ensurePost(id);
    if (post.status !== 'SOCIAL_POST_DRAFT') {
      throw new BadRequestException('Only draft social posts can be submitted.');
    }
    const settings = await this.getSettings();
    const status = settings.requireApprovalBeforeSocialPost
      ? 'SOCIAL_POST_PENDING_APPROVAL'
      : 'SOCIAL_POST_APPROVED';
    return this.transitionPost(id, status, userId, 'social_post.submitted');
  }

  async approvePost(id: string, userId: string) {
    const post = await this.ensurePost(id);
    if (!['SOCIAL_POST_PENDING_APPROVAL', 'SOCIAL_POST_DRAFT'].includes(post.status)) {
      throw new BadRequestException('Only pending social posts can be approved.');
    }
    const updated = await this.prisma.socialPost.update({
      where: { id },
      data: { status: 'SOCIAL_POST_APPROVED', approvedById: userId },
      select: postSelect,
    });
    await this.writeAudit('social_post.approved', updated.id, userId, { title: updated.title });
    return updated;
  }

  async queuePost(id: string, userId: string) {
    const post = await this.ensurePost(id);
    if (!['SOCIAL_POST_APPROVED', 'SOCIAL_POST_DRAFT'].includes(post.status)) {
      throw new BadRequestException('Only draft or approved social posts can be queued.');
    }
    await this.prisma.socialPostTarget.updateMany({
      where: { socialPostId: id, status: 'TARGET_PENDING' },
      data: { status: 'TARGET_QUEUED' },
    });
    return this.transitionPost(id, 'SOCIAL_POST_QUEUED', userId, 'social_post.queued');
  }

  async publishPost(id: string, userId: string) {
    const post = await this.prisma.socialPost.findFirst({
      where: { id, deletedAt: null },
      include: {
        targets: {
          include: {
            socialAccount: {
              select: { id: true, platformKey: true, accountName: true, status: true, profileUrl: true },
            },
          },
        },
      },
    });
    if (!post) throw new NotFoundException('Social post not found.');
    if (!['SOCIAL_POST_APPROVED', 'SOCIAL_POST_QUEUED'].includes(post.status)) {
      throw new BadRequestException('Only approved or queued social posts can be published.');
    }
    if (post.targets.length === 0) {
      throw new BadRequestException('Add at least one social account before publishing.');
    }

    await this.prisma.socialPost.update({
      where: { id },
      data: { status: 'SOCIAL_POST_PUBLISHING' },
    });

    let published = 0;
    let failed = 0;
    for (const target of post.targets) {
      const isConnected = target.socialAccount.status === 'SOCIAL_CONNECTED';
      const status = isConnected ? 'TARGET_PUBLISHED' : 'TARGET_FAILED';
      const errorMessage = isConnected ? null : 'Social account is not connected.';
      const publishedAt = isConnected ? new Date() : null;
      const externalPostUrl = isConnected
        ? target.socialAccount.profileUrl || post.linkUrl || null
        : null;

      await this.prisma.socialPostTarget.update({
        where: { id: target.id },
        data: {
          status,
          attemptCount: { increment: 1 },
          lastAttemptAt: new Date(),
          publishedAt,
          externalPostUrl,
          errorMessage,
        },
      });
      await this.prisma.socialPublishLog.create({
        data: {
          socialPostTargetId: target.id,
          socialAccountId: target.socialAccountId,
          platformKey: target.platformKey,
          status: isConnected ? 'SIMULATED_PUBLISHED' : 'FAILED',
          statusCode: isConnected ? 200 : 503,
          errorMessage,
          responsePreview: isConnected
            ? 'MVP simulated publish. No external social network call was made.'
            : null,
        },
      });
      if (isConnected) published++;
      else failed++;
    }

    const finalStatus =
      published > 0 && failed > 0
        ? 'SOCIAL_POST_PARTIALLY_PUBLISHED'
        : published > 0
          ? 'SOCIAL_POST_PUBLISHED'
          : 'SOCIAL_POST_FAILED';

    const updated = await this.prisma.socialPost.update({
      where: { id },
      data: { status: finalStatus, publishedAt: published > 0 ? new Date() : null },
      select: postSelect,
    });
    await this.writeAudit('social_post.published', updated.id, userId, {
      title: updated.title,
      published,
      failed,
    });
    return updated;
  }

  async cancelPost(id: string, userId: string) {
    const post = await this.ensurePost(id);
    if (post.status === 'SOCIAL_POST_PUBLISHED') {
      throw new BadRequestException('Published social posts cannot be cancelled.');
    }
    await this.prisma.socialPostTarget.updateMany({
      where: { socialPostId: id, status: { not: 'TARGET_PUBLISHED' } },
      data: { status: 'TARGET_CANCELLED' },
    });
    return this.transitionPost(id, 'SOCIAL_POST_CANCELLED', userId, 'social_post.cancelled');
  }

  async getSettings() {
    return this.prisma.socialSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        defaultHashtagsJson: [],
        defaultUtmJson: {},
      },
      update: {},
    });
  }

  async updateSettings(dto: UpdateSocialSettingsDto, userId: string) {
    const settings = await this.prisma.socialSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        ...this.cleanSettingsData(dto),
      },
      update: this.cleanSettingsData(dto),
    });
    await this.writeAudit('social_settings.updated', settings.id, userId, {});
    return settings;
  }

  private async transitionPost(id: string, status: string, userId: string, action: string) {
    const updated = await this.prisma.socialPost.update({
      where: { id },
      data: { status: status as any },
      select: postSelect,
    });
    await this.writeAudit(action, updated.id, userId, { title: updated.title, status });
    return updated;
  }

  private cleanAccountData(dto: CreateSocialAccountDto | UpdateSocialAccountDto) {
    return {
      platformKey: dto.platformKey?.toLowerCase(),
      accountName: dto.accountName?.trim(),
      accountHandle: dto.accountHandle === undefined ? undefined : this.nullable(dto.accountHandle),
      accountIdExternal:
        dto.accountIdExternal === undefined ? undefined : this.nullable(dto.accountIdExternal),
      profileUrl: dto.profileUrl === undefined ? undefined : this.nullable(dto.profileUrl),
      profileImageUrl:
        dto.profileImageUrl === undefined ? undefined : this.nullable(dto.profileImageUrl),
      status: dto.status as any,
    };
  }

  private cleanSettingsData(dto: UpdateSocialSettingsDto) {
    return {
      isEnabled: dto.isEnabled,
      autoPostBlogsEnabled: dto.autoPostBlogsEnabled,
      autoPostNewsroomEnabled: dto.autoPostNewsroomEnabled,
      autoPostAnnouncementsEnabled: dto.autoPostAnnouncementsEnabled,
      requireApprovalBeforeSocialPost: dto.requireApprovalBeforeSocialPost,
      defaultHashtagsJson:
        dto.defaultHashtags === undefined ? undefined : (dto.defaultHashtags as Prisma.InputJsonValue),
      maxRetries: dto.maxRetries,
      retryBackoffSeconds: dto.retryBackoffSeconds,
    };
  }

  private async getUsableAccounts(accountIds: string[]) {
    if (accountIds.length === 0) return [];
    const accounts = await this.prisma.socialAccount.findMany({
      where: {
        id: { in: accountIds },
        deletedAt: null,
        status: { not: 'SOCIAL_DISABLED' },
      },
      select: { id: true, platformKey: true, status: true },
      take: Math.min(accountIds.length, 20),
    });
    if (accounts.length !== accountIds.length) {
      throw new BadRequestException('One or more social accounts are unavailable.');
    }
    return accounts;
  }

  private async ensureAccount(id: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, platformKey: true, accountName: true },
    });
    if (!account) throw new NotFoundException('Social account not found.');
    return account;
  }

  private async ensurePost(id: string) {
    const post = await this.prisma.socialPost.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, title: true, content: true, status: true },
    });
    if (!post) throw new NotFoundException('Social post not found.');
    return post;
  }

  private nullable(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private async writeAudit(
    action: string,
    entityId: string,
    userId: string,
    metadata: Record<string, unknown>,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        entityId,
        entityType: 'SocialMedia',
        userId,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });
  }
}
