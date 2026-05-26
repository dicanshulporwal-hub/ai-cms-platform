import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  return proxyToBackend(`/roles/${params.id}/status`, { body, method: 'PATCH' });
}
