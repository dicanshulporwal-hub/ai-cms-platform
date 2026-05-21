import { proxyToBackend } from '@/lib/server-api';

export async function GET(request: Request) {
  const url = new URL(request.url);

  return proxyToBackend(`/pages${url.search}`);
}

export async function POST(request: Request) {
  const body = await request.json();

  return proxyToBackend('/pages', {
    body,
    method: 'POST',
  });
}
