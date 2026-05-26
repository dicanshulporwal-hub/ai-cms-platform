import { proxyToBackend } from '@/lib/server-api';

export async function GET() {
  return proxyToBackend('/chatbot/settings');
}

export async function PUT(request: Request) {
  const body = await request.json();

  return proxyToBackend('/chatbot/settings', {
    body,
    method: 'PUT',
  });
}
