'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2, Play, Shield, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Summary {
  latestScore: number | null;
  latestAuditId: string | null;
  latestAuditDate: string | null;
  totalAudits: number;
  criticalIssues: number;
  totalIssues: number;
}

interface Audit {
  id: string;
  auditType: string;
  status: string;
  score: number;
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
  criticalIssues: number;
  createdAt: string;
  _count: { issues: number };
}

function AccessibilityContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [s, a] = await Promise.all([
        apiClient<Summary>('/api/accessibility/summary'),
        apiClient<Audit[]>('/api/accessibility/audits'),
      ]);
      setSummary(s);
      setAudits(a);
    } catch {}
    setLoading(false);
  }

  async function runFullSiteAudit() {
    setRunning(true);
    try {
      const audit = await apiClient<any>('/api/accessibility/audits/run-full-site', { method: 'POST' });
      router.push(`/accessibility/audits/${audit.id}`);
    } catch {}
    setRunning(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const scoreColor = (summary?.latestScore ?? 0) >= 80 ? 'text-emerald-600' : (summary?.latestScore ?? 0) >= 60 ? 'text-amber-600' : 'text-destructive';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Accessibility & GIGW Readiness</h1>
          <p className="mt-1 text-sm text-muted-foreground">Automated readiness checks for accessibility, UX4G/GIGW, and SEO.</p>
        </div>
        <Button onClick={runFullSiteAudit} disabled={running}>
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run Full Site Audit
        </Button>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <strong>Disclaimer:</strong> This module provides automated readiness checks only. It does not constitute official GIGW certification or full WCAG compliance validation.
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className={`text-3xl font-bold ${scoreColor}`}>{summary?.latestScore ?? '-'}%</p>
            <p className="text-xs text-muted-foreground mt-1">Latest Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{summary?.totalAudits ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Audits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-destructive">{summary?.criticalIssues ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Critical Issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-amber-600">{summary?.totalIssues ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audits */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Audits</CardTitle><CardDescription>Click an audit to view details and issues.</CardDescription></CardHeader>
        <CardContent>
          {audits.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No audits yet. Run your first audit above.</p>
          ) : (
            <div className="space-y-2">
              {audits.map((audit) => (
                <Link key={audit.id} href={`/accessibility/audits/${audit.id}`} className="block">
                  <div className="flex items-center gap-4 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${audit.score >= 80 ? 'bg-emerald-100' : audit.score >= 60 ? 'bg-amber-100' : 'bg-red-100'}`}>
                      {audit.score >= 80 ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : audit.score >= 60 ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{audit.auditType.replace('_', ' ')} Audit</p>
                      <p className="text-xs text-muted-foreground">{new Date(audit.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${audit.score >= 80 ? 'text-emerald-600' : audit.score >= 60 ? 'text-amber-600' : 'text-destructive'}`}>{audit.score}%</p>
                      <p className="text-xs text-muted-foreground">{audit.passedChecks}/{audit.totalChecks} passed</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AccessibilityPage() {
  return (
    <AdminPageShell sectionTitle="Accessibility">
      {(user) => <AccessibilityContent user={user} />}
    </AdminPageShell>
  );
}
