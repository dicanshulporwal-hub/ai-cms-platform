import { proxyToBackend } from '@/lib/server-api';

const allowedActions = new Set([
  'generate-content',
  'rewrite-content',
  'summarize-content',
  'generate-faq',
  'generate-seo',
  'improve-seo',
  'generate-alt-text',
]);

export async function POST(
  request: Request,
  { params }: { params: { action: string } },
) {
  if (!allowedActions.has(params.action)) {
    return Response.json({ message: 'AI action not found.' }, { status: 404 });
  }

  const body = await request.json();

  return proxyToBackend(`/ai/${params.action}`, {
    body,
    method: 'POST',
  });
}
