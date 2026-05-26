import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBackend(`/templates/${params.id}/run-compliance-check`, { method: 'POST' });
}
