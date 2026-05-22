'use client';

import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { NotificationList } from '@/components/notifications/notification-list';

export default function NotificationsPage() {
  return (
    <AdminPageShell sectionTitle="Notifications">
      {() => (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Notifications</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review workflow updates and content status changes.
            </p>
          </div>
          <NotificationList />
        </div>
      )}
    </AdminPageShell>
  );
}
