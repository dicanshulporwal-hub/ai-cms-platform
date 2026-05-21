'use client';

import { Loader2 } from 'lucide-react';
import { BlogForm } from '@/components/blogs/blog-form';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useBlog } from '@/hooks/use-blogs';
import type { AuthUser } from '@/types/auth';

interface EditBlogProps {
  params: {
    id: string;
  };
}

function EditBlogContent({ id, user }: { id: string; user: AuthUser }) {
  const blogQuery = useBlog(id);

  if (blogQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading blog
      </div>
    );
  }

  if (blogQuery.isError || !blogQuery.data) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Blog unavailable</CardTitle>
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

  return <BlogForm initialBlog={blogQuery.data} user={user} />;
}

export default function EditBlogPage({ params }: EditBlogProps) {
  return (
    <AdminPageShell sectionTitle="Edit blog">
      {(user) => <EditBlogContent id={params.id} user={user} />}
    </AdminPageShell>
  );
}
