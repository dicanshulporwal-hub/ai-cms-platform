import { EmptyState } from '@/components/dashboard/empty-state';
import type { RecentActivity } from '@/types/dashboard';

interface RecentActivityListProps {
  activities: RecentActivity[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (!activities.length) {
    return <EmptyState message="No recent activity yet." />;
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          className="flex items-start justify-between gap-4 rounded-md border border-border p-3"
          key={activity.id}
        >
          <div>
            <p className="text-sm font-medium">{activity.action}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activity.entityType} - {activity.userName ?? 'System'}
            </p>
          </div>
          <time className="shrink-0 text-xs text-muted-foreground">
            {new Date(activity.createdAt).toLocaleString()}
          </time>
        </div>
      ))}
    </div>
  );
}
