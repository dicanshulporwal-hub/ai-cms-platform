import { EmptyState } from '@/components/dashboard/empty-state';
import type { RecentLead } from '@/types/dashboard';

interface RecentLeadsListProps {
  leads: RecentLead[];
}

export function RecentLeadsList({ leads }: RecentLeadsListProps) {
  if (!leads.length) {
    return <EmptyState message="No leads captured yet." />;
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <div className="rounded-md border border-border p-3" key={lead.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{lead.name ?? 'Unknown lead'}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lead.email ?? 'No email'}
              </p>
            </div>
            <time className="shrink-0 text-xs text-muted-foreground">
              {new Date(lead.createdAt).toLocaleDateString()}
            </time>
          </div>
          <p className="mt-2 truncate text-xs text-muted-foreground">
            {lead.sourcePage ?? 'Unknown source'}
          </p>
        </div>
      ))}
    </div>
  );
}
