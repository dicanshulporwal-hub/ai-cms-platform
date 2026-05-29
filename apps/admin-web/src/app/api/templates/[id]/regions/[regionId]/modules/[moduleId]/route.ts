import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function PUT(req: NextRequest, { params }: { params: { id: string; regionId: string; moduleId: string } }) {
  const body = await req.json();
  return proxyToBackend(`/templates/${params.id}/regions/${params.regionId}/modules/${params.moduleId}`, { body, method: 'PUT' });
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string; regionId: string; moduleId: string } }) {
  return proxyToBackend(`/templates/${params.id}/regions/${params.regionId}/modules/${params.moduleId}`, { method: 'DELETE' });
}
