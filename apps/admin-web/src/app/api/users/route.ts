import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  const path = searchParams ? `/users?${searchParams}` : '/users';
  return proxyToBackend(path);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend('/users', { body, method: 'POST' });
}
