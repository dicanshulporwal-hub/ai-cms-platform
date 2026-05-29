import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  return proxyToBackend(`/template-modules/${params.id}/status`, { body, method: 'PATCH' });
}
