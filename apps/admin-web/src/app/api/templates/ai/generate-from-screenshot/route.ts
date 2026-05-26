import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend('/templates/ai/generate-from-screenshot', { body, method: 'POST' });
}
