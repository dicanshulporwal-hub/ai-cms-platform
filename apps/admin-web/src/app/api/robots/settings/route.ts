import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET() { return proxyToBackend('/robots/settings'); }
export async function PUT(req: NextRequest) { const body = await req.json(); return proxyToBackend('/robots/settings', { body, method: 'PUT' }); }
