import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET() { return proxyToBackend('/structured-data/settings'); }
export async function PUT(req: NextRequest) { const body = await req.json(); return proxyToBackend('/structured-data/settings', { body, method: 'PUT' }); }
