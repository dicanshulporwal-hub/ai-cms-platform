import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBackend(`/templates/import-html/jobs/${params.id}`);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBackend(`/templates/import-html/jobs/${params.id}`, { method: 'DELETE' });
}
