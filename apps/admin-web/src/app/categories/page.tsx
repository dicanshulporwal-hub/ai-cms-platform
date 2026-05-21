'use client';

import { TaxonomyManager } from '@/components/blogs/taxonomy-manager';
import { AdminPageShell } from '@/components/layout/admin-page-shell';

export default function CategoriesPage() {
  return (
    <AdminPageShell sectionTitle="Categories">
      {(user) => <TaxonomyManager kind="categories" user={user} />}
    </AdminPageShell>
  );
}
