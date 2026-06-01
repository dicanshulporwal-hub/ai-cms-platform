'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2, Play, Shield, XCircle } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTemplate } from '@/hooks/use-templates';
import { TemplateGate } from '@/components/templates/template-gate';
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

interface AuditResult {
  id: string;
  score: number;
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
  criticalIssues: number;
  createdAt: string;
  issues: Issue[];
}

function AccessibilityContent({ user, templateId }: { user: AuthUser; templateId: string }) {
  const { data: template } = useTemplate(templateId);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  async function runAudit() {
    setRunning(true);
    try {
      const result = await apiClient<AuditResult>(`/api/accessibility/audits/run-template/${templateId}`, { method: 'POST' });
      setAudit(result);
    } catch {}
    setRunning(false);
  }

  const scoreColor = (audit?.score ?? 0) >= 80 ? 'text-emerald-600' : (audit?.score ?? 0) >= 60 ? 'text-amber-600' : 'text-destructive';
  const scoreBg = (audit?.score ?? 0) >= 80 ? 'bg-emerald-50 border-emerald-200' : (audit?.score ?? 0) >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  const categories = audit ? [...new Set(audit.issues.map(i => i.category))] : [];
  const filteredIssues = audit ? (filter === 'all' ? audit.issues : audit.issues.filter(i => i.category === filter)) : [];

  const severityColors: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    LOW: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/templates"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
          <div>
            <h1 className="text-2xl font-semibold">Accessibility: {template?.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Run accessibility and GIGW readiness checks on this template.</p>
          </div>
        </div>
        <Button onClick={runAudit} disabled={running}>
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run Accessibility Audit
        </Button>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <strong>Note:</strong> This provides automated readiness checks only. It does not constitute official GIGW certification or full WCAG compliance validation.
      </div>

      {!audit && !running && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No Audit Run Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Click "Run Accessibility Audit" to check this template for accessibility issues, GIGW readiness, and SEO basics.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {audit && (
        <>
          {/* Score Overview */}
          <Card className={scoreBg}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                <div>
                  <p className={`text-4xl font-bold ${scoreColor}`}>{audit.score}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{audit.totalChecks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Checks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{audit.passedChecks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Passed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{audit.warningChecks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Warnings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{audit.failedChecks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Failed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{audit.criticalIssues}</p>
                  <p className="text-xs text-muted-foreground mt-1">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          {audit.issues.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} className="text-xs">
                All Issues ({audit.issues.length})
              </Button>
              {categories.map(cat => (
                <Button key={cat} variant={filter === cat ? 'default' : 'outline'} onClick={() => setFilter(cat)} className="text-xs">
                  {cat} ({audit.issues.filter(i => i.category === cat).length})
                </Button>
              ))}
            </div>
          )}

          {/* Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {filteredIssues.length === 0 ? 'All Checks Passed!' : `Issues (${filteredIssues.length})`}
              </CardTitle>
              <CardDescription>
                {filteredIssues.length === 0
                  ? 'No issues found in this category. Great job!'
                  : 'Review each issue and follow the recommendations to improve your score.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredIssues.length === 0 ? (
                <div className="text-center py-8 text-emerald-600 flex flex-col items-center gap-2">
                  <CheckCircle className="h-10 w-10" />
                  <p className="font-medium">All checks passed!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIssues.map((issue) => (
                    <div key={issue.id} className="rounded-md border p-4">
                      <div className="flex items-start gap-3">
                        {issue.status === 'FAIL' ? (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{issue.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[issue.severity] || 'bg-gray-100'}`}>
                              {issue.severity}
                            </span>
                            <span className="text-xs text-muted-foreground">{issue.category}</span>
                          </div>
                          {issue.description && <p className="text-sm text-muted-foreground">{issue.description}</p>}
                          {issue.recommendation && (
                            <p className="text-sm text-primary mt-2 flex items-start gap-1">
                              <span>→</span> {issue.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function TemplateAccessibilityPage({ params }: { params: { id: string } }) {
  return (
    <AdminPageShell sectionTitle="Template Accessibility">
      {(user) => (
        <TemplateGate>
          <AccessibilityContent user={user} templateId={params.id} />
        </TemplateGate>
      )}
    </AdminPageShell>
  );
}
