import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';
export async function GET(req: NextRequest) { const y = req.nextUrl.searchParams.get('year') || ''; const m = req.nextUrl.searchParams.get('month') || ''; return proxyToBackend(`/content-calendar/month?year=${y}&month=${m}`); }
