import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/server-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(`/roles/${params.id}`);
}
