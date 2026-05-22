import { proxyToBackend } from '@/lib/server-api';

interface WorkflowRouteContext {
  params: { id: string };
}

export async function POST(request: Request, { params }: WorkflowRouteContext) {
  const body = await request.json().catch(() => ({}));

  return proxyToBackend(`/workflow/pages/${params.id}/submit`, {
    body,
    method: 'POST',
  });
}
