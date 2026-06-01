import { proxyToBackend } from '@/lib/server-api';
export async function POST() { return proxyToBackend('/ai-prompts/seed', { method: 'POST' }); }
