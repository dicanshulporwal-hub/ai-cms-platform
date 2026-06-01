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

export default function BackupManagerPage() {
  return <AdminPageShell sectionTitle="Backup Manager">{(user) => <BackupContent user={user} />}</AdminPageShell>;
}
