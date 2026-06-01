'use client';

import { useEffect, useState } from 'react';
import { Archive, Download, FileDown, Loader2, Play, Trash2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Summary { total: number; completed: number; failed: number; latest: { id: string; completedAt: string; fileSize: number; jobType: string } | null; }
interface BackupJob { id: string; jobType: string; status: string; fileName: string | null; fileSize: number; createdAt: string; completedAt: string | null; }

function BackupContent({ user }: { user: AuthUser }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [options, setOptions] = useState({ jobType: 'CONTENT_BACKUP', includeTemplates: true, includeSettings: true, includeUsers: false, includeMedia: false, includeSecrets: false });
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [s, j] = await Promise.all([apiClient<Summary>('/api/backups/summary'), apiClient<BackupJob[]>('/api/backups')]);
      setSummary(s); setJobs(j);
    } catch {}
    setLoading(false);
  }

  async function handleCreate() {
    setCreating(true); setSuccess(null);
    try { await apiClient('/api/backups/create', { method: 'POST', body: JSON.stringify(options) }); setSuccess('Backup created successfully.'); await loadData(); } catch {}
    setCreating(false);
  }

  async function handleExport(type: string) {
    setExporting(true);
    try { await apiClient('/api/exports/create', { method: 'POST', body: JSON.stringify({ exportType: type }) }); setSuccess(`${type} exported.`); } catch {}
    setExporting(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const statusColors: Record<string, string> = { BACKUP_COMPLETED: 'bg-emerald-100 text-emerald-700', BACKUP_PROCESSING: 'bg-blue-100 text-blue-700', BACKUP_FAILED: 'bg-red-100 text-red-700', BACKUP_PENDING: 'bg-gray-100 text-gray-700' };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Backup & Restore</h1><p className="mt-1 text-sm text-muted-foreground">Create backups, export content, and manage restore operations.</p></div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.total ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Total Backups</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-emerald-600">{summary?.completed ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Completed</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-destructive">{summary?.failed ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Failed</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.latest ? `${(summary.latest.fileSize / 1024).toFixed(0)} KB` : '-'}</p><p className="text-xs text-muted-foreground mt-1">Latest Size</p></CardContent></Card>
      </div>

      {/* Create Backup */}
      <Card>
        <CardHeader><CardTitle className="text-base">Create Backup</CardTitle><CardDescription>Select what to include in the backup package.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'includeTemplates', label: 'Templates' },
              { key: 'includeSettings', label: 'Settings' },
              { key: 'includeUsers', label: 'Users' },
              { key: 'includeMedia', label: 'Media' },
            ].map(item => (
              <div key={item.key} className="flex items-center gap-2">
                <Switch checked={(options as any)[item.key]} onCheckedChange={(v) => setOptions(o => ({ ...o, [item.key]: v }))} />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
          {user.role === 'Super Admin' && (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-2">
              <Switch checked={options.includeSecrets} onCheckedChange={(v) => setOptions(o => ({ ...o, includeSecrets: v }))} />
              <span className="text-sm text-amber-800">Include secrets (Super Admin only, use with caution)</span>
            </div>
          )}
          <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />} Create Backup</Button>
        </CardContent>
      </Card>

      {/* Quick Export */}
      <Card>
        <CardHeader><CardTitle className="text-base">Quick Export</CardTitle><CardDescription>Export specific content types as JSON.</CardDescription></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['PAGES', 'BLOGS', 'FAQS'].map(type => (
              <Button key={type} variant="outline" onClick={() => handleExport(type)} disabled={exporting}><FileDown className="h-4 w-4" /> Export {type}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Restore from Backup */}
      {user.role === 'Super Admin' && jobs.filter(j => j.status === 'BACKUP_COMPLETED').length > 0 && (
        <RestoreSection jobs={jobs.filter(j => j.status === 'BACKUP_COMPLETED')} />
      )}

      {/* Backup History */}
      <Card>
        <CardHeader><CardTitle className="text-base">Backup History ({jobs.length})</CardTitle></CardHeader>
        <CardContent>
          {jobs.length === 0 ? <p className="text-center py-8 text-muted-foreground">No backups yet.</p> : (
            <div className="space-y-2">
              {jobs.map(job => (
                <div key={job.id} className="flex items-center gap-3 rounded-md border p-3">
                  <Archive className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{job.jobType.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleString()} • {(job.fileSize / 1024).toFixed(0)} KB</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[job.status] || ''}`}>{job.status.replace('BACKUP_', '')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RestoreSection({ jobs }: { jobs: BackupJob[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [validation, setValidation] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [conflictStrategy, setConflictStrategy] = useState('SKIP');
  const [restoreResult, setRestoreResult] = useState<any>(null);

  async function handleValidate() {
    if (!selectedId) return;
    setValidating(true); setValidation(null); setRestoreResult(null);
    try {
      const result = await apiClient<any>('/api/restores/validate', { method: 'POST', body: JSON.stringify({ backupJobId: selectedId }) });
      setValidation(result);
    } catch {}
    setValidating(false);
  }

  async function handleRestore() {
    if (!selectedId) return;
    if (!confirm('Are you sure you want to restore this backup? This will modify your database content.')) return;
    setRestoring(true);
    try {
      const result = await apiClient<any>('/api/restores/execute', { method: 'POST', body: JSON.stringify({ backupJobId: selectedId, conflictStrategy }) });
      setRestoreResult(result);
    } catch {}
    setRestoring(false);
  }

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Play className="h-4 w-4 text-amber-600" /> Restore from Backup
        </CardTitle>
        <CardDescription>Select a completed backup to validate and restore. Super Admin only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Backup</label>
          <select className="w-full rounded-md border p-2 text-sm" value={selectedId || ''} onChange={(e) => { setSelectedId(e.target.value); setValidation(null); setRestoreResult(null); }}>
            <option value="">Choose a backup...</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.jobType.replace('_', ' ')} — {new Date(j.createdAt).toLocaleString()} ({(j.fileSize / 1024).toFixed(0)} KB)</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Conflict Strategy</label>
          <select className="w-full rounded-md border p-2 text-sm" value={conflictStrategy} onChange={(e) => setConflictStrategy(e.target.value)}>
            <option value="SKIP">Skip existing records</option>
            <option value="OVERWRITE">Overwrite existing records</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleValidate} disabled={!selectedId || validating}>
            {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Validate
          </Button>
          <Button onClick={handleRestore} disabled={!selectedId || !validation?.valid || restoring} className="bg-amber-600 hover:bg-amber-700">
            {restoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Execute Restore
          </Button>
        </div>

        {validation && (
          <div className={`rounded-md border p-3 text-sm ${validation.valid ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <p className="font-medium mb-2">{validation.valid ? '✓ Backup is valid' : '✗ Backup has issues'}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <span>Pages: {validation.records?.pages ?? 0}</span>
              <span>Blogs: {validation.records?.blogs ?? 0}</span>
              <span>FAQs: {validation.records?.faqs ?? 0}</span>
              <span>Templates: {validation.records?.templates ?? 0}</span>
            </div>
            {validation.warnings?.length > 0 && (
              <div className="mt-2 space-y-1">{validation.warnings.map((w: string, i: number) => <p key={i} className="text-xs text-amber-700">⚠ {w}</p>)}</div>
            )}
          </div>
        )}

        {restoreResult && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
            <p className="font-medium mb-1">✓ Restore completed</p>
            <div className="text-xs space-y-1">
              <p>Pages restored: {restoreResult.pagesRestored}</p>
              <p>Blogs restored: {restoreResult.blogsRestored}</p>
              <p>FAQs restored: {restoreResult.faqsRestored}</p>
              <p>Skipped: {restoreResult.skipped}</p>
              {restoreResult.errors?.length > 0 && <p className="text-destructive">Errors: {restoreResult.errors.length}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BackupManagerPage() {
  return <AdminPageShell sectionTitle="Backup Manager">{(user) => <BackupContent user={user} />}</AdminPageShell>;
}
