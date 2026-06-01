import { proxyToBackend } from '@/lib/server-api';

export async function POST() {
  return proxyToBackend('/templates/seed', { method: 'POST' });
}
