import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';
export async function GET(req: NextRequest) { const days = req.nextUrl.searchParams.get('days') || '30'; return proxyToBackend(`/analytics/overview?days=${days}`); }
