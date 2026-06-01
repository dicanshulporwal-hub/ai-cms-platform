import { proxyToBackend } from '@/lib/server-api';
export async function POST() { return proxyToBackend('/broken-links/scans/run', { method: 'POST' }); }
