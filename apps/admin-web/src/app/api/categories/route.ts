import { proxyToBackend } from '@/lib/server-api';

export async function GET() {
  return proxyToBackend('/categories');
}

export async function POST(request: Request) {
  const body = await request.json();

  return proxyToBackend('/categories', {
    body,
    method: 'POST',
  });
}
