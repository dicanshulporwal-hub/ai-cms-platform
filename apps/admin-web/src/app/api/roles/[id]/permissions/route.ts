import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  return proxyToBackend(`/roles/${params.id}/permissions`, { body, method: 'PUT' });
}
