import { proxyToBackend } from '@/lib/server-api';

export async function POST() {
  return proxyToBackend('/accessibility/audits/run-full-site', { method: 'POST' });
}
