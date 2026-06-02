import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) { return proxyToBackend(`/announcements/${params.id}`); }
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) { const body = await req.json(); return proxyToBackend(`/announcements/${params.id}`, { body, method: 'PUT' }); }
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) { return proxyToBackend(`/announcements/${params.id}`, { method: 'DELETE' }); }
