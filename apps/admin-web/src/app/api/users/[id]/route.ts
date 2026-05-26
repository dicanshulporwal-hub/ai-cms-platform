import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(`/users/${params.id}`);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  return proxyToBackend(`/users/${params.id}`, { body, method: 'PUT' });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(`/users/${params.id}`, { method: 'DELETE' });
}
