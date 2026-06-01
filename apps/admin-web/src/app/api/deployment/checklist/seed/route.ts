import { proxyToBackend } from '@/lib/server-api';
export async function POST() { return proxyToBackend('/deployment/checklist/seed', { method: 'POST' }); }
