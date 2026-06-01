'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, ExternalLink, Link2, Loader2, Play, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Summary { latestScan: { id: string; score: number; brokenLinks: number; totalLinks: number; date: string } | null; totalScans: number; openIssues: number; criticalIssues: number; }
interface Scan { id: string; scanType: string; status: string; totalLinksScanned: number; brokenLinksFound: number; warningLinksFound: number; createdAt: string; completedAt: string | null; _count: { issues: number }; }
interface Issue { id: string; sourceType: string; sourceTitle: string | null; sourceUrl: string | null; linkUrl: string; linkText: string | null; linkType: string; issueType: string; statusCode: number | null; severity: string; status: string; recommendation: string | null; }

function BrokenLinksContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [s, sc, iss] = await Promise.all([
        apiClient<Summary>('/api/broken-links/summary'),
        apiClient<Scan[]>('/api/broken-links/scans'),
        apiClient<Issue[]>('/api/broken-links/issues'),
      ]);
      setSummary(s); setScans(sc); setIssues(iss);
    } catch {}
    setLoading(false);
  }

  async function runScan() {
    setRunning(true);
    try {
      await apiClient('/api/broken-links/scans/run', { method: 'POST' });
      await loadData();
    } catch {}
    setRunning(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const severityColors: Record<string, string> = { CRITICAL: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700', MEDIUM: 'bg-amber-100 text-amber-700', LOW: 'bg-gray-100 text-gray-700' };
  const issueTypeLabels: Record<string, string> = { NOT_FOUND: '404 Not Found', SERVER_ERROR: 'Server Error', TIMEOUT: 'Timeout', REDIRECT: 'Redirect', UNPUBLISHED_CONTENT: 'Unpublished', DISABLED_MODULE: 'Module Disabled', MISSING_MEDIA: 'Missing Media', BLOCKED: 'Blocked' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Broken Link Checker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Scan content for broken links, missing images, and URL issues.</p>
        </div>
        <Button onClick={runScan} disabled={running}>
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run Full Scan
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className={`text-3xl font-bold ${(summary?.latestScan?.score ?? 100) >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{summary?.latestScan?.score ?? '-'}%</p><p className="text-xs text-muted-foreground mt-1">Link Health</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-destructive">{summary?.openIssues ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Open Issues</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-700">{summary?.criticalIssues ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Critical</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{summary?.totalScans ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Total Scans</p></CardContent></Card>
      </div>

      {/* Issues */}
      <Card>
        <CardHeader><CardTitle className="text-base">Open Issues ({issues.length})</CardTitle><CardDescription>Broken links and URL issues found in your content.</CardDescription></CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <div className="text-center py-8 text-emerald-600 flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8" />
              <p className="font-medium">No broken links found!</p>
              <p className="text-xs text-muted-foreground">Run a scan to check for issues.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.slice(0, 20).map(issue => (
                <div key={issue.id} className="rounded-md border p-3">
                  <div className="flex items-start gap-3">
                    {issue.severity === 'CRITICAL' || issue.severity === 'HIGH' ? <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /> : <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[issue.severity] || ''}`}>{issue.severity}</span>
                        <span className="text-xs text-muted-foreground">{issueTypeLabels[issue.issueType] || issue.issueType}</span>
                        <span className="text-xs text-muted-foreground">• {issue.linkType}</span>
                        {issue.statusCode && <span className="text-xs text-muted-foreground">• HTTP {issue.statusCode}</span>}
                      </div>
                      <p className="text-sm font-mono text-destructive truncate mt-1">{issue.linkUrl}</p>
                      {issue.sourceTitle && <p className="text-xs text-muted-foreground mt-1">Found in: {issue.sourceTitle} ({issue.sourceType})</p>}
                      {issue.recommendation && <p className="text-xs text-primary mt-1">→ {issue.recommendation}</p>}
                    </div>
                  </div>
                </div>
              ))}
              {issues.length > 20 && <p className="text-center text-xs text-muted-foreground">Showing 20 of {issues.length} issues.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans */}
      {scans.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Scans</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scans.slice(0, 5).map(scan => (
                <div key={scan.id} className="flex items-center gap-3 rounded-md border p-3">
                  <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{scan.scanType.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{new Date(scan.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p>{scan.totalLinksScanned} links scanned</p>
                    <p className={scan.brokenLinksFound > 0 ? 'text-destructive' : 'text-emerald-600'}>{scan.brokenLinksFound} broken</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${scan.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : scan.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{scan.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function BrokenLinksPage() {
  return <AdminPageShell sectionTitle="Broken Links">{(user) => <BrokenLinksContent user={user} />}</AdminPageShell>;
}
