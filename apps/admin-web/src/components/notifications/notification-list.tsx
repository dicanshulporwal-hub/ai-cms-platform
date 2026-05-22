'use client';

import Link from 'next/link';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/use-notifications';
import type { NotificationItem } from '@/types/notification';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function hrefForNotification(notification: NotificationItem) {
  if (!notification.entityId) {
    return null;
  }

  if (notification.entityType === 'PAGE') {
    return `/pages/${notification.entityId}/preview`;
  }

  if (notification.entityType === 'BLOG') {
    return `/blogs/${notification.entityId}/preview`;
  }

  return null;
}

export function NotificationList() {
  const notificationsQuery = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  async function openNotification(notification: NotificationItem) {
    if (!notification.isRead) {
      await markReadMutation.mutateAsync(notification.id);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Workflow updates and content actions that need attention.
          </CardDescription>
        </div>
        <Button
          disabled={markAllReadMutation.isPending}
          onClick={() => markAllReadMutation.mutate()}
          type="button"
          variant="outline"
        >
          {markAllReadMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="h-4 w-4" />
          )}
          Mark all read
        </Button>
      </CardHeader>
      <CardContent>
        {notificationsQuery.isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading notifications
          </div>
        ) : notificationsQuery.isError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {notificationsQuery.error.message}
          </div>
        ) : notificationsQuery.data?.length ? (
          <div className="divide-y divide-border rounded-md border border-border">
            {notificationsQuery.data.map((notification) => {
              const href = hrefForNotification(notification);
              const content = (
                <div
                  className={[
                    'flex gap-3 p-4 text-left transition-colors',
                    notification.isRead ? 'bg-card' : 'bg-primary/5',
                    href ? 'hover:bg-muted' : '',
                  ].join(' ')}
                >
                  <Bell className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{notification.title}</p>
                      {!notification.isRead ? (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead ? (
                    <Button
                      className="h-8 px-3"
                      disabled={markReadMutation.isPending}
                      onClick={(event) => {
                        event.preventDefault();
                        void markReadMutation.mutateAsync(notification.id);
                      }}
                      type="button"
                      variant="outline"
                    >
                      Read
                    </Button>
                  ) : null}
                </div>
              );

              return href ? (
                <Link
                  href={href}
                  key={notification.id}
                  onClick={() => void openNotification(notification)}
                >
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
