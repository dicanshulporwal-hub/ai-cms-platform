import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

function buildPath(params: { path: string[] }, searchParams: string) {
  const path = `/social-media/${params.path.join('/')}`;
  return searchParams ? `${path}?${searchParams}` : path;
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToBackend(buildPath(params, req.nextUrl.searchParams.toString()));
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const body = await req.json().catch(() => undefined);
  return proxyToBackend(buildPath(params, ''), { body, method: 'POST' });
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  const body = await req.json().catch(() => undefined);
  return proxyToBackend(buildPath(params, ''), { body, method: 'PUT' });
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToBackend(buildPath(params, ''), { method: 'DELETE' });
}
