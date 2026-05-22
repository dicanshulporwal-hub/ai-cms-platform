import { proxyToBackend } from '@/lib/server-api';

interface NotificationReadRouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(
  _request: Request,
  { params }: NotificationReadRouteContext,
) {
  return proxyToBackend(`/notifications/${params.id}/read`, {
    method: 'PATCH',
  });
}
