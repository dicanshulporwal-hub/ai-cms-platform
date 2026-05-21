'use client';

import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { PageForm } from '@/components/pages/page-form';

export default function NewPagePage() {
  return (
    <AdminPageShell sectionTitle="New page">
      {(user) => <PageForm user={user} />}
    </AdminPageShell>
  );
}
