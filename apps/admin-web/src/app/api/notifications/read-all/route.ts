import { proxyToBackend } from '@/lib/server-api';

export async function PATCH() {
  return proxyToBackend('/notifications/read-all', {
    method: 'PATCH',
  });
}
