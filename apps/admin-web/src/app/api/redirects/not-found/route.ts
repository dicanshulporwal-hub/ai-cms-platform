import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';
export async function GET(req: NextRequest) { const status = req.nextUrl.searchParams.get('status') || ''; return proxyToBackend(`/redirects/404${status ? '?status=' + status : ''}`); }
