'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function SearchAnalyticsContent({ user }: { user: AuthUser }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => { setLoading(true); apiClient<any>(`/api/analytics/search?days=${days}`).then(setData).finally(() => setLoading(false)); }, [days]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/analytics"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
          <div><h1 className="text-2xl font-semibold">Search Analytics</h1><p className="text-sm text-muted-foreground">What visitors are searching for on your site.</p></div>
        </div>
        <div className="flex gap-2">{[7, 30, 90].map(d => <Button key={d} variant={days === d ? 'default' : 'outline'} onClick={() => setDays(d)} className="text-xs">{d}d</Button>)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{data?.totalSearches ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Total Searches</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{data?.topQueries?.length ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Unique Queries</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{days}d</p><p className="text-xs text-muted-foreground mt-1">Period</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><div className="flex items-center gap-2"><Search className="h-4 w-4" /><CardTitle className="text-base">Top Search Queries</CardTitle></div><CardDescription>Most searched terms by visitors</CardDescription></CardHeader>
        <CardContent>
          {!data?.topQueries?.length ? <p className="text-sm text-muted-foreground text-center py-8">No search data yet. Searches will appear here once visitors use the search feature.</p> : (
            <div className="space-y-2">
              {data.topQueries.map((q: any, i: number) => (
                <div key={i} className="flex items-center gap-3 rounded-md border p-3">
                  <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium">{q.query}</span>
                  <span className="text-sm font-bold text-primary">{q.count} searches</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SearchAnalyticsPage() {
  return <AdminPageShell sectionTitle="Search Analytics">{(user) => <SearchAnalyticsContent user={user} />}</AdminPageShell>;
}
