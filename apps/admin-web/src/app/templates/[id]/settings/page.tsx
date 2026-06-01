'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Globe, Loader2, MessageCircle, Save, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { TemplateGate } from '@/components/templates/template-gate';
import { TemplateStepper } from '@/components/templates/template-stepper';
import type { UpdateSettingsInput } from '@/lib/settings-api';
import type { AuthUser } from '@/types/auth';

function SettingsContent({ user, templateId }: { user: AuthUser; templateId: string }) {
  const router = useRouter();
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const [form, setForm] = useState<UpdateSettingsInput>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isSuperAdmin = user.role === 'Super Admin';

  useEffect(() => {
    if (settings) {
      setForm({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription ?? '',
        siteLogo: settings.siteLogo ?? '',
        defaultMetaTitle: settings.defaultMetaTitle ?? '',
        defaultMetaDescription: settings.defaultMetaDescription ?? '',
        supportEmail: settings.supportEmail ?? '',
        chatbotEnabled: settings.chatbotEnabled,
        aiEnabled: settings.aiEnabled,
        maintenanceMode: settings.maintenanceMode,
      });
    }
  }, [settings]);

  function updateField<K extends keyof UpdateSettingsInput>(key: K, value: UpdateSettingsInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.siteName && !form.siteName.trim()) {
      setError('Site name cannot be empty.');
      return;
    }
    if (form.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await updateMutation.mutateAsync(form);
      setSuccess('Settings saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.');
    }
  }

  function handleFinish() {
    router.push('/dashboard');
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TemplateStepper templateId={templateId} currentStep={5} />
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSave}>
      <TemplateStepper templateId={templateId} currentStep={5} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Site Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure site-wide settings, SEO, and feature toggles.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/templates/${templateId}/content`}>
            <Button variant="outline" type="button">
              <ArrowLeft className="h-4 w-4" /> Content
            </Button>
          </Link>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </Button>
        </div>
      </div>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {/* Site Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Site Information</CardTitle>
              <CardDescription>Basic information about your website</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name *</Label>
              <Input
                id="siteName"
                value={form.siteName ?? ''}
                onChange={(e) => updateField('siteName', e.target.value)}
                placeholder="My Website"
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={form.supportEmail ?? ''}
                onChange={(e) => updateField('supportEmail', e.target.value)}
                placeholder="support@example.com"
                disabled={updateMutation.isPending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={form.siteDescription ?? ''}
              onChange={(e) => updateField('siteDescription', e.target.value)}
              placeholder="A brief description of your website for visitors and search engines"
              disabled={updateMutation.isPending}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteLogo">Site Logo URL</Label>
            <Input
              id="siteLogo"
              value={form.siteLogo ?? ''}
              onChange={(e) => updateField('siteLogo', e.target.value)}
              placeholder="https://example.com/logo.png"
              disabled={updateMutation.isPending}
            />
            {form.siteLogo && (
              <div className="rounded-md border p-2 bg-muted/30 inline-block">
                <img src={form.siteLogo} alt="Logo" className="max-h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base">SEO & Meta Tags</CardTitle>
              <CardDescription>Default meta tags for pages without custom SEO settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultMetaTitle">Default Meta Title</Label>
            <Input
              id="defaultMetaTitle"
              value={form.defaultMetaTitle ?? ''}
              onChange={(e) => updateField('defaultMetaTitle', e.target.value)}
              placeholder="My Website - Tagline"
              maxLength={60}
              disabled={updateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">{(form.defaultMetaTitle?.length ?? 0)}/60 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultMetaDescription">Default Meta Description</Label>
            <Textarea
              id="defaultMetaDescription"
              value={form.defaultMetaDescription ?? ''}
              onChange={(e) => updateField('defaultMetaDescription', e.target.value)}
              placeholder="A concise description of your website for search engine results"
              maxLength={160}
              rows={3}
              disabled={updateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">{(form.defaultMetaDescription?.length ?? 0)}/160 characters</p>
          </div>

          {/* SEO Preview */}
          <div className="rounded-md border p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Search Engine Preview:</p>
            <div>
              <p className="text-blue-700 text-base font-medium truncate">
                {form.defaultMetaTitle || form.siteName || 'Your Site Title'}
              </p>
              <p className="text-emerald-700 text-xs truncate">
                https://yourwebsite.com
              </p>
              <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                {form.defaultMetaDescription || form.siteDescription || 'Your site description will appear here in search results.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base">Features</CardTitle>
              <CardDescription>
                Enable or disable platform features
                {!isSuperAdmin && <span className="text-amber-600 ml-1">(Some require Super Admin)</span>}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Features</Label>
              <p className="text-xs text-muted-foreground">Enable AI-powered content generation and assistance</p>
            </div>
            <Switch
              checked={form.aiEnabled ?? true}
              onCheckedChange={(checked) => updateField('aiEnabled', checked)}
              disabled={updateMutation.isPending || !isSuperAdmin}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Chatbot</Label>
              <p className="text-xs text-muted-foreground">Enable the AI chatbot for visitor interactions</p>
            </div>
            <Switch
              checked={form.chatbotEnabled ?? true}
              onCheckedChange={(checked) => updateField('chatbotEnabled', checked)}
              disabled={updateMutation.isPending || !isSuperAdmin}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-xs text-muted-foreground">Show maintenance page to public visitors</p>
            </div>
            <Switch
              checked={form.maintenanceMode ?? false}
              onCheckedChange={(checked) => updateField('maintenanceMode', checked)}
              disabled={updateMutation.isPending || !isSuperAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Finish Setup */}
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-900">You're All Set!</h3>
              <p className="text-sm text-emerald-700 mt-1">
                Your template is configured. Save your settings and finish the setup to start using your website.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button type="submit" variant="outline" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Settings
              </Button>
              <Button type="button" className="px-8" onClick={handleFinish}>
                <CheckCircle className="h-4 w-4" />
                Finish Setup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default function SettingsPage({ params }: { params: { id: string } }) {
  return (
    <AdminPageShell sectionTitle="Site Settings">
      {(user) => (
        <TemplateGate>
          <SettingsContent user={user} templateId={params.id} />
        </TemplateGate>
      )}
    </AdminPageShell>
  );
}
