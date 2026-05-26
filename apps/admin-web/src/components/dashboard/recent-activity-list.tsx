import { Clock, UserRound } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/empty-state';
import type { RecentActivity } from '@/types/dashboard';

interface RecentActivityListProps {
  activities: RecentActivity[];
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getActionLabel(action: string): string {
  const actionLabels: Record<string, string> = {
    'blog.published': 'Blog published',
    'blog.submitted': 'Blog submitted',
    'blog.updated': 'Blog updated',
    'blog.created': 'Blog created',
    'chatbot.settings.updated': 'Chatbot settings updated',
    'chatbot.message': 'Chatbot message',
    'lead.captured': 'Lead captured',
    'media.deleted': 'Media deleted',
    'media.uploaded': 'Media uploaded',
    'page.approved': 'Page approved',
    'page.published': 'Page published',
    'page.submitted': 'Page submitted',
    'page.updated': 'Page updated',
    'page.created': 'Page created',
    'role.permissions_updated': 'Role permissions updated',
    'settings.updated': 'Settings updated',
    'user.created': 'User created',
    'user.deleted': 'User deleted',
    'user.status_changed': 'User status changed',
    'user.updated': 'User updated',
    'workflow.action': 'Workflow action',
  };

  return actionLabels[action] || action;
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (!activities.length) {
    return <EmptyState message="No recent activity yet." />;
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
          key={activity.id}
        >
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{getActionLabel(activity.action)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {activity.entityType}
              {activity.userName ? ` • ${activity.userName}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(activity.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
