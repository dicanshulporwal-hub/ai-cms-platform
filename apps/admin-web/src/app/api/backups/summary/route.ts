import { proxyToBackend } from '@/lib/server-api';
export async function GET() { return proxyToBackend('/backup-manager/summary'); }
