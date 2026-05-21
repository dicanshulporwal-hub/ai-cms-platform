'use client';

import Link from 'next/link';
import { Loader2, Pencil } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { SafeHtml } from '@/components/pages/safe-html';
import { StatusBadge } from '@/components/pages/status-badge';
import { buttonClassName } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useBlog } from '@/hooks/use-blogs';
import { canEditBlog } from '@/lib/blog-permissions';
import type { AuthUser } from '@/types/auth';

interface PreviewBlogProps {
  params: {
    id: string;
  };
}

function PreviewBlogContent({ id, user }: { id: string; user: AuthUser }) {
  const blogQuery = useBlog(id);

  if (blogQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading preview
      </div>
    );
  }

  if (blogQuery.isError || !blogQuery.data) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Preview unavailable</CardTitle>
          <CardDescription>
            This blog could not be loaded. It may have been archived.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {blogQuery.isError ? blogQuery.error.message : 'Blog not found.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const blog = blogQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={blog.status} />
            <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium">
              {blog.category?.name ?? 'Uncategorized'}
            </span>
          </div>
          <h1 className="text-3xl font-semibold">{blog.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">/{blog.slug}</p>
        </div>
        {canEditBlog(user, blog) ? (
          <Link
            className={buttonClassName({ variant: 'outline' })}
            href={`/blogs/${blog.id}/edit`}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        ) : null}
      </div>

      {blog.featuredImage ? (
        <img
          alt=""
          className="max-h-96 w-full rounded-md border border-border object-cover"
          src={blog.featuredImage}
        />
      ) : null}

      {blog.tags.length ? (
        <div className="flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <span
              className="rounded-md border border-border bg-card px-2 py-1 text-xs font-medium"
              key={tag.id}
            >
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}

      <Card>
        <CardContent className="p-6">
          <SafeHtml html={blog.content} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO preview</CardTitle>
          <CardDescription>
            This approximates how metadata can appear in search results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">
              https://example.com/blog/{blog.slug}
            </p>
            <p className="mt-1 text-lg text-blue-700">
              {blog.metaTitle || blog.title}
            </p>
            <p className="mt-1 text-sm text-foreground">
              {blog.metaDescription || blog.excerpt || 'No meta description set.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PreviewBlogPage({ params }: PreviewBlogProps) {
  return (
    <AdminPageShell sectionTitle="Preview blog">
      {(user) => <PreviewBlogContent id={params.id} user={user} />}
    </AdminPageShell>
  );
}
