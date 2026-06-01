import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';
export async function GET() { return proxyToBackend('/webhooks'); }
export async function POST(req: NextRequest) { const body = await req.json(); return proxyToBackend('/webhooks', { body, method: 'POST' }); }
