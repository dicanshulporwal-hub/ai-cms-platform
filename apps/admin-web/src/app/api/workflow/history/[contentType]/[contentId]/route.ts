import { proxyToBackend } from '@/lib/server-api';

interface WorkflowHistoryRouteContext {
  params: {
    contentId: string;
    contentType: string;
  };
}

export async function GET(
  _request: Request,
  { params }: WorkflowHistoryRouteContext,
) {
  return proxyToBackend(
    `/workflow/history/${params.contentType}/${params.contentId}`,
  );
}
