'use client';

import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { MediaLibrary } from '@/components/media/media-library';

export default function MediaPage() {
  return (
    <AdminPageShell sectionTitle="Media">
      {() => <MediaLibrary />}
    </AdminPageShell>
  );
}
