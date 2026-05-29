import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) { return proxyToBackend(`/faqs/${params.id}`); }
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) { const body = await req.json(); return proxyToBackend(`/faqs/${params.id}`, { body, method: 'PUT' }); }
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) { return proxyToBackend(`/faqs/${params.id}`, { method: 'DELETE' }); }
