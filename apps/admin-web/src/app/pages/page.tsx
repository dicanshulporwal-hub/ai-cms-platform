'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FilePlus2, Loader2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { PagesTable } from '@/components/pages/pages-table';
import { Button, buttonClassName } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  useApprovePage,
  useDeletePage,
  usePages,
  usePublishPage,
} from '@/hooks/use-pages';
import { canCreatePage, pageStatuses } from '@/lib/page-permissions';
import type { AuthUser } from '@/types/auth';
import type { CmsPage, PageStatus } from '@/types/page';

function PagesContent({ user }: { user: AuthUser }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PageStatus | ''>('');
  const [page, setPage] = useState(1);
  const [actionPageId, setActionPageId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pagesQuery = usePages({ limit: 10, page, search, status });
  const deleteMutation = useDeletePage();
  const approveMutation = useApprovePage();
  const publishMutation = usePublishPage();

  async function runAction(
    pageToUpdate: CmsPage,
    action: 'approve' | 'delete' | 'publish',
  ) {
    setActionPageId(pageToUpdate.id);
    setMessage(null);
    setErrorMessage(null);

    try {
      if (action === 'delete') {
        const confirmed = window.confirm(
          `Archive "${pageToUpdate.title}"? This is a soft delete.`,
        );

        if (!confirmed) {
          return;
        }

        await deleteMutation.mutateAsync(pageToUpdate.id);
        setMessage('Page archived.');
      }

      if (action === 'approve') {
        await approveMutation.mutateAsync(pageToUpdate.id);
        setMessage('Page approved.');
      }

      if (action === 'publish') {
        await publishMutation.mutateAsync(pageToUpdate.id);
        setMessage('Page published.');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Page action failed.',
      );
    } finally {
      setActionPageId(null);
    }
  }

  const meta = pagesQuery.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage website pages through draft, review, approval, and publish.
          </p>
        </div>
        {canCreatePage(user) ? (
          <Link
            className={buttonClassName({ className: 'h-10' })}
            href="/pages/new"
          >
            <FilePlus2 className="h-4 w-4" />
            Create page
          </Link>
        ) : null}
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
          <CardTitle>Page library</CardTitle>
          <CardDescription>
            Search, filter, and continue page workflow actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="space-y-2">
              <Label htmlFor="page-search">Search by title</Label>
              <Input
                id="page-search"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search pages"
                value={search}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="page-status">Status</Label>
              <Select
                id="page-status"
                onChange={(event) => {
                  setStatus(event.target.value as PageStatus | '');
                  setPage(1);
                }}
                value={status}
              >
                <option value="">All statuses</option>
                {pageStatuses.map((pageStatus) => (
                  <option key={pageStatus} value={pageStatus}>
                    {pageStatus.replaceAll('_', ' ')}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {pagesQuery.isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading pages
            </div>
          ) : pagesQuery.isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {pagesQuery.error.message}
            </div>
          ) : (
            <PagesTable
              actionPageId={actionPageId}
              onApprove={(pageToUpdate) =>
                void runAction(pageToUpdate, 'approve')
              }
              onDelete={(pageToUpdate) => void runAction(pageToUpdate, 'delete')}
              onPublish={(pageToUpdate) =>
                void runAction(pageToUpdate, 'publish')
              }
              pages={pagesQuery.data?.data ?? []}
              user={user}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              {meta
                ? `Page ${meta.page} of ${meta.totalPages} (${meta.total} total)`
                : 'No pagination data'}
            </span>
            <div className="flex gap-2">
              <Button
                disabled={!meta || meta.page <= 1 || pagesQuery.isFetching}
                onClick={() => setPage((currentPage) => currentPage - 1)}
                type="button"
                variant="outline"
              >
                Previous
              </Button>
              <Button
                disabled={
                  !meta || meta.page >= meta.totalPages || pagesQuery.isFetching
                }
                onClick={() => setPage((currentPage) => currentPage + 1)}
                type="button"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PagesPage() {
  return (
    <AdminPageShell sectionTitle="Pages">
      {(user) => <PagesContent user={user} />}
    </AdminPageShell>
  );
}
