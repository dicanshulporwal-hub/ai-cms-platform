import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams.toString();
  return proxyToBackend(`/galleries${s ? '?' + s : ''}`);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend('/galleries', { body, method: 'POST' });
}
