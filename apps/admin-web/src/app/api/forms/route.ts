import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  return proxyToBackend(`/forms${qs ? `?${qs}` : ''}`);
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend('/forms', { body, method: 'POST' });
}
