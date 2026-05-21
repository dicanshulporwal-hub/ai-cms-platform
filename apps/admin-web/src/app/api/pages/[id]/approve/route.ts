import { proxyToBackend } from '@/lib/server-api';

interface PageActionRouteContext {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: PageActionRouteContext) {
  return proxyToBackend(`/pages/${params.id}/approve`, {
    method: 'POST',
  });
}
