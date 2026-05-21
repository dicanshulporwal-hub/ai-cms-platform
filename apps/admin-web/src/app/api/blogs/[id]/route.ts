import { proxyToBackend } from '@/lib/server-api';

interface BlogRouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: BlogRouteContext) {
  return proxyToBackend(`/blogs/${params.id}`);
}

export async function PUT(request: Request, { params }: BlogRouteContext) {
  const body = await request.json();

  return proxyToBackend(`/blogs/${params.id}`, {
    body,
    method: 'PUT',
  });
}

export async function DELETE(_request: Request, { params }: BlogRouteContext) {
  return proxyToBackend(`/blogs/${params.id}`, {
    method: 'DELETE',
  });
}
