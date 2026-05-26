import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET() {
  return proxyToBackend('/settings');
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend('/settings', { body, method: 'PUT' });
}
