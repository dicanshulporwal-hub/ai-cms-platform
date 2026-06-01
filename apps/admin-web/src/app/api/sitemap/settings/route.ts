import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET() { return proxyToBackend('/sitemap/settings'); }
export async function PUT(req: NextRequest) { const body = await req.json(); return proxyToBackend('/sitemap/settings', { body, method: 'PUT' }); }
