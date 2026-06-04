import { NextRequest } from 'next/server';

function getApiBaseUrl() {
  return (process.env.PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3001').replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const response = await fetch(`${getApiBaseUrl()}/public/rti/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  return Response.json(data ?? {}, { status: response.status });
}
