import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/lib/dashboard-api';

export function useDashboardSummary() {
  return useQuery({
    queryFn: getDashboardSummary,
    queryKey: ['dashboard', 'summary'],
  });
}
