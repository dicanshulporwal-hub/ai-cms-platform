import { proxyFormDataToBackend } from '@/lib/server-api';

export async function POST(request: Request) {
  const formData = await request.formData();
  return proxyFormDataToBackend('/templates/import-html/upload', formData);
}
