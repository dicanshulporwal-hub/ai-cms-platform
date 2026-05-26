import { apiClient } from '@/lib/api-client';
import type { DashboardSummary } from '@/types/dashboard';

export function getDashboardSummary() {
  return apiClient<DashboardSummary>('/api/dashboard/summary');
}
