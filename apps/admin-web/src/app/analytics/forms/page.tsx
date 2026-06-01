'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function FormAnalyticsContent({ user }: { user: AuthUser }) {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => { setLoading(true); apiClient<any>(`/api/analytics/overview?days=${days}`).then(setOverview).finally(() => setLoading(false)); }, [days]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/analytics"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
          <div><h1 className="text-2xl font-semibold">Form Analytics</h1><p className="text-sm text-muted-foreground">Form views and submission metrics.</p></div>
        </div>
        <div className="flex gap-2">{[7, 30, 90].map(d => <Button key={d} variant={days === d ? 'default' : 'outline'} onClick={() => setDays(d)} className="text-xs">{d}d</Button>)}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{overview?.formSubmissions ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Form Submissions</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{days}d</p><p className="text-xs text-muted-foreground mt-1">Period</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Form Performance</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-8">Form submission data will appear here as visitors submit forms on the public website.</p></CardContent>
      </Card>
    </div>
  );
}

export default function FormAnalyticsPage() {
  return <AdminPageShell sectionTitle="Form Analytics">{(user) => <FormAnalyticsContent user={user} />}</AdminPageShell>;
}
