'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface NotFoundEntry { id: string; path: string; hitCount: number; lastSeenAt: string; status: string; referrer: string | null; suggestedTargetUrl: string | null; }

function NotFoundContent({ user }: { user: AuthUser }) {
  const [entries, setEntries] = useState<NotFoundEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { apiClient<NotFoundEntry[]>('/api/redirects/not-found').then(setEntries).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const statusColors: Record<string, string> = { NF_OPEN: 'bg-amber-100 text-amber-700', NF_IGNORED: 'bg-gray-100 text-gray-500', NF_REDIRECT_CREATED: 'bg-emerald-100 text-emerald-700', NF_RESOLVED: 'bg-blue-100 text-blue-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/seo/redirects"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
        <div><h1 className="text-2xl font-semibold">404 Logs</h1><p className="text-sm text-muted-foreground">Pages visitors tried to access that don't exist.</p></div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Not Found Paths ({entries.length})</CardTitle></CardHeader>
        <CardContent>
          {entries.length === 0 ? <p className="text-center py-8 text-muted-foreground">No 404 errors logged yet.</p> : (
            <div className="space-y-2">
              {entries.map(e => (
                <div key={e.id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded flex-1 truncate">{e.path}</code>
                  <span className="text-xs text-muted-foreground">{e.hitCount} hits</span>
                  <span className="text-xs text-muted-foreground">{new Date(e.lastSeenAt).toLocaleDateString()}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[e.status] || ''}`}>{e.status.replace('NF_', '')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NotFoundPage() {
  return <AdminPageShell sectionTitle="404 Logs">{(user) => <NotFoundContent user={user} />}</AdminPageShell>;
}
