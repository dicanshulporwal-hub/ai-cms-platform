import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';
export async function GET(req: NextRequest) { const search = req.nextUrl.searchParams.toString(); return proxyToBackend(`/webhooks/deliveries${search ? '?' + search : ''}`); }
