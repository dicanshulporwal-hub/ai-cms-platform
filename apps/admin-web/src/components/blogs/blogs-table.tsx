'use client';

import Link from 'next/link';
import { Eye, Loader2, Pencil, Stamp, Trash2, UploadCloud } from 'lucide-react';
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
  canApproveBlog,
  canDeleteBlog,
  canEditBlog,
  canPublishBlog,
} from '@/lib/blog-permissions';
import type { AuthUser } from '@/types/auth';
import type { CmsBlog } from '@/types/blog';

interface BlogsTableProps {
  actionBlogId?: string | null;
  blogs: CmsBlog[];
  onApprove: (blog: CmsBlog) => void;
  onDelete: (blog: CmsBlog) => void;
  onPublish: (blog: CmsBlog) => void;
  user: AuthUser;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function BlogsTable({
  actionBlogId,
  blogs,
  onApprove,
  onDelete,
  onPublish,
  user,
}: BlogsTableProps) {
  if (!blogs.length) {
    return (
      <div className="rounded-md border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        No blogs found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {blogs.map((blog) => {
          const isPending = actionBlogId === blog.id;

          return (
            <TableRow key={blog.id}>
              <TableCell>
                <div className="font-medium">{blog.title}</div>
                {blog.excerpt ? (
                  <div className="mt-1 max-w-sm truncate text-xs text-muted-foreground">
                    {blog.excerpt}
                  </div>
                ) : null}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {blog.slug}
              </TableCell>
              <TableCell>{blog.category?.name ?? 'Uncategorized'}</TableCell>
              <TableCell>
                <StatusBadge status={blog.status} />
              </TableCell>
              <TableCell>{blog.author?.name ?? 'Unknown'}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(blog.updatedAt)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-end gap-2">
                  {canEditBlog(user, blog) ? (
                    <Link
                      className={buttonClassName({
                        className: 'h-9 px-3',
                        variant: 'outline',
                      })}
                      href={`/blogs/${blog.id}/edit`}
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
                    href={`/blogs/${blog.id}/preview`}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Link>
                  {canApproveBlog(user, blog) ? (
                    <Button
                      className="h-9 px-3"
                      disabled={isPending}
                      onClick={() => onApprove(blog)}
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
                  {canPublishBlog(user, blog) ? (
                    <Button
                      className="h-9 px-3"
                      disabled={isPending}
                      onClick={() => onPublish(blog)}
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
                  {canDeleteBlog(user) ? (
                    <Button
                      className="h-9 px-3"
                      disabled={isPending}
                      onClick={() => onDelete(blog)}
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
