'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Bot, Download, Eye, FileText, Loader2, MessageCircle, Newspaper, Search } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Overview {
  totalEvents: number;
  pageViews: number;
  blogViews: number;
  docDownloads: number;
  searchQueries: number;
  formSubmissions: number;
  chatbotMessages: number;
  aiRequests: number;
  uniqueVisitors: number;
  days: number;
}

interface TopContent {
  topPages: { id: string; title: string; views: number }[];
  topBlogs: { id: string; title: string; views: number }[];
  topDownloads: { id: string; title: string; downloads: number }[];
}

function AnalyticsContent({ user }: { user: AuthUser }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [content, setContent] = useState<TopContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => { loadData(); }, [days]);

  async function loadData() {
    setLoading(true);
    try {
      const [o, c] = await Promise.all([
        apiClient<Overview>(`/api/analytics/overview?days=${days}`),
        apiClient<TopContent>(`/api/analytics/content?days=${days}`),
      ]);
      setOverview(o);
      setContent(c);
    } catch {}
    setLoading(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Website engagement and content performance.</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <Button key={d} variant={days === d ? 'default' : 'outline'} onClick={() => setDays(d)} className="text-xs">
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MetricCard icon={Eye} label="Page Views" value={overview?.pageViews ?? 0} />
        <MetricCard icon={Newspaper} label="Blog Views" value={overview?.blogViews ?? 0} />
        <MetricCard icon={Download} label="Downloads" value={overview?.docDownloads ?? 0} />
        <MetricCard icon={Search} label="Searches" value={overview?.searchQueries ?? 0} />
        <MetricCard icon={FileText} label="Form Submissions" value={overview?.formSubmissions ?? 0} />
        <MetricCard icon={MessageCircle} label="Chatbot Messages" value={overview?.chatbotMessages ?? 0} />
        <MetricCard icon={Bot} label="AI Requests" value={overview?.aiRequests ?? 0} />
        <MetricCard icon={Eye} label="Unique Visitors" value={overview?.uniqueVisitors ?? 0} />
        <MetricCard icon={BarChart3} label="Total Events" value={overview?.totalEvents ?? 0} />
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Top Pages</CardTitle><CardDescription>Most viewed pages</CardDescription></CardHeader>
          <CardContent>
            {content?.topPages.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p> : (
              <div className="space-y-2">
                {content?.topPages.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                    <span className="flex-1 truncate">{p.title || p.id}</span>
                    <span className="font-medium">{p.views}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Blogs</CardTitle><CardDescription>Most viewed blog posts</CardDescription></CardHeader>
          <CardContent>
            {content?.topBlogs.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p> : (
              <div className="space-y-2">
                {content?.topBlogs.map((b, i) => (
                  <div key={b.id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                    <span className="flex-1 truncate">{b.title || b.id}</span>
                    <span className="font-medium">{b.views}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Downloads</CardTitle><CardDescription>Most downloaded documents</CardDescription></CardHeader>
          <CardContent>
            {content?.topDownloads.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p> : (
              <div className="space-y-2">
                {content?.topDownloads.map((d, i) => (
                  <div key={d.id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                    <span className="flex-1 truncate">{d.title || d.id}</span>
                    <span className="font-medium">{d.downloads}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xl font-bold">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  return <AdminPageShell sectionTitle="Analytics">{(user) => <AnalyticsContent user={user} />}</AdminPageShell>;
}
