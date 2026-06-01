import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function POST(_req: NextRequest, { params }: { params: { templateId: string } }) {
  return proxyToBackend(`/accessibility/audits/run-template/${params.templateId}`, { method: 'POST' });
}
