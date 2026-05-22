import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification, UserStatus } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNotificationInput {
  entityId?: string | null;
  entityType?: string | null;
  message: string;
  title: string;
  type?: string;
  userId: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthenticatedUser) {
    const notifications = await this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      where: { userId: user.id },
    });

    return notifications.map((notification) => this.toResponse(notification));
  }

  async unreadCount(user: AuthenticatedUser) {
    const count = await this.prisma.notification.count({
      where: {
        isRead: false,
        userId: user.id,
      },
    });

    return { count };
  }

  async markRead(id: string, user: AuthenticatedUser) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    const updatedNotification = await this.prisma.notification.update({
      data: { isRead: true },
      where: { id },
    });

    return this.toResponse(updatedNotification);
  }

  async markAllRead(user: AuthenticatedUser) {
    await this.prisma.notification.updateMany({
      data: { isRead: true },
      where: {
        isRead: false,
        userId: user.id,
      },
    });

    return this.findAll(user);
  }

  async notifyUsers(inputs: CreateNotificationInput[]) {
    const uniqueNotifications = new Map<string, CreateNotificationInput>();

    for (const input of inputs) {
      uniqueNotifications.set(
        `${input.userId}:${input.entityType}:${input.entityId}:${input.title}`,
        input,
      );
    }

    if (!uniqueNotifications.size) {
      return;
    }

    await this.prisma.notification.createMany({
      data: [...uniqueNotifications.values()].map((input) => ({
        entityId: input.entityId,
        entityType: input.entityType,
        isRead: false,
        message: input.message,
        title: input.title,
        type: input.type ?? 'WORKFLOW',
        userId: input.userId,
      })),
    });
  }

  async usersWithRoles(roles: string[], excludeUserIds: string[] = []) {
    return this.prisma.user.findMany({
      select: {
        email: true,
        id: true,
        name: true,
        role: {
          select: {
            name: true,
          },
        },
      },
      where: {
        id: excludeUserIds.length ? { notIn: excludeUserIds } : undefined,
        role: {
          name: { in: roles },
        },
        status: UserStatus.ACTIVE,
      },
    });
  }

  private toResponse(notification: Notification) {
    return {
      createdAt: notification.createdAt,
      entityId: notification.entityId,
      entityType: notification.entityType,
      id: notification.id,
      isRead: notification.isRead,
      message: notification.message,
      title: notification.title,
      type: notification.type,
      updatedAt: notification.updatedAt,
      userId: notification.userId,
    };
  }
}
