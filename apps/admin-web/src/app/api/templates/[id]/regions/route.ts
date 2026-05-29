import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBackend(`/templates/${params.id}/regions`);
}
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  return proxyToBackend(`/templates/${params.id}/regions`, { body, method: 'POST' });
}
