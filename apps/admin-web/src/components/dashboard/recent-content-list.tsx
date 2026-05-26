import Link from 'next/link';
import { EmptyState } from '@/components/dashboard/empty-state';
import type { RecentContent } from '@/types/dashboard';

interface RecentContentListProps {
  basePath: '/blogs' | '/pages';
  emptyMessage: string;
  items: RecentContent[];
}

export function RecentContentList({
  basePath,
  emptyMessage,
  items,
}: RecentContentListProps) {
  if (!items.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          className="flex items-start justify-between gap-4 rounded-md border border-border p-3 transition-colors hover:bg-muted"
          href={`${basePath}/${item.id}/edit`}
          key={item.id}
        >
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">/{item.slug}</p>
          </div>
          <div className="text-right">
            <span className="rounded-md border border-border bg-card px-2 py-1 text-xs">
              {item.status.replaceAll('_', ' ')}
            </span>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(item.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
