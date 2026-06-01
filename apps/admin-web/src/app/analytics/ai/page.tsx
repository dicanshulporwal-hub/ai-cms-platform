'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Bot, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function AIAnalyticsContent({ user }: { user: AuthUser }) {
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
          <div><h1 className="text-2xl font-semibold">AI Usage Analytics</h1><p className="text-sm text-muted-foreground">AI provider usage, requests, and cost tracking.</p></div>
        </div>
        <div className="flex gap-2">{[7, 30, 90].map(d => <Button key={d} variant={days === d ? 'default' : 'outline'} onClick={() => setDays(d)} className="text-xs">{d}d</Button>)}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><Sparkles className="h-6 w-6 mx-auto text-purple-600 mb-2" /><p className="text-3xl font-bold">{overview?.aiRequests ?? 0}</p><p className="text-xs text-muted-foreground mt-1">AI Requests</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><Bot className="h-6 w-6 mx-auto text-blue-600 mb-2" /><p className="text-3xl font-bold">-</p><p className="text-xs text-muted-foreground mt-1">Tokens Used</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><Sparkles className="h-6 w-6 mx-auto text-emerald-600 mb-2" /><p className="text-3xl font-bold">-</p><p className="text-xs text-muted-foreground mt-1">Est. Cost</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">AI Usage Details</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            AI usage data is tracked via the AI Usage Log module. Visit <Link href="/ai/usage" className="text-primary underline">AI Usage</Link> for detailed provider/model breakdown.
            Analytics events for AI requests will appear here as the AI features are used.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AIAnalyticsPage() {
  return <AdminPageShell sectionTitle="AI Analytics">{(user) => <AIAnalyticsContent user={user} />}</AdminPageShell>;
}
