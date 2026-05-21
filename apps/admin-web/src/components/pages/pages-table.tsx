'use client';

import Link from 'next/link';
import { Eye, Loader2, Pencil, Trash2, UploadCloud, Stamp } from 'lucide-react';
import { StatusBadge } from '@/components/pages/status-badge';
import { Button, buttonClassName } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  canApprovePage,
  canDeletePage,
  canEditPage,
  canPublishPage,
} from '@/lib/page-permissions';
import type { AuthUser } from '@/types/auth';
import type { CmsPage } from '@/types/page';

interface PagesTableProps {
  actionPageId?: string | null;
  onApprove: (page: CmsPage) => void;
  onDelete: (page: CmsPage) => void;
  onPublish: (page: CmsPage) => void;
  pages: CmsPage[];
  user: AuthUser;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function PagesTable({
  actionPageId,
  onApprove,
  onDelete,
  onPublish,
  pages,
  user,
}: PagesTableProps) {
  if (!pages.length) {
    return (
      <div className="rounded-md border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        No pages found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pages.map((page) => {
          const isPending = actionPageId === page.id;

          return (
            <TableRow key={page.id}>
              <TableCell>
                <div className="font-medium">{page.title}</div>
                {page.excerpt ? (
                  <div className="mt-1 max-w-sm truncate text-xs text-muted-foreground">
                    {page.excerpt}
                  </div>
                ) : null}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {page.slug}
              </TableCell>
              <TableCell>
                <StatusBadge status={page.status} />
              </TableCell>
              <TableCell>{page.author?.name ?? 'Unknown'}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(page.updatedAt)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-end gap-2">
                  {canEditPage(user, page) ? (
                    <Link
                      className={buttonClassName({
                        className: 'h-9 px-3',
                        variant: 'outline',
                      })}
                      href={`/pages/${page.id}/edit`}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                  ) : null}
                  <Link
                    className={buttonClassName({
                      className: 'h-9 px-3',
                      variant: 'outline',
                    })}
                    href={`/pages/${page.id}/preview`}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Link>
                  {canApprovePage(user, page) ? (
                    <Button
                      className="h-9 px-3"
                      disabled={isPending}
                      onClick={() => onApprove(page)}
                      type="button"
                      variant="outline"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Stamp className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  ) : null}
                  {canPublishPage(user, page) ? (
                    <Button
                      className="h-9 px-3"
                      disabled={isPending}
                      onClick={() => onPublish(page)}
                      type="button"
                      variant="outline"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UploadCloud className="h-4 w-4" />
                      )}
                      Publish
                    </Button>
                  ) : null}
                  {canDeletePage(user) ? (
                    <Button
                      className="h-9 px-3"
                      disabled={isPending}
                      onClick={() => onDelete(page)}
                      type="button"
                      variant="destructive"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
