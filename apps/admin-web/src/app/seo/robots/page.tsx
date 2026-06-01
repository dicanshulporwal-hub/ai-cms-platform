'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, RotateCcw, Save } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface RobotsSettings {
  robotsContent: string | null;
  allowAll: boolean;
  disallowAdmin: boolean;
  disallowApi: boolean;
  disallowPrivateRoutes: boolean;
  includeSitemapUrl: boolean;
}

function RobotsContent({ user }: { user: AuthUser }) {
  const [settings, setSettings] = useState<RobotsSettings | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [s, p] = await Promise.all([
        apiClient<RobotsSettings>('/api/robots/settings'),
        apiClient<{ content: string }>('/api/robots/preview'),
      ]);
      setSettings(s);
      setPreview(p.content);
    } catch {}
    setLoading(false);
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true); setSuccess(null);
    try {
      await apiClient('/api/robots/settings', { method: 'PUT', body: JSON.stringify(settings) });
      const p = await apiClient<{ content: string }>('/api/robots/preview');
      setPreview(p.content);
      setSuccess('Robots settings saved.');
    } catch {}
    setSaving(false);
  }

  function resetToDefault() {
    setSettings(prev => prev ? { ...prev, robotsContent: null, allowAll: true, disallowAdmin: true, disallowApi: true, disallowPrivateRoutes: true, includeSitemapUrl: true } : null);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Robots.txt Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">Control how search engines crawl your website.</p>
        </div>
        <a href="http://localhost:3001/robots.txt" target="_blank" rel="noopener noreferrer">
          <Button variant="outline"><ExternalLink className="h-4 w-4" /> View Public robots.txt</Button>
        </a>
      </div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">Crawl Rules</CardTitle><CardDescription>Toggle which areas search engines can access.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Allow All Public Pages</p><p className="text-xs text-muted-foreground">Allow crawling of all public content</p></div><Switch checked={settings?.allowAll ?? true} onCheckedChange={(v) => setSettings(s => s ? { ...s, allowAll: v } : null)} /></div>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Disallow Admin Routes</p><p className="text-xs text-muted-foreground">/admin, /dashboard, /login</p></div><Switch checked={settings?.disallowAdmin ?? true} onCheckedChange={(v) => setSettings(s => s ? { ...s, disallowAdmin: v } : null)} /></div>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Disallow API Routes</p><p className="text-xs text-muted-foreground">/api/*</p></div><Switch checked={settings?.disallowApi ?? true} onCheckedChange={(v) => setSettings(s => s ? { ...s, disallowApi: v } : null)} /></div>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Disallow Private Routes</p><p className="text-xs text-muted-foreground">/settings, /users, /roles, /workflow</p></div><Switch checked={settings?.disallowPrivateRoutes ?? true} onCheckedChange={(v) => setSettings(s => s ? { ...s, disallowPrivateRoutes: v } : null)} /></div>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Include Sitemap URL</p><p className="text-xs text-muted-foreground">Add Sitemap: directive</p></div><Switch checked={settings?.includeSitemapUrl ?? true} onCheckedChange={(v) => setSettings(s => s ? { ...s, includeSitemapUrl: v } : null)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Custom robots.txt (Optional)</CardTitle>
            <Button variant="ghost" onClick={resetToDefault} className="text-xs"><RotateCcw className="h-3.5 w-3.5" /> Reset to Default</Button>
          </div>
          <CardDescription>Override the auto-generated robots.txt with custom content. Leave empty to use auto-generated.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={settings?.robotsContent || ''} onChange={(e) => setSettings(s => s ? { ...s, robotsContent: e.target.value || null } : null)} placeholder="User-agent: *\nAllow: /" rows={8} className="font-mono text-xs" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
        <CardContent>
          <pre className="rounded-md bg-muted p-4 text-xs font-mono whitespace-pre-wrap">{preview}</pre>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings</Button>
    </div>
  );
}

export default function RobotsPage() {
  return <AdminPageShell sectionTitle="Robots.txt">{(user) => <RobotsContent user={user} />}</AdminPageShell>;
}
