import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.searchParams.toString();
  return proxyToBackend(`/documents${qs ? `?${qs}` : ''}`);
}
