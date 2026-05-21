'use client';

import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { BlogForm } from '@/components/blogs/blog-form';

export default function NewBlogPage() {
  return (
    <AdminPageShell sectionTitle="New blog">
      {(user) => <BlogForm user={user} />}
    </AdminPageShell>
  );
}
