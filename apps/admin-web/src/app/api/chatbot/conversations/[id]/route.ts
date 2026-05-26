import { proxyToBackend } from '@/lib/server-api';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(`/chatbot/conversations/${params.id}`);
}
