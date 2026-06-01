'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Issue {
  id: string;
  checkKey: string;
  category: string;
  severity: string;
  status: string;
  title: string;
  description: string | null;
  recommendation: string | null;
}

interface AuditDetail {
  id: string;
  auditType: string;
  status: string;
  score: number;
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
  criticalIssues: number;
  summaryJson: any;
  createdAt: string;
  issues: Issue[];
}

function AuditDetailContent({ user, auditId }: { user: AuthUser; auditId: string }) {
  const [audit, setAudit] = useState<AuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    apiClient<AuditDetail>(`/api/accessibility/audits/${auditId}`).then(setAudit).finally(() => setLoading(false));
  }, [auditId]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!audit) return <div className="text-destructive">Audit not found.</div>;

  const scoreColor = audit.score >= 80 ? 'text-emerald-600' : audit.score >= 60 ? 'text-amber-600' : 'text-destructive';
  const categories = [...new Set(audit.issues.map(i => i.category))];
  const filteredIssues = filter === 'all' ? audit.issues : audit.issues.filter(i => i.category === filter);

  const severityColors: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    LOW: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/accessibility"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
        <div>
          <h1 className="text-2xl font-semibold">{audit.auditType.replace('_', ' ')} Audit</h1>
          <p className="text-sm text-muted-foreground">{new Date(audit.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className={`text-3xl font-bold ${scoreColor}`}>{audit.score}%</p><p className="text-xs text-muted-foreground mt-1">Score</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-emerald-600">{audit.passedChecks}</p><p className="text-xs text-muted-foreground mt-1">Passed</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-amber-600">{audit.warningChecks}</p><p className="text-xs text-muted-foreground mt-1">Warnings</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-destructive">{audit.failedChecks}</p><p className="text-xs text-muted-foreground mt-1">Failed</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{audit.totalChecks}</p><p className="text-xs text-muted-foreground mt-1">Total Checks</p></CardContent></Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} className="text-xs">All ({audit.issues.length})</Button>
        {categories.map(cat => (
          <Button key={cat} variant={filter === cat ? 'default' : 'outline'} onClick={() => setFilter(cat)} className="text-xs">
            {cat} ({audit.issues.filter(i => i.category === cat).length})
          </Button>
        ))}
      </div>

      {/* Issues List */}
      <Card>
        <CardHeader><CardTitle className="text-base">Issues ({filteredIssues.length})</CardTitle><CardDescription>Issues and recommendations from this audit.</CardDescription></CardHeader>
        <CardContent>
          {filteredIssues.length === 0 ? (
            <div className="text-center py-8 text-emerald-600 flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8" />
              <p className="font-medium">No issues in this category!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="rounded-md border p-4">
                  <div className="flex items-start gap-3">
                    {issue.status === 'FAIL' ? <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" /> : <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{issue.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[issue.severity] || ''}`}>{issue.severity}</span>
                      </div>
                      {issue.description && <p className="text-sm text-muted-foreground">{issue.description}</p>}
                      {issue.recommendation && <p className="text-sm text-primary mt-2">→ {issue.recommendation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuditDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminPageShell sectionTitle="Audit Detail">
      {(user) => <AuditDetailContent user={user} auditId={params.id} />}
    </AdminPageShell>
  );
}
