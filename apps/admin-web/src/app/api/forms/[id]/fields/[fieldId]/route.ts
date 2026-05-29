import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function PUT(req: NextRequest, { params }: { params: { id: string; fieldId: string } }) {
  const body = await req.json();
  return proxyToBackend(`/forms/${params.id}/fields/${params.fieldId}`, { body, method: 'PUT' });
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string; fieldId: string } }) {
  return proxyToBackend(`/forms/${params.id}/fields/${params.fieldId}`, { method: 'DELETE' });
}
