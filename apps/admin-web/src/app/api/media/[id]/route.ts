import { proxyToBackend } from '@/lib/server-api';

interface MediaRouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: MediaRouteContext) {
  return proxyToBackend(`/media/${params.id}`);
}

export async function PUT(request: Request, { params }: MediaRouteContext) {
  const body = await request.json();

  return proxyToBackend(`/media/${params.id}`, {
    body,
    method: 'PUT',
  });
}

export async function DELETE(
  _request: Request,
  { params }: MediaRouteContext,
) {
  return proxyToBackend(`/media/${params.id}`, {
    method: 'DELETE',
  });
}
