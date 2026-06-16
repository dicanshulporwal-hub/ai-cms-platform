'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Palette, RotateCcw, Save, Type, Image, Sliders } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { useTemplate } from '@/hooks/use-templates';
import { TemplateGate } from '@/components/templates/template-gate';
import { TemplateStepper } from '@/components/templates/template-stepper';
import type { AuthUser } from '@/types/auth';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  baseFontSize: string;
  borderRadius: string;
  contentWidth: string;
  sectionSpacing: string;
  logoUrl: string;
  faviconUrl: string;
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#2563eb',
  secondaryColor: '#1f2937',
  accentColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  baseFontSize: '16',
  borderRadius: '8',
  contentWidth: '1200',
  sectionSpacing: '48',
  logoUrl: '',
  faviconUrl: '',
};

const FONT_OPTIONS = [
  'Inter', 'System UI', 'Georgia', 'Roboto', 'Open Sans',
  'Lato', 'Poppins', 'Montserrat', 'Nunito', 'Playfair Display',
];

const PRESET_THEMES: { name: string; colors: Partial<ThemeConfig> }[] = [
  { name: 'Digital India Blue', colors: { primaryColor: '#1a3d7c', secondaryColor: '#2c5282', accentColor: '#2b7ee0' } },
  { name: 'Government Green', colors: { primaryColor: '#1a5e3a', secondaryColor: '#145230', accentColor: '#2d9e5f' } },
  { name: 'Neutral Ministry', colors: { primaryColor: '#1e293b', secondaryColor: '#334155', accentColor: '#3b82f6' } },
  { name: 'High Contrast', colors: { primaryColor: '#003399', secondaryColor: '#001a66', accentColor: '#0044cc' } },
  { name: 'Service Portal', colors: { primaryColor: '#065f46', secondaryColor: '#047857', accentColor: '#10b981' } },
  { name: 'News Portal', colors: { primaryColor: '#7f1d1d', secondaryColor: '#991b1b', accentColor: '#ef4444' } },
  { name: 'Default Blue', colors: { primaryColor: '#2563eb', secondaryColor: '#1f2937', accentColor: '#10b981' } },
  { name: 'Corporate Dark', colors: { primaryColor: '#0f172a', secondaryColor: '#334155', accentColor: '#f59e0b' } },
  { name: 'Royal Purple', colors: { primaryColor: '#7c3aed', secondaryColor: '#4c1d95', accentColor: '#a78bfa' } },
  { name: 'Warm Red', colors: { primaryColor: '#dc2626', secondaryColor: '#7f1d1d', accentColor: '#fbbf24' } },
];

function CustomizeContent({ user, templateId }: { user: AuthUser; templateId: string }) {
  const { data: template } = useTemplate(templateId);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load existing theme from template configJson
  useEffect(() => {
    if (template?.configJson) {
      const config = template.configJson as Record<string, unknown>;
      const savedThemeSettings = config.themeSettings as Partial<ThemeConfig> | undefined;
      const saved = config.theme as Partial<ThemeConfig> | undefined;
      if (savedThemeSettings || saved) {
        setTheme({ ...DEFAULT_THEME, ...savedThemeSettings, ...saved });
      }
    }
  }, [template]);

  function updateTheme<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }

  function applyPreset(preset: Partial<ThemeConfig>) {
    setTheme((prev) => ({ ...prev, ...preset }));
  }

  function resetToDefaults() {
    setTheme(DEFAULT_THEME);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const existingConfig = (template?.configJson as Record<string, unknown>) ?? {};
      const existingThemeSettings = (existingConfig.themeSettings as Record<string, unknown>) ?? {};
      const themeSettings = {
        ...existingThemeSettings,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        accentColor: theme.accentColor,
        backgroundColor: theme.backgroundColor,
        textColor: theme.textColor,
        fontFamily: theme.bodyFont,
        logoMediaId: existingThemeSettings.logoMediaId ?? '',
        emblemMediaId: existingThemeSettings.emblemMediaId ?? '',
        headerStyle: existingThemeSettings.headerStyle ?? 'official',
        navigationStyle: existingThemeSettings.navigationStyle ?? 'horizontal',
        footerStyle: existingThemeSettings.footerStyle ?? 'multi-column',
        cardStyle: existingThemeSettings.cardStyle ?? 'bordered',
        layoutWidth: theme.contentWidth,
        borderRadius: theme.borderRadius,
        showAccessibilityBar: existingThemeSettings.showAccessibilityBar ?? true,
        showLanguageSwitcher: existingThemeSettings.showLanguageSwitcher ?? false,
        showSearch: existingThemeSettings.showSearch ?? true,
        showChatbot: existingThemeSettings.showChatbot ?? true,
        highContrastEnabled: existingThemeSettings.highContrastEnabled ?? false,
      };
      await apiClient(`/api/templates/${templateId}`, {
        method: 'PUT',
        body: JSON.stringify({
          configJson: { ...existingConfig, theme, themeSettings },
        }),
      });
      setSuccess('Customization saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    }
    setSaving(false);
  }

  return (
    <form className="space-y-6" onSubmit={handleSave}>
      <TemplateStepper templateId={templateId} currentStep={3} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customization</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize colors, typography, and visual appearance of your website.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/templates/${templateId}/layout`}>
            <Button variant="outline" type="button">
              <ArrowLeft className="h-4 w-4" /> Layout
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
          <Link href={`/templates/${templateId}/content`}>
            <Button type="button">
              Next: Content <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {/* Color Presets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Color Presets</CardTitle>
                <CardDescription>Quick-apply a color scheme or customize individually below</CardDescription>
              </div>
            </div>
            <Button type="button" variant="ghost" onClick={resetToDefaults} className="text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> Reset All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.colors)}
                className="rounded-lg border border-border p-3 text-center hover:border-primary hover:shadow-sm transition-all"
              >
                <div className="flex justify-center gap-1 mb-2">
                  <div className="h-5 w-5 rounded-full border" style={{ background: preset.colors.primaryColor }} />
                  <div className="h-5 w-5 rounded-full border" style={{ background: preset.colors.secondaryColor }} />
                  <div className="h-5 w-5 rounded-full border" style={{ background: preset.colors.accentColor }} />
                </div>
                <p className="text-xs font-medium">{preset.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Colors</CardTitle>
          <CardDescription>Fine-tune each color individually</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ColorField label="Primary Color" value={theme.primaryColor} onChange={(v) => updateTheme('primaryColor', v)} />
            <ColorField label="Secondary Color" value={theme.secondaryColor} onChange={(v) => updateTheme('secondaryColor', v)} />
            <ColorField label="Accent Color" value={theme.accentColor} onChange={(v) => updateTheme('accentColor', v)} />
            <ColorField label="Background Color" value={theme.backgroundColor} onChange={(v) => updateTheme('backgroundColor', v)} />
            <ColorField label="Text Color" value={theme.textColor} onChange={(v) => updateTheme('textColor', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Type className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Typography</CardTitle>
              <CardDescription>Font families and sizing</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Select value={theme.headingFont} onChange={(e) => updateTheme('headingFont', e.target.value)}>
                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </Select>
              <p className="text-lg font-bold" style={{ fontFamily: theme.headingFont }}>Preview Heading</p>
            </div>
            <div className="space-y-2">
              <Label>Body Font</Label>
              <Select value={theme.bodyFont} onChange={(e) => updateTheme('bodyFont', e.target.value)}>
                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </Select>
              <p className="text-sm" style={{ fontFamily: theme.bodyFont }}>Preview body text looks like this.</p>
            </div>
            <div className="space-y-2">
              <Label>Base Font Size (px)</Label>
              <Input type="number" min="12" max="24" value={theme.baseFontSize} onChange={(e) => updateTheme('baseFontSize', e.target.value)} />
              <p className="text-muted-foreground text-xs">Recommended: 14–18px</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Branding</CardTitle>
              <CardDescription>Logo and favicon URLs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                placeholder="https://example.com/logo.png"
                value={theme.logoUrl}
                onChange={(e) => updateTheme('logoUrl', e.target.value)}
              />
              {theme.logoUrl && (
                <div className="mt-2 rounded-md border p-3 bg-muted/30">
                  <img src={theme.logoUrl} alt="Logo preview" className="max-h-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Recommended: SVG or PNG, max 200x60px</p>
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input
                placeholder="https://example.com/favicon.ico"
                value={theme.faviconUrl}
                onChange={(e) => updateTheme('faviconUrl', e.target.value)}
              />
              {theme.faviconUrl && (
                <div className="mt-2 rounded-md border p-3 bg-muted/30">
                  <img src={theme.faviconUrl} alt="Favicon preview" className="h-8 w-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Recommended: 32x32px ICO or PNG</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing & Layout */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sliders className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Spacing & Layout</CardTitle>
              <CardDescription>Control content width, spacing, and border radius</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Content Max Width (px)</Label>
              <Input type="number" min="800" max="1600" step="50" value={theme.contentWidth} onChange={(e) => updateTheme('contentWidth', e.target.value)} />
              <div className="h-3 rounded bg-muted relative overflow-hidden">
                <div className="h-full bg-primary/30 rounded" style={{ width: `${(parseInt(theme.contentWidth) / 1600) * 100}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Section Spacing (px)</Label>
              <Input type="number" min="16" max="96" step="4" value={theme.sectionSpacing} onChange={(e) => updateTheme('sectionSpacing', e.target.value)} />
              <div className="flex gap-1 items-end h-8">
                {[16, 24, 32, 48, 64, 96].map((v) => (
                  <div key={v} className={['flex-1 rounded-sm transition-colors', parseInt(theme.sectionSpacing) >= v ? 'bg-primary/40' : 'bg-muted'].join(' ')} style={{ height: `${(v / 96) * 100}%` }} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Border Radius (px)</Label>
              <Input type="number" min="0" max="24" value={theme.borderRadius} onChange={(e) => updateTheme('borderRadius', e.target.value)} />
              <div className="flex gap-3 items-center mt-1">
                <div className="h-10 w-10 border-2 border-primary/50 bg-primary/10" style={{ borderRadius: `${theme.borderRadius}px` }} />
                <span className="text-xs text-muted-foreground">{theme.borderRadius}px radius</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Preview</CardTitle>
          <CardDescription>See how your customization looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden" style={{ background: theme.backgroundColor }}>
            <div style={{ background: theme.primaryColor, padding: '16px 24px', color: '#fff' }}>
              <p style={{ fontFamily: theme.headingFont, fontSize: '18px', fontWeight: 700, margin: 0 }}>
                {theme.logoUrl ? '🌐' : '🌐'} Site Header
              </p>
            </div>
            <div style={{ padding: theme.sectionSpacing + 'px 24px', maxWidth: theme.contentWidth + 'px' }}>
              <h2 style={{ fontFamily: theme.headingFont, color: theme.textColor, fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
                Welcome to Your Website
              </h2>
              <p style={{ fontFamily: theme.bodyFont, color: theme.textColor, fontSize: theme.baseFontSize + 'px', opacity: 0.7, margin: '0 0 16px', lineHeight: 1.6 }}>
                This is a preview of how your content will look with the current customization settings applied.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ background: theme.primaryColor, color: '#fff', padding: '8px 16px', borderRadius: theme.borderRadius + 'px', fontSize: '13px', fontWeight: 600 }}>Primary Button</span>
                <span style={{ background: theme.accentColor, color: '#fff', padding: '8px 16px', borderRadius: theme.borderRadius + 'px', fontSize: '13px', fontWeight: 600 }}>Accent Button</span>
              </div>
            </div>
            <div style={{ background: theme.secondaryColor, padding: '16px 24px', color: '#fff', fontSize: '12px', opacity: 0.8 }}>
              Footer area with secondary color
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 rounded-md border border-border cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  );
}

export default function CustomizePage({ params }: { params: { id: string } }) {
  return (
    <AdminPageShell sectionTitle="Customization">
      {(user) => (
        <TemplateGate>
          <CustomizeContent user={user} templateId={params.id} />
        </TemplateGate>
      )}
    </AdminPageShell>
  );
}
