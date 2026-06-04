import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET() { return proxyToBackend('/scheme-service-categories'); }
export async function POST(req: NextRequest) { const body = await req.json(); return proxyToBackend('/scheme-service-categories', { body, method: 'POST' }); }
