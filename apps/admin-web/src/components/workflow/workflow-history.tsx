'use client';

import { Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/pages/status-badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWorkflowHistory } from '@/hooks/use-workflow';
import type { ContentType } from '@/types/workflow';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatAction(action: string) {
  return action.replaceAll('.', ' ').replaceAll('_', ' ');
}

export function WorkflowHistory({
  contentId,
  contentType,
}: {
  contentId: string;
  contentType: ContentType;
}) {
  const historyQuery = useWorkflowHistory(contentType, contentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow history</CardTitle>
        <CardDescription>
          Status changes, reviewer comments, and publishing actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {historyQuery.isLoading ? (
          <div className="flex items-center py-6 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading history
          </div>
        ) : historyQuery.isError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {historyQuery.error.message}
          </div>
        ) : historyQuery.data?.length ? (
          <ol className="space-y-4">
            {historyQuery.data.map((item) => (
              <li className="border-l border-border pl-4" key={item.id}>
                <div className="flex flex-wrap items-center gap-2">
                  {item.fromStatus ? <StatusBadge status={item.fromStatus} /> : null}
                  <span className="text-xs text-muted-foreground">to</span>
                  <StatusBadge status={item.toStatus} />
                </div>
                <p className="mt-2 text-sm font-medium capitalize">
                  {formatAction(item.action)}
                </p>
                {item.comment ? (
                  <p className="mt-1 rounded-md bg-muted px-3 py-2 text-sm">
                    {item.comment}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.performedBy?.name ?? 'System'} · {formatDate(item.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">
            No workflow history recorded yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
