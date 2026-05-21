import { proxyToBackend } from '@/lib/server-api';

interface PageRouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: PageRouteContext) {
  return proxyToBackend(`/pages/${params.id}`);
}

export async function PUT(request: Request, { params }: PageRouteContext) {
  const body = await request.json();

  return proxyToBackend(`/pages/${params.id}`, {
    body,
    method: 'PUT',
  });
}

export async function DELETE(_request: Request, { params }: PageRouteContext) {
  return proxyToBackend(`/pages/${params.id}`, {
    method: 'DELETE',
  });
}
