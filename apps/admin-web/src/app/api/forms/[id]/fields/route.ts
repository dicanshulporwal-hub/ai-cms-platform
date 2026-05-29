import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBackend(`/forms/${params.id}/fields`);
}
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  return proxyToBackend(`/forms/${params.id}/fields`, { body, method: 'POST' });
}
