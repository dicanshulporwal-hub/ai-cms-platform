import { apiClient } from '@/lib/api-client';
import type {
  NotificationItem,
  NotificationUnreadCount,
} from '@/types/notification';

export function listNotifications() {
  return apiClient<NotificationItem[]>('/api/notifications');
}

export function getUnreadNotificationCount() {
  return apiClient<NotificationUnreadCount>('/api/notifications/unread-count');
}

export function markNotificationRead(id: string) {
  return apiClient<NotificationItem>(`/api/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead() {
  return apiClient<NotificationItem[]>('/api/notifications/read-all', {
    method: 'PATCH',
  });
}
