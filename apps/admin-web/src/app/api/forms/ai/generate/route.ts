import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend('/forms/ai/generate', { body, method: 'POST' });
}
