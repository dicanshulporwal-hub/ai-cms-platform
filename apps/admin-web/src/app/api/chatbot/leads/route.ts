import { proxyToBackend } from '@/lib/server-api';

export async function GET(request: Request) {
  const url = new URL(request.url);

  return proxyToBackend(`/chatbot/leads${url.search}`);
}
