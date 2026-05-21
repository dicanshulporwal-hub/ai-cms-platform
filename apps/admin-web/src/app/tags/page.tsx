'use client';

import { TaxonomyManager } from '@/components/blogs/taxonomy-manager';
import { AdminPageShell } from '@/components/layout/admin-page-shell';

export default function TagsPage() {
  return (
    <AdminPageShell sectionTitle="Tags">
      {(user) => <TaxonomyManager kind="tags" user={user} />}
    </AdminPageShell>
  );
}
