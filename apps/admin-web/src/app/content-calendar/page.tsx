'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Loader2, Play, Plus } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Summary { scheduled: number; executed: number; failed: number; upcoming: number; }
interface Schedule { id: string; title: string; sourceType: string; actionType: string; status: string; scheduledAt: string; }

function CalendarContent({ user }: { user: AuthUser }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [running, setRunning] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ sourceType: 'PAGE', sourceId: '', title: '', scheduledAt: '', actionType: 'SCHEDULE_PUBLISH' });
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);
  async function loadData() { try { const [s, sc] = await Promise.all([apiClient<Summary>('/api/content-calendar/summary'), apiClient<Schedule[]>('/api/content-schedules')]); setSummary(s); setSchedules(sc); } catch {} setLoading(false); }

  async function handleCreate() {
    if (!newSchedule.sourceId || !newSchedule.title || !newSchedule.scheduledAt) return;
    setCreating(true);
    try { await apiClient('/api/content-schedules', { method: 'POST', body: JSON.stringify(newSchedule) }); setSuccess('Schedule created.'); setShowCreate(false); await loadData(); } catch {}
    setCreating(false);
  }

  async function handleRunDue() {
    setRunning(true);
    try { const r = await apiClient<any>('/api/publishing-queue/run-due', { method: 'POST' }); setSuccess(`Executed: ${r.executed}, Failed: ${r.failed}`); await loadData(); } catch {}
    setRunning(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const statusColors: Record<string, string> = { SCHEDULED: 'bg-blue-100 text-blue-700', SCHEDULE_EXECUTED: 'bg-emerald-100 text-emerald-700', SCHEDULE_FAILED: 'bg-red-100 text-red-700', SCHEDULE_CANCELLED: 'bg-gray-100 text-gray-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Content Calendar</h1><p className="mt-1 text-sm text-muted-foreground">Schedule content publishing and manage editorial planning.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRunDue} disabled={running}>{running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run Due</Button>
          <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4" /> Schedule</Button>
        </div>
      </div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-blue-600">{summary?.upcoming ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Upcoming</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{summary?.scheduled ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Scheduled</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-emerald-600">{summary?.executed ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Executed</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-destructive">{summary?.failed ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Failed</p></CardContent></Card>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Schedule Content</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Content Type</Label><select className="w-full rounded-md border p-2 text-sm" value={newSchedule.sourceType} onChange={(e) => setNewSchedule(s => ({ ...s, sourceType: e.target.value }))}><option value="PAGE">Page</option><option value="BLOG">Blog</option></select></div>
              <div className="space-y-2"><Label>Content ID *</Label><Input value={newSchedule.sourceId} onChange={(e) => setNewSchedule(s => ({ ...s, sourceId: e.target.value }))} placeholder="Content ID (from pages/blogs)" /></div>
              <div className="space-y-2"><Label>Title *</Label><Input value={newSchedule.title} onChange={(e) => setNewSchedule(s => ({ ...s, title: e.target.value }))} placeholder="Content title" /></div>
              <div className="space-y-2"><Label>Scheduled Date *</Label><Input type="datetime-local" value={newSchedule.scheduledAt} onChange={(e) => setNewSchedule(s => ({ ...s, scheduledAt: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Action</Label><select className="w-full rounded-md border p-2 text-sm" value={newSchedule.actionType} onChange={(e) => setNewSchedule(s => ({ ...s, actionType: e.target.value }))}><option value="SCHEDULE_PUBLISH">Publish</option><option value="SCHEDULE_ARCHIVE">Archive</option></select></div>
            </div>
            <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />} Create Schedule</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Scheduled Content ({schedules.length})</CardTitle></CardHeader>
        <CardContent>
          {schedules.length === 0 ? <p className="text-center py-8 text-muted-foreground">No scheduled content.</p> : (
            <div className="space-y-2">
              {schedules.map(s => (
                <div key={s.id} className="flex items-center gap-3 rounded-md border p-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.sourceType} • {s.actionType.replace('SCHEDULE_', '')} • {new Date(s.scheduledAt).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[s.status] || 'bg-gray-100'}`}>{s.status.replace('SCHEDULE_', '')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ContentCalendarPage() {
  return <AdminPageShell sectionTitle="Content Calendar">{(user) => <CalendarContent user={user} />}</AdminPageShell>;
}
