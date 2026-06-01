import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) { return proxyToBackend(`/ai-prompts/${params.id}`); }
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) { return proxyToBackend(`/ai-prompts/${params.id}`, { method: 'DELETE' }); }
