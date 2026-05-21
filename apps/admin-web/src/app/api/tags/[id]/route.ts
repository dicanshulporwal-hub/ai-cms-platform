import { proxyToBackend } from '@/lib/server-api';

interface TagRouteContext {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: TagRouteContext) {
  const body = await request.json();

  return proxyToBackend(`/tags/${params.id}`, {
    body,
    method: 'PUT',
  });
}

export async function DELETE(_request: Request, { params }: TagRouteContext) {
  return proxyToBackend(`/tags/${params.id}`, {
    method: 'DELETE',
  });
}
