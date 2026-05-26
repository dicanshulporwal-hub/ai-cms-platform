'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Globe, Loader2, Save, ShieldAlert } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import type { AuthUser } from '@/types/auth';
import type { UpdateSettingsInput } from '@/lib/settings-api';

function canAccessSettings(user: AuthUser) {
  return user.role === 'Super Admin' || user.role === 'Admin';
}

function isSuperAdmin(user: AuthUser) {
  return user.role === 'Super Admin';
}

function SettingsContent({ user }: { user: AuthUser }) {
  const [form, setForm] = useState<UpdateSettingsInput>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: settings, isLoading, isError, error } = useSettings();
  const updateMutation = useUpdateSettings();
  const canEdit = canAccessSettings(user);
  const canEditCritical = isSuperAdmin(user);

  // Initialize form with settings data
  useEffect(() => {
    if (settings) {
      setForm({
        aiEnabled: settings.aiEnabled,
        chatbotEnabled: settings.chatbotEnabled,
        defaultMetaDescription: settings.defaultMetaDescription ?? '',
        defaultMetaTitle: settings.defaultMetaTitle ?? '',
        maintenanceMode: settings.maintenanceMode,
        siteDescription: settings.siteDescription ?? '',
        siteLogo: settings.siteLogo ?? '',
        siteName: settings.siteName,
        supportEmail: settings.supportEmail ?? '',
      });
    }
  }, [settings]);

  function updateField<K extends keyof UpdateSettingsInput>(
    field: K,
    value: UpdateSettingsInput[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Validate
    if (form.siteName && !form.siteName.trim()) {
      setFormError('Site name cannot be empty if provided.');
      return;
    }

    if (form.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail)) {
      setFormError('Support email must be a valid email address.');
      return;
    }

    if ((form.defaultMetaTitle?.length ?? 0) > 60) {
      setFormError('Default meta title must be 60 characters or fewer.');
      return;
    }

    if ((form.defaultMetaDescription?.length ?? 0) > 160) {
      setFormError('Default meta description must be 160 characters or fewer.');
      return;
    }

    try {
      await updateMutation.mutateAsync(form);
      setSuccessMessage('Settings saved successfully.');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Failed to save settings.',
      );
    }
  }

  if (!canEdit) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-8 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-amber-600" />
        <h2 className="mt-4 text-lg font-semibold text-amber-900">Access Restricted</h2>
        <p className="mt-2 text-sm text-amber-700">
          Only Super Admin and Admin users can access settings.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error?.message ?? 'Failed to load settings.'}
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your CMS platform settings.
        </p>
      </div>

      {formError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site Information
          </CardTitle>
          <CardDescription>
            Basic site settings for your CMS platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                disabled={updateMutation.isPending}
                id="siteName"
                onChange={(e) => updateField('siteName', e.target.value)}
                placeholder="AI CMS"
                value={form.siteName ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteLogo">Site Logo URL</Label>
              <Input
                disabled={updateMutation.isPending}
                id="siteLogo"
                onChange={(e) => updateField('siteLogo', e.target.value)}
                placeholder="https://example.com/logo.png"
                type="url"
                value={form.siteLogo ?? ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              disabled={updateMutation.isPending}
              id="siteDescription"
              onChange={(e) => updateField('siteDescription', e.target.value)}
              placeholder="A brief description of your website"
              value={form.siteDescription ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              disabled={updateMutation.isPending}
              id="supportEmail"
              onChange={(e) => updateField('supportEmail', e.target.value)}
              placeholder="support@example.com"
              type="email"
              value={form.supportEmail ?? ''}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default SEO Settings</CardTitle>
          <CardDescription>
            Default meta tags for content without custom SEO settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultMetaTitle">Default Meta Title</Label>
              <Input
                disabled={updateMutation.isPending}
                id="defaultMetaTitle"
                maxLength={60}
                onChange={(e) => updateField('defaultMetaTitle', e.target.value)}
                placeholder="AI CMS Platform"
                value={form.defaultMetaTitle ?? ''}
              />
              <p className="text-xs text-muted-foreground">
                {(form.defaultMetaTitle?.length ?? 0)}/60 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultMetaDescription">Default Meta Description</Label>
              <Textarea
                disabled={updateMutation.isPending}
                id="defaultMetaDescription"
                maxLength={160}
                onChange={(e) => updateField('defaultMetaDescription', e.target.value)}
                placeholder="Discover the power of AI-driven content management"
                value={form.defaultMetaDescription ?? ''}
              />
              <p className="text-xs text-muted-foreground">
                {(form.defaultMetaDescription?.length ?? 0)}/160 characters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Settings</CardTitle>
          <CardDescription>
            Enable or disable platform features.
            {!canEditCritical && (
              <span className="block mt-1 text-amber-600">
                Only Super Admin can modify critical settings.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="chatbotEnabled">Chatbot Enabled</Label>
              <p className="text-sm text-muted-foreground">
                Enable the website chatbot for visitor interactions.
              </p>
            </div>
            <Switch
              checked={form.chatbotEnabled ?? false}
              disabled={updateMutation.isPending || !canEditCritical}
              id="chatbotEnabled"
              onCheckedChange={(checked) => updateField('chatbotEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="aiEnabled">AI Features Enabled</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI-powered content generation and assistance.
              </p>
            </div>
            <Switch
              checked={form.aiEnabled ?? false}
              disabled={updateMutation.isPending || !canEditCritical}
              id="aiEnabled"
              onCheckedChange={(checked) => updateField('aiEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Put the site in maintenance mode. Public pages will show a maintenance message.
              </p>
            </div>
            <Switch
              checked={form.maintenanceMode ?? false}
              disabled={updateMutation.isPending || !canEditCritical}
              id="maintenanceMode"
              onCheckedChange={(checked) => updateField('maintenanceMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button disabled={updateMutation.isPending} type="submit">
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  return (
    <AdminPageShell sectionTitle="Settings">
      {(user) => <SettingsContent user={user} />}
    </AdminPageShell>
  );
}
