import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBackend(`/templates/import-html/jobs/${params.id}/convert`, { method: 'POST' });
}
