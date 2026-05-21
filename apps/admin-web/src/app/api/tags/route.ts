import { proxyToBackend } from '@/lib/server-api';

export async function GET() {
  return proxyToBackend('/tags');
}

export async function POST(request: Request) {
  const body = await request.json();

  return proxyToBackend('/tags', {
    body,
    method: 'POST',
  });
}
