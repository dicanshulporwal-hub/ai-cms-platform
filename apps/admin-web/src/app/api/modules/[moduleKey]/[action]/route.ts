import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function PATCH(req: NextRequest, { params }: { params: { moduleKey: string; action: string } }) {
  let body: unknown = undefined;
  try { body = await req.json(); } catch {}
  return proxyToBackend(`/modules/${params.moduleKey}/${params.action}`, { body, method: 'PATCH' });
}
