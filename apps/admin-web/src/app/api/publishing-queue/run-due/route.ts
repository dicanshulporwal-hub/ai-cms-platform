import { proxyToBackend } from '@/lib/server-api';
export async function POST() { return proxyToBackend('/publishing-queue/run-due', { method: 'POST' }); }
