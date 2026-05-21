'use client';

import { Loader2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { PageForm } from '@/components/pages/page-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePage } from '@/hooks/use-pages';
import type { AuthUser } from '@/types/auth';

interface EditPageProps {
  params: {
    id: string;
  };
}

function EditPageContent({ id, user }: { id: string; user: AuthUser }) {
  const pageQuery = usePage(id);

  if (pageQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading page
      </div>
    );
  }

  if (pageQuery.isError || !pageQuery.data) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Page unavailable</CardTitle>
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

  return <PageForm initialPage={pageQuery.data} user={user} />;
}

export default function EditPagePage({ params }: EditPageProps) {
  return (
    <AdminPageShell sectionTitle="Edit page">
      {(user) => <EditPageContent id={params.id} user={user} />}
    </AdminPageShell>
  );
}
