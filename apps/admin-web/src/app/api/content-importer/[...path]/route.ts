import { NextRequest } from 'next/server';
import { proxyFormDataToBackend, proxyToBackend } from '@/lib/server-api';

function buildPath(params: { path: string[] }, searchParams: string) {
  const path = `/content-importer/${params.path.join('/')}`;
  return searchParams ? `${path}?${searchParams}` : path;
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToBackend(buildPath(params, req.nextUrl.searchParams.toString()));
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    return proxyFormDataToBackend(buildPath(params, ''), await req.formData());
  }
  const body = await req.json().catch(() => undefined);
  return proxyToBackend(buildPath(params, ''), { body, method: 'POST' });
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  const body = await req.json().catch(() => undefined);
  return proxyToBackend(buildPath(params, ''), { body, method: 'PUT' });
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const body = await req.json().catch(() => undefined);
  return proxyToBackend(buildPath(params, ''), { body, method: 'PATCH' });
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToBackend(buildPath(params, ''), { method: 'DELETE' });
}
