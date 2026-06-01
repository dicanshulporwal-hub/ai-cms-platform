'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, CheckCircle, Code, Eye, Loader2, Monitor, Save, Smartphone, Tablet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface ImportJob {
  id: string;
  importType: string;
  status: string;
  sourceUrl: string | null;
  licenseName: string | null;
  licenseUrl: string | null;
  attributionText: string | null;
  detectedRegionsJson: any[] | null;
  convertedHtml: string | null;
  convertedCss: string | null;
  generatedTemplateJson: any | null;
  warningsJson: any[] | null;
  errorMessage: string | null;
}

type ViewMode = 'preview' | 'regions' | 'json';
type Viewport = 'desktop' | 'tablet' | 'mobile';

function ReviewContent({ user, jobId }: { user: AuthUser; jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<ImportJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [viewport, setViewport] = useState<Viewport>('desktop');

  useEffect(() => {
    loadJob();
  }, [jobId]);

  async function loadJob() {
    try {
      const data = await apiClient<ImportJob>(`/api/templates/import-html/jobs/${jobId}`);
      setJob(data);
      if (data.generatedTemplateJson?.name) setTemplateName(data.generatedTemplateJson.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job.');
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const template = await apiClient<any>(`/api/templates/import-html/jobs/${jobId}/save-as-template`, {
        method: 'POST',
        body: JSON.stringify({ name: templateName }),
      });
      setSuccess('Template saved as draft!');
      setTimeout(() => router.push(`/templates/${template.id}/layout`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    }
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!job) return <div className="text-destructive">Job not found.</div>;
  if (job.status === 'FAILED') return (
    <div className="space-y-4">
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">{job.errorMessage || 'Conversion failed.'}</div>
      <Link href="/templates/import-html"><Button variant="outline"><ArrowLeft className="h-4 w-4" /> Try Again</Button></Link>
    </div>
  );

  const regions = job.detectedRegionsJson || [];
  const warnings = job.warningsJson || [];
  const templateJson = job.generatedTemplateJson;
  const viewportWidths: Record<Viewport, string> = { desktop: '100%', tablet: '768px', mobile: '375px' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/templates/import-html"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
          <div>
            <h1 className="text-2xl font-semibold">Review Imported Template</h1>
            <p className="text-sm text-muted-foreground">Status: <span className="font-medium text-emerald-600">{job.status}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === 'preview' ? 'default' : 'outline'} onClick={() => setViewMode('preview')}><Eye className="h-4 w-4" /> Preview</Button>
          <Button variant={viewMode === 'regions' ? 'default' : 'outline'} onClick={() => setViewMode('regions')}><Check className="h-4 w-4" /> Regions</Button>
          <Button variant={viewMode === 'json' ? 'default' : 'outline'} onClick={() => setViewMode('json')}><Code className="h-4 w-4" /> JSON</Button>
        </div>
      </div>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /> Warnings ({warnings.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {warnings.map((w: any, i: number) => (
                <div key={i} className={`text-sm px-2 py-1 rounded ${w.severity === 'error' ? 'text-destructive bg-destructive/5' : w.severity === 'warning' ? 'text-amber-700 bg-amber-50' : 'text-muted-foreground'}`}>
                  [{w.code}] {w.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Mode Content */}
      {viewMode === 'preview' && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Template Preview</CardTitle>
              <div className="flex items-center gap-1 rounded-md border p-1">
                <button className={['rounded px-2 py-1', viewport === 'desktop' ? 'bg-primary text-primary-foreground' : ''].join(' ')} onClick={() => setViewport('desktop')}><Monitor className="h-4 w-4" /></button>
                <button className={['rounded px-2 py-1', viewport === 'tablet' ? 'bg-primary text-primary-foreground' : ''].join(' ')} onClick={() => setViewport('tablet')}><Tablet className="h-4 w-4" /></button>
                <button className={['rounded px-2 py-1', viewport === 'mobile' ? 'bg-primary text-primary-foreground' : ''].join(' ')} onClick={() => setViewport('mobile')}><Smartphone className="h-4 w-4" /></button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="rounded-lg border overflow-hidden bg-white transition-all" style={{ width: viewportWidths[viewport], maxWidth: '100%' }}>
                {job.convertedHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: job.convertedHtml }} />
                ) : (
                  <p className="p-8 text-center text-muted-foreground">No preview available.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'regions' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Detected Regions ({regions.length})</CardTitle><CardDescription>Regions automatically detected from HTML structure</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regions.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-4 rounded-md border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{r.regionName}</p>
                    <p className="text-xs text-muted-foreground">Type: {r.regionType} • Key: {r.regionKey} • Detected from: {r.detectedFrom}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.confidence >= 0.9 ? 'bg-emerald-100 text-emerald-700' : r.confidence >= 0.7 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                      {Math.round(r.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'json' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Generated template.json</CardTitle></CardHeader>
          <CardContent>
            <pre className="rounded-md bg-muted p-4 text-xs overflow-auto max-h-96 font-mono">
              {JSON.stringify(templateJson, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* License Info */}
      <Card>
        <CardHeader><CardTitle className="text-base">License Information</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Source:</span> <span className="font-medium">{job.sourceUrl || 'Not provided'}</span></div>
            <div><span className="text-muted-foreground">License:</span> <span className="font-medium">{job.licenseName || 'Not provided'}</span></div>
            <div><span className="text-muted-foreground">License URL:</span> <span className="font-medium">{job.licenseUrl || '-'}</span></div>
            <div><span className="text-muted-foreground">Attribution:</span> <span className="font-medium">{job.attributionText || '-'}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Save as Template */}
      {job.status === 'CONVERTED' && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-5 w-5 text-emerald-600" /> Save as Draft Template</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label>Template Name</Label>
                <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="My Imported Template" />
              </div>
              <Button onClick={handleSave} disabled={saving || !templateName.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save as Draft
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Template will be saved as DRAFT. You can edit the layout, run compliance checks, and activate it later.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ReviewPage({ params }: { params: { id: string } }) {
  return (
    <AdminPageShell sectionTitle="Review Import">
      {(user) => <ReviewContent user={user} jobId={params.id} />}
    </AdminPageShell>
  );
}
