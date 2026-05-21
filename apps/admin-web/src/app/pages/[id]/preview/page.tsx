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
import { usePage } from '@/hooks/use-pages';
import { canEditPage } from '@/lib/page-permissions';
import type { AuthUser } from '@/types/auth';

interface PreviewPageProps {
  params: {
    id: string;
  };
}

function PreviewPageContent({ id, user }: { id: string; user: AuthUser }) {
  const pageQuery = usePage(id);

  if (pageQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading preview
      </div>
    );
  }

  if (pageQuery.isError || !pageQuery.data) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Preview unavailable</CardTitle>
          <CardDescription>
            This page could not be loaded. It may have been archived.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {pageQuery.isError ? pageQuery.error.message : 'Page not found.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const page = pageQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2">
            <StatusBadge status={page.status} />
          </div>
          <h1 className="text-3xl font-semibold">{page.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">/{page.slug}</p>
        </div>
        {canEditPage(user, page) ? (
          <Link
            className={buttonClassName({ variant: 'outline' })}
            href={`/pages/${page.id}/edit`}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        ) : null}
      </div>

      {page.featuredImage ? (
        <img
          alt=""
          className="max-h-96 w-full rounded-md border border-border object-cover"
          src={page.featuredImage}
        />
      ) : null}

      <Card>
        <CardContent className="p-6">
          <SafeHtml html={page.content} />
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
              https://example.com/{page.slug}
            </p>
            <p className="mt-1 text-lg text-blue-700">
              {page.metaTitle || page.title}
            </p>
            <p className="mt-1 text-sm text-foreground">
              {page.metaDescription || page.excerpt || 'No meta description set.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PreviewPagePage({ params }: PreviewPageProps) {
  return (
    <AdminPageShell sectionTitle="Preview page">
      {(user) => <PreviewPageContent id={params.id} user={user} />}
    </AdminPageShell>
  );
}
