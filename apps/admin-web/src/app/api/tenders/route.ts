import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';
export async function GET(req: NextRequest) { const s = req.nextUrl.searchParams.toString(); return proxyToBackend(`/tenders${s ? '?' + s : ''}`); }
export async function POST(req: NextRequest) { const body = await req.json(); return proxyToBackend('/tenders', { body, method: 'POST' }); }
