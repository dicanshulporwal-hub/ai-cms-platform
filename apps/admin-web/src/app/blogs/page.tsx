'use client';

import Link from 'next/link';
import { FilePlus2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { BlogsTable } from '@/components/blogs/blogs-table';
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
  useApproveBlog,
  useBlogs,
  useDeleteBlog,
  usePublishBlog,
} from '@/hooks/use-blogs';
import { useCategories } from '@/hooks/use-taxonomy';
import { blogStatuses, canCreateBlog } from '@/lib/blog-permissions';
import type { AuthUser } from '@/types/auth';
import type { BlogStatus, CmsBlog } from '@/types/blog';

function BlogsContent({ user }: { user: AuthUser }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BlogStatus | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [actionBlogId, setActionBlogId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const blogsQuery = useBlogs({ categoryId, limit: 10, page, search, status });
  const categoriesQuery = useCategories();
  const deleteMutation = useDeleteBlog();
  const approveMutation = useApproveBlog();
  const publishMutation = usePublishBlog();

  async function runAction(
    blogToUpdate: CmsBlog,
    action: 'approve' | 'delete' | 'publish',
  ) {
    setActionBlogId(blogToUpdate.id);
    setMessage(null);
    setErrorMessage(null);

    try {
      if (action === 'delete') {
        const confirmed = window.confirm(
          `Archive "${blogToUpdate.title}"? This is a soft delete.`,
        );

        if (!confirmed) {
          return;
        }

        await deleteMutation.mutateAsync(blogToUpdate.id);
        setMessage('Blog archived.');
      }

      if (action === 'approve') {
        await approveMutation.mutateAsync(blogToUpdate.id);
        setMessage('Blog approved.');
      }

      if (action === 'publish') {
        await publishMutation.mutateAsync(blogToUpdate.id);
        setMessage('Blog published.');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Blog action failed.',
      );
    } finally {
      setActionBlogId(null);
    }
  }

  const meta = blogsQuery.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Blogs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage articles through draft, review, approval, and publish.
          </p>
        </div>
        {canCreateBlog(user) ? (
          <Link
            className={buttonClassName({ className: 'h-10' })}
            href="/blogs/new"
          >
            <FilePlus2 className="h-4 w-4" />
            Create blog
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
          <CardTitle>Blog library</CardTitle>
          <CardDescription>
            Search, filter, and continue blog workflow actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">
            <div className="space-y-2">
              <Label htmlFor="blog-search">Search by title</Label>
              <Input
                id="blog-search"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search blogs"
                value={search}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-status">Status</Label>
              <Select
                id="blog-status"
                onChange={(event) => {
                  setStatus(event.target.value as BlogStatus | '');
                  setPage(1);
                }}
                value={status}
              >
                <option value="">All statuses</option>
                {blogStatuses.map((blogStatus) => (
                  <option key={blogStatus} value={blogStatus}>
                    {blogStatus.replaceAll('_', ' ')}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-category">Category</Label>
              <Select
                disabled={categoriesQuery.isLoading}
                id="blog-category"
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setPage(1);
                }}
                value={categoryId}
              >
                <option value="">All categories</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {blogsQuery.isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading blogs
            </div>
          ) : blogsQuery.isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {blogsQuery.error.message}
            </div>
          ) : (
            <BlogsTable
              actionBlogId={actionBlogId}
              blogs={blogsQuery.data?.data ?? []}
              onApprove={(blogToUpdate) =>
                void runAction(blogToUpdate, 'approve')
              }
              onDelete={(blogToUpdate) => void runAction(blogToUpdate, 'delete')}
              onPublish={(blogToUpdate) =>
                void runAction(blogToUpdate, 'publish')
              }
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
                disabled={!meta || meta.page <= 1 || blogsQuery.isFetching}
                onClick={() => setPage((currentPage) => currentPage - 1)}
                type="button"
                variant="outline"
              >
                Previous
              </Button>
              <Button
                disabled={
                  !meta || meta.page >= meta.totalPages || blogsQuery.isFetching
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

export default function BlogsPage() {
  return (
    <AdminPageShell sectionTitle="Blogs">
      {(user) => <BlogsContent user={user} />}
    </AdminPageShell>
  );
}
