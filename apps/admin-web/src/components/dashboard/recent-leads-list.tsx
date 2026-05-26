import { Mail, MapPin, UserRound } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/dashboard/empty-state';
import type { RecentLead } from '@/types/dashboard';

interface RecentLeadsListProps {
  leads: RecentLead[];
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

export function RecentLeadsList({ leads }: RecentLeadsListProps) {
  if (!leads.length) {
    return <EmptyState message="No leads captured yet." />;
  }

  return (
    <div className="space-y-2">
      {leads.map((lead) => (
        <Link
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
          href="/chatbot/leads"
          key={lead.id}
        >
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{lead.name ?? 'Unknown lead'}</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{lead.email ?? 'No email'}</span>
            </div>
            {lead.sourcePage ? (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{lead.sourcePage}</span>
              </div>
            ) : null}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(lead.createdAt)}
          </span>
        </Link>
      ))}
    </div>
  );
}
