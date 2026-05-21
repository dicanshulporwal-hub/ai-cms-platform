import { proxyToBackend } from '@/lib/server-api';

interface CategoryRouteContext {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: CategoryRouteContext) {
  const body = await request.json();

  return proxyToBackend(`/categories/${params.id}`, {
    body,
    method: 'PUT',
  });
}

export async function DELETE(
  _request: Request,
  { params }: CategoryRouteContext,
) {
  return proxyToBackend(`/categories/${params.id}`, {
    method: 'DELETE',
  });
}
