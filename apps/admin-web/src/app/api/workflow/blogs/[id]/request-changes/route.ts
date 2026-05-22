import { proxyToBackend } from '@/lib/server-api';

interface WorkflowRouteContext {
  params: { id: string };
}

export async function POST(request: Request, { params }: WorkflowRouteContext) {
  const body = await request.json().catch(() => ({}));

  return proxyToBackend(`/workflow/blogs/${params.id}/request-changes`, {
    body,
    method: 'POST',
  });
}
