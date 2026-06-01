'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface AnalyticsSettings {
  trackingEnabled: boolean;
  anonymizeIp: boolean;
  respectDoNotTrack: boolean;
  retentionDays: number;
  trackPageViews: boolean;
  trackDownloads: boolean;
  trackSearches: boolean;
  trackForms: boolean;
  trackChatbot: boolean;
  trackAiUsage: boolean;
}

function SettingsContent({ user }: { user: AuthUser }) {
  const [settings, setSettings] = useState<AnalyticsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { apiClient<AnalyticsSettings>('/api/analytics/settings').then(setSettings).finally(() => setLoading(false)); }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true); setSuccess(null);
    try { await apiClient('/api/analytics/settings', { method: 'PUT', body: JSON.stringify(settings) }); setSuccess('Settings saved.'); } catch {}
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Analytics Settings</h1><p className="mt-1 text-sm text-muted-foreground">Configure tracking behavior and privacy settings.</p></div>
        <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
      </div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">General</CardTitle><CardDescription>Master tracking controls</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Tracking Enabled</p><p className="text-xs text-muted-foreground">Master toggle for all analytics tracking</p></div><Switch checked={settings?.trackingEnabled ?? true} onCheckedChange={(v) => setSettings(s => s ? { ...s, trackingEnabled: v } : null)} /></div>
          <div className="space-y-2"><Label>Retention Days</Label><Input type="number" min={7} max={365} value={settings?.retentionDays ?? 90} onChange={(e) => setSettings(s => s ? { ...s, retentionDays: parseInt(e.target.value) || 90 } : null)} /><p className="text-xs text-muted-foreground">How long to keep raw event data (7-365 days)</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Privacy</CardTitle><CardDescription>Privacy and compliance settings</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Anonymize IP</p><p className="text-xs text-muted-foreground">Hash visitor IP addresses before storing</p></div><Switch checked={settings?.anonymizeIp ?? true} onCheckedChange={(v) => setSettings(s => s ? { ...s, anonymizeIp: v } : null)} /></div>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Respect Do Not Track</p><p className="text-xs text-muted-foreground">Skip tracking for visitors with DNT header enabled</p></div><Switch checked={settings?.respectDoNotTrack ?? true} onCheckedChange={(v) => setSettings(s => s ? { ...s, respectDoNotTrack: v } : null)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Event Types</CardTitle><CardDescription>Choose which events to track</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'trackPageViews' as const, label: 'Page Views', desc: 'Track page and blog views' },
            { key: 'trackDownloads' as const, label: 'Downloads', desc: 'Track document downloads' },
            { key: 'trackSearches' as const, label: 'Searches', desc: 'Track search queries' },
            { key: 'trackForms' as const, label: 'Form Submissions', desc: 'Track form views and submissions' },
            { key: 'trackChatbot' as const, label: 'Chatbot', desc: 'Track chatbot interactions' },
            { key: 'trackAiUsage' as const, label: 'AI Usage', desc: 'Track AI feature usage' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch checked={settings?.[item.key] ?? true} onCheckedChange={(v) => setSettings(s => s ? { ...s, [item.key]: v } : null)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsSettingsPage() {
  return <AdminPageShell sectionTitle="Analytics Settings">{(user) => <SettingsContent user={user} />}</AdminPageShell>;
}
