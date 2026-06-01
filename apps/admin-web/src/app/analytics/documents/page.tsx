'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function DocumentAnalyticsContent({ user }: { user: AuthUser }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => { setLoading(true); apiClient<any>(`/api/analytics/content?days=${days}`).then(setData).finally(() => setLoading(false)); }, [days]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/analytics"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
          <div><h1 className="text-2xl font-semibold">Document Analytics</h1><p className="text-sm text-muted-foreground">Document views and download metrics.</p></div>
        </div>
        <div className="flex gap-2">{[7, 30, 90].map(d => <Button key={d} variant={days === d ? 'default' : 'outline'} onClick={() => setDays(d)} className="text-xs">{d}d</Button>)}</div>
      </div>

      <Card>
        <CardHeader><div className="flex items-center gap-2"><Download className="h-4 w-4 text-emerald-600" /><CardTitle className="text-base">Top Downloaded Documents</CardTitle></div><CardDescription>Most downloaded documents in the last {days} days</CardDescription></CardHeader>
        <CardContent>
          {!data?.topDownloads?.length ? <p className="text-sm text-muted-foreground text-center py-8">No document downloads tracked yet.</p> : (
            <div className="space-y-3">
              {data.topDownloads.map((d: any, i: number) => (
                <div key={i} className="flex items-center gap-3 rounded-md border p-3">
                  <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium">{d.title || 'Untitled'}</span>
                  <span className="text-sm font-bold text-emerald-600">{d.downloads} downloads</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DocumentAnalyticsPage() {
  return <AdminPageShell sectionTitle="Document Analytics">{(user) => <DocumentAnalyticsContent user={user} />}</AdminPageShell>;
}
