import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function PUT(req: NextRequest, { params }: { params: { imageId: string } }) {
  const body = await req.json();
  return proxyToBackend(`/galleries/images/${params.imageId}`, { body, method: 'PUT' });
}

export async function DELETE(_req: NextRequest, { params }: { params: { imageId: string } }) {
  return proxyToBackend(`/galleries/images/${params.imageId}`, { method: 'DELETE' });
}
