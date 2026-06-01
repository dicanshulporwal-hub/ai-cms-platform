import { proxyToBackend } from '@/lib/server-api';

export async function GET() {
  return proxyToBackend('/templates/import-html/jobs');
}
