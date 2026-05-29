import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function POST(req: NextRequest, { params }: { params: { id: string; regionId: string } }) {
  const body = await req.json();
  return proxyToBackend(`/templates/${params.id}/regions/${params.regionId}/modules`, { body, method: 'POST' });
}
