import { cn } from '@/lib/utils';
import type { PageStatus } from '@/types/page';

const statusStyles: Record<PageStatus, string> = {
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  ARCHIVED: 'border-slate-200 bg-slate-50 text-slate-600',
  DRAFT: 'border-zinc-200 bg-zinc-50 text-zinc-700',
  PUBLISHED: 'border-teal-200 bg-teal-50 text-teal-700',
  SUBMITTED: 'border-amber-200 bg-amber-50 text-amber-700',
  UNDER_REVIEW: 'border-blue-200 bg-blue-50 text-blue-700',
};

export function StatusBadge({ status }: { status: PageStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md border px-2 py-1 text-xs font-medium',
        statusStyles[status],
      )}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}
