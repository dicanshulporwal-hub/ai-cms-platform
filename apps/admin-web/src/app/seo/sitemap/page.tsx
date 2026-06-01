'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Globe, Loader2, Play, Save } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface SitemapSettings {
  siteBaseUrl: string;
  includePages: boolean;
  includeBlogs: boolean;
  includeDocuments: boolean;
  includeFaqs: boolean;
  includeForms: boolean;
  includeCategories: boolean;
  includeTags: boolean;
  includeMultilingualUrls: boolean;
  defaultChangefreq: string;
  defaultPriority: number;
  autoGenerate: boolean;
  lastGeneratedAt: string | null;
}

function SitemapContent({ user }: { user: AuthUser }) {
  const [settings, setSettings] = useState<SitemapSettings | null>(null);
  const [preview, setPreview] = useState<{ xml: string; entries: any[]; warnings: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try { const s = await apiClient<SitemapSettings>('/api/sitemap/settings'); setSettings(s); } catch {}
    setLoading(false);
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true); setSuccess(null);
    try { await apiClient('/api/sitemap/settings', { method: 'PUT', body: JSON.stringify(settings) }); setSuccess('Settings saved.'); } catch {}
    setSaving(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    try { const result = await apiClient<any>('/api/sitemap/generate', { method: 'POST' }); setPreview(result); setShowPreview(true); setSuccess(`Sitemap generated with ${result.entries.length} URLs.`); } catch {}
    setGenerating(false);
  }

  async function handlePreview() {
    try { const result = await apiClient<any>('/api/sitemap/preview'); setPreview(result); setShowPreview(true); } catch {}
  }

  function updateSetting<K extends keyof SitemapSettings>(key: K, value: SitemapSettings[K]) {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sitemap Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure XML sitemap generation for your public website.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}><Globe className="h-4 w-4" /> Preview</Button>
          <Button onClick={handleGenerate} disabled={generating}>{generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Generate</Button>
        </div>
      </div>

      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {/* Settings */}
      <Card>
        <CardHeader><CardTitle className="text-base">Site Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Site Base URL</Label>
            <Input value={settings?.siteBaseUrl || ''} onChange={(e) => updateSetting('siteBaseUrl', e.target.value)} placeholder="https://yourwebsite.com" />
            <p className="text-xs text-muted-foreground">Used as prefix for all sitemap URLs.</p>
          </div>
          {settings?.lastGeneratedAt && <p className="text-xs text-muted-foreground">Last generated: {new Date(settings.lastGeneratedAt).toLocaleString()}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Content Inclusion</CardTitle><CardDescription>Choose which content types to include in the sitemap.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'includePages' as const, label: 'Pages', desc: 'Published pages' },
            { key: 'includeBlogs' as const, label: 'Blog Posts', desc: 'Published blog posts' },
            { key: 'includeDocuments' as const, label: 'Documents', desc: 'Published documents' },
            { key: 'includeFaqs' as const, label: 'FAQs', desc: 'FAQ page' },
            { key: 'includeForms' as const, label: 'Forms', desc: 'Public forms' },
            { key: 'includeCategories' as const, label: 'Categories', desc: 'Category pages' },
            { key: 'includeTags' as const, label: 'Tags', desc: 'Tag pages' },
            { key: 'includeMultilingualUrls' as const, label: 'Multilingual URLs', desc: 'Language-specific URLs' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch checked={settings?.[item.key] ?? false} onCheckedChange={(v) => updateSetting(item.key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings</Button>
      </div>

      {/* Preview */}
      {showPreview && preview && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Sitemap Preview ({preview.entries.length} URLs)</CardTitle>
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(preview.xml); }}><Copy className="h-4 w-4" /> Copy XML</Button>
            </div>
          </CardHeader>
          <CardContent>
            {preview.warnings.length > 0 && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 space-y-1">
                {preview.warnings.map((w, i) => <p key={i} className="text-xs text-amber-700">⚠ {w}</p>)}
              </div>
            )}
            <pre className="rounded-md bg-muted p-4 text-xs overflow-auto max-h-80 font-mono">{preview.xml}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SitemapPage() {
  return <AdminPageShell sectionTitle="Sitemap">{(user) => <SitemapContent user={user} />}</AdminPageShell>;
}
