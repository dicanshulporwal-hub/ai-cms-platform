'use client';

import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useComplianceReport, useRunComplianceCheck, useTemplate } from '@/hooks/use-templates';
import { TemplateGate } from '@/components/templates/template-gate';
import type { AuthUser } from '@/types/auth';

const statusIcons = { PASS: CheckCircle, WARNING: AlertTriangle, FAIL: XCircle, NOT_CHECKED: AlertTriangle };
const statusColors = { PASS: 'text-emerald-600', WARNING: 'text-amber-600', FAIL: 'text-destructive', NOT_CHECKED: 'text-muted-foreground' };

function ComplianceContent({ user, templateId }: { user: AuthUser; templateId: string }) {
  const { data: template } = useTemplate(templateId);
  const { data: report, isLoading, refetch } = useComplianceReport(templateId);
  const runCheckMutation = useRunComplianceCheck();

  async function handleRerun() {
    await runCheckMutation.mutateAsync(templateId);
    refetch();
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const checks = (report as any)?.checks ?? [];
  const categories = [...new Set(checks.map((c: any) => c.checkCategory))];

  return (
    <div className="space-y-6">
      <Link href="/templates"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Compliance Report: {template?.name ?? ''}</h1>
          <p className="mt-1 text-sm text-muted-foreground">UX4G/GIGW readiness assessment.</p>
        </div>
        <Button onClick={handleRerun} disabled={runCheckMutation.isPending}>{runCheckMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Re-run Check</Button>
      </div>

      {report && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="pt-6 text-center"><p className="text-4xl font-bold">{(report as any).score}%</p><p className="text-sm text-muted-foreground">Score</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-4xl font-bold text-destructive">{(report as any).criticalFailures}</p><p className="text-sm text-muted-foreground">Critical Failures</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-4xl font-bold text-amber-600">{(report as any).warnings}</p><p className="text-sm text-muted-foreground">Warnings</p></CardContent></Card>
        </div>
      )}

      {categories.map((cat) => (
        <Card key={cat as string}>
          <CardHeader><CardTitle className="text-base">{cat as string}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {checks.filter((c: any) => c.checkCategory === cat).map((check: any) => {
              const Icon = statusIcons[check.status as keyof typeof statusIcons] ?? AlertTriangle;
              const color = statusColors[check.status as keyof typeof statusColors] ?? '';
              return (
                <div key={check.checkKey} className="flex items-start gap-3 rounded-md border p-3">
                  <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{check.checkTitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{check.message}</p>
                    {check.status !== 'PASS' && <p className="text-xs text-primary mt-1">→ {check.recommendation}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${check.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : check.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>{check.severity}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <p className="text-xs text-muted-foreground italic">Disclaimer: This is an automated readiness check and not official GIGW certification.</p>
    </div>
  );
}

export default function CompliancePage({ params }: { params: { id: string } }) {
  return (
    <AdminPageShell sectionTitle="Compliance Report">
      {(user) => (
        <TemplateGate>
          <ComplianceContent user={user} templateId={params.id} />
        </TemplateGate>
      )}
    </AdminPageShell>
  );
}
