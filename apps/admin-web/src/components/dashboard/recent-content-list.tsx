import { FileText, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/dashboard/empty-state';

interface RecentContent {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

interface RecentContentListProps {
  basePath: '/blogs' | '/pages';
  emptyMessage: string;
  items: RecentContent[];
  icon?: LucideIcon;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    ARCHIVED: 'bg-gray-100 text-gray-700 border-gray-200',
    CHANGES_REQUESTED: 'bg-amber-100 text-amber-700 border-amber-200',
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
    PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-200',
    UNDER_REVIEW: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

export function RecentContentList({
  basePath,
  emptyMessage,
  items,
  icon: Icon = FileText,
}: RecentContentListProps) {
  if (!items.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
          href={`${basePath}/${item.id}/edit`}
          key={item.id}
        >
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">/{item.slug}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={[
                'rounded-md border px-2 py-0.5 text-xs font-medium',
                getStatusColor(item.status),
              ].join(' ')}
            >
              {item.status.replaceAll('_', ' ')}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(item.updatedAt)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
