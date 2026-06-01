'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Loader2, Newspaper, Download } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function ContentAnalyticsContent({ user }: { user: AuthUser }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => { apiClient<any>(`/api/analytics/content?days=${days}`).then(setData).finally(() => setLoading(false)); }, [days]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/analytics"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
          <h1 className="text-2xl font-semibold">Content Performance</h1>
        </div>
        <div className="flex gap-2">{[7, 30, 90].map(d => <Button key={d} variant={days === d ? 'default' : 'outline'} onClick={() => { setDays(d); setLoading(true); }} className="text-xs">{d}d</Button>)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /><CardTitle className="text-base">Top Pages</CardTitle></div></CardHeader>
          <CardContent>
            {data?.topPages?.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No page views yet</p> : (
              <div className="space-y-3">{data?.topPages?.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm"><span className="truncate flex-1">{i + 1}. {p.title || 'Untitled'}</span><span className="font-bold text-blue-600">{p.views}</span></div>
              ))}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="flex items-center gap-2"><Newspaper className="h-4 w-4 text-purple-600" /><CardTitle className="text-base">Top Blogs</CardTitle></div></CardHeader>
          <CardContent>
            {data?.topBlogs?.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No blog views yet</p> : (
              <div className="space-y-3">{data?.topBlogs?.map((b: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm"><span className="truncate flex-1">{i + 1}. {b.title || 'Untitled'}</span><span className="font-bold text-purple-600">{b.views}</span></div>
              ))}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="flex items-center gap-2"><Download className="h-4 w-4 text-emerald-600" /><CardTitle className="text-base">Top Downloads</CardTitle></div></CardHeader>
          <CardContent>
            {data?.topDownloads?.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No downloads yet</p> : (
              <div className="space-y-3">{data?.topDownloads?.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm"><span className="truncate flex-1">{i + 1}. {d.title || 'Untitled'}</span><span className="font-bold text-emerald-600">{d.downloads}</span></div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ContentAnalyticsPage() {
  return <AdminPageShell sectionTitle="Content Analytics">{(user) => <ContentAnalyticsContent user={user} />}</AdminPageShell>;
}
