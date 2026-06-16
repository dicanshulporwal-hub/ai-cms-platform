'use client';

import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const THEME_PRESETS = [
  {
    key: 'digital-india-blue',
    name: 'Digital India Blue',
    description: 'Official Digital India palette — navy primary with sky blue accent. Best for general government departments and ministries.',
    primaryColor: '#1a3d7c',
    secondaryColor: '#2c5282',
    accentColor: '#2b7ee0',
    backgroundColor: '#ffffff',
    textColor: '#1a1a2e',
    surfaceColor: '#f4f7fb',
  },
  {
    key: 'government-green',
    name: 'Government Green',
    description: 'Forest green palette for environmental, agriculture, and rural departments.',
    primaryColor: '#1a5e3a',
    secondaryColor: '#145230',
    accentColor: '#2d9e5f',
    backgroundColor: '#ffffff',
    textColor: '#1a2e1a',
    surfaceColor: '#f0f7f3',
  },
  {
    key: 'neutral-ministry',
    name: 'Neutral Ministry',
    description: 'Clean slate-grey for administrative ministries preferring a formal neutral look.',
    primaryColor: '#1e293b',
    secondaryColor: '#334155',
    accentColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    surfaceColor: '#f8fafc',
  },
  {
    key: 'high-contrast',
    name: 'High Contrast',
    description: 'WCAG AAA-ready high contrast for accessibility-first deployments and visually-impaired user groups.',
    primaryColor: '#003399',
    secondaryColor: '#001a66',
    accentColor: '#0044cc',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    surfaceColor: '#f0f0f0',
  },
  {
    key: 'service-portal',
    name: 'Service Portal',
    description: 'Teal-accented for citizen service portals, scheme applications, and e-governance apps.',
    primaryColor: '#065f46',
    secondaryColor: '#047857',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#064e3b',
    surfaceColor: '#f0fdf4',
  },
  {
    key: 'news-portal',
    name: 'News & Updates Portal',
    description: 'Bold editorial style for newsrooms, press portals, and media information portals.',
    primaryColor: '#7f1d1d',
    secondaryColor: '#991b1b',
    accentColor: '#ef4444',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    surfaceColor: '#fef2f2',
  },
];

function PresetsContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Theme Presets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            6 government-ready presets. Apply a preset from Template Builder → Customization → Color Presets.
          </p>
        </div>
        <Link href="/templates">
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            Go to Templates
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {THEME_PRESETS.map((preset) => (
          <Card key={preset.key} className="overflow-hidden">
            {/* Preview bar */}
            <div style={{ backgroundColor: preset.primaryColor, height: '6px' }} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{preset.name}</CardTitle>
                <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{preset.key}</code>
              </div>
              <CardDescription className="text-xs">{preset.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Color swatches */}
              <div className="flex gap-2 mb-3">
                {[
                  { label: 'Primary', color: preset.primaryColor },
                  { label: 'Secondary', color: preset.secondaryColor },
                  { label: 'Accent', color: preset.accentColor },
                  { label: 'Surface', color: preset.surfaceColor },
                  { label: 'Text', color: preset.textColor },
                ].map((swatch) => (
                  <div key={swatch.label} className="flex flex-col items-center gap-1">
                    <div
                      className="h-6 w-6 rounded-full border shadow-sm"
                      style={{ background: swatch.color }}
                      title={`${swatch.label}: ${swatch.color}`}
                    />
                    <span className="text-[8px] text-muted-foreground">{swatch.label}</span>
                  </div>
                ))}
              </div>

              {/* Mini header preview */}
              <div className="rounded-md overflow-hidden border text-[10px]">
                <div style={{ background: preset.primaryColor, color: '#fff', padding: '6px 10px', fontWeight: 600 }}>
                  Government Portal
                </div>
                <div style={{ background: preset.secondaryColor, color: '#fff', padding: '4px 10px', opacity: 0.9 }}>
                  Home · Services · Documents · Contact
                </div>
                <div style={{ background: preset.surfaceColor, color: preset.textColor, padding: '8px 10px' }}>
                  <span style={{ color: preset.accentColor, fontWeight: 700 }}>Welcome ›</span> Citizen services and public information
                </div>
              </div>

              <div className="mt-3 text-[10px] text-muted-foreground space-y-0.5">
                <div><span className="font-mono">{preset.primaryColor}</span> primary</div>
                <div><span className="font-mono">{preset.accentColor}</span> accent</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">How to apply a preset</strong>
        <ol className="mt-2 ml-4 list-decimal space-y-1 text-xs">
          <li>Go to Templates and activate the Government Design System Template.</li>
          <li>Navigate to Templates → Customize (step 3 in the stepper).</li>
          <li>Select a preset from the Color Presets section.</li>
          <li>Save. Theme changes apply to the public website immediately.</li>
        </ol>
      </div>
    </div>
  );
}

export default function ThemePresetsPage() {
  return (
    <AdminPageShell sectionTitle="Theme Presets">
      {() => <PresetsContent />}
    </AdminPageShell>
  );
}
