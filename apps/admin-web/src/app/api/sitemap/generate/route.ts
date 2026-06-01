import { proxyToBackend } from '@/lib/server-api';

export async function POST() { return proxyToBackend('/sitemap/generate', { method: 'POST' }); }
