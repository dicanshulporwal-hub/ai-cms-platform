import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  return proxyToBackend(`/templates/import-html/jobs/${params.id}/save-as-template`, { body, method: 'POST' });
}
