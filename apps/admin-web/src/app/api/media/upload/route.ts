import { proxyFormDataToBackend } from '@/lib/server-api';

export async function POST(request: Request) {
  const formData = await request.formData();

  return proxyFormDataToBackend('/media/upload', formData);
}
