import { proxyToBackend } from '@/lib/server-api';

interface BlogActionRouteContext {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: BlogActionRouteContext) {
  return proxyToBackend(`/blogs/${params.id}/submit`, {
    method: 'POST',
  });
}
