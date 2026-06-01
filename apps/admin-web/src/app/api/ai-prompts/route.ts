import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.toString();
  return proxyToBackend(`/ai-prompts${search ? '?' + search : ''}`);
}
export async function POST(req: NextRequest) { const body = await req.json(); return proxyToBackend('/ai-prompts', { body, method: 'POST' }); }
