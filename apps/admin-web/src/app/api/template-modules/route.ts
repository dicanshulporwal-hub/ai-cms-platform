import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET() { return proxyToBackend('/template-modules'); }
export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend('/template-modules', { body, method: 'POST' });
}
