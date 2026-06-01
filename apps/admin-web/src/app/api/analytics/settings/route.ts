import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';
export async function GET() { return proxyToBackend('/analytics/settings'); }
export async function PUT(req: NextRequest) { const body = await req.json(); return proxyToBackend('/analytics/settings', { body, method: 'PUT' }); }
