import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBackend(`/documents/${params.id}/publish`, { method: 'POST' });
}
