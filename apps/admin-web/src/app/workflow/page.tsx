'use client';

import Link from 'next/link';
import { Eye, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { StatusBadge } from '@/components/pages/status-badge';
import { WorkflowActions } from '@/components/workflow/workflow-actions';
import { buttonClassName } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useBlogs } from '@/hooks/use-blogs';
import { usePages } from '@/hooks/use-pages';
import type { AuthUser } from '@/types/auth';
import type { WorkflowContentItem } from '@/types/workflow';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function WorkflowTable({
  items,
  onError,
  onSuccess,
  user,
}: {
  items: WorkflowContentItem[];
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  user: AuthUser;
}) {
  if (!items.length) {
    return (
      <div className="rounded-md border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        No content is waiting in workflow.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Content</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const previewHref =
            item.contentType === 'PAGE'
              ? `/pages/${item.id}/preview`
              : `/blogs/${item.id}/preview`;

          return (
            <TableRow key={`${item.contentType}-${item.id}`}>
              <TableCell>
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  /{item.slug}
                </div>
              </TableCell>
              <TableCell>{item.contentType === 'PAGE' ? 'Page' : 'Blog'}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell>{item.author?.name ?? 'Unknown'}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(item.updatedAt)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    className={buttonClassName({
                      className: 'h-9 px-3',
                      variant: 'outline',
                    })}
                    href={previewHref}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Link>
                  <WorkflowActions
                    item={item}
                    onError={onError}
                    onSuccess={onSuccess}
                    user={user}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function WorkflowContent({ user }: { user: AuthUser }) {
  const submittedPages = usePages({ limit: 25, page: 1, status: 'SUBMITTED' });
  const reviewPages = usePages({ limit: 25, page: 1, status: 'UNDER_REVIEW' });
  const approvedPages = usePages({ limit: 25, page: 1, status: 'APPROVED' });
  const submittedBlogs = useBlogs({ limit: 25, page: 1, status: 'SUBMITTED' });
  const reviewBlogs = useBlogs({ limit: 25, page: 1, status: 'UNDER_REVIEW' });
  const approvedBlogs = useBlogs({ limit: 25, page: 1, status: 'APPROVED' });
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const queries = [
    submittedPages,
    reviewPages,
    approvedPages,
    submittedBlogs,
    reviewBlogs,
    approvedBlogs,
  ];
  const isLoading = queries.some((query) => query.isLoading);
  const firstError = queries.find((query) => query.isError)?.error;
  const items: WorkflowContentItem[] = [
    ...(submittedPages.data?.data ?? []).map((item) => ({
      ...item,
      contentType: 'PAGE' as const,
    })),
    ...(reviewPages.data?.data ?? []).map((item) => ({
      ...item,
      contentType: 'PAGE' as const,
    })),
    ...(approvedPages.data?.data ?? []).map((item) => ({
      ...item,
      contentType: 'PAGE' as const,
    })),
    ...(submittedBlogs.data?.data ?? []).map((item) => ({
      ...item,
      contentType: 'BLOG' as const,
    })),
    ...(reviewBlogs.data?.data ?? []).map((item) => ({
      ...item,
      contentType: 'BLOG' as const,
    })),
    ...(approvedBlogs.data?.data ?? []).map((item) => ({
      ...item,
      contentType: 'BLOG' as const,
    })),
  ].sort(
    (first, second) =>
      new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Workflow</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review submitted content and move approved items into publishing.
        </p>
      </div>

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Approval queue</CardTitle>
          <CardDescription>
            Submitted, under review, and approved but unpublished content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading workflow queue
            </div>
          ) : firstError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {firstError.message}
            </div>
          ) : (
            <WorkflowTable
              items={items}
              onError={(value) => setErrorMessage(value)}
              onSuccess={(value) => setMessage(value)}
              user={user}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function WorkflowPage() {
  return (
    <AdminPageShell sectionTitle="Workflow">
      {(user) => <WorkflowContent user={user} />}
    </AdminPageShell>
  );
}
