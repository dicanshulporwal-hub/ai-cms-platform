'use client';

import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLOR_TOKENS = [
  { name: '--public-primary', value: '#1a3d7c', description: 'Brand primary (government blue)' },
  { name: '--public-primary-hover', value: '#15326a', description: 'Primary hover state' },
  { name: '--public-primary-light', value: '#e8eef8', description: 'Primary light tint for backgrounds' },
  { name: '--public-secondary', value: '#2c5282', description: 'Secondary / navigation background' },
  { name: '--public-accent', value: '#2b7ee0', description: 'Interactive accent / links' },
  { name: '--public-background', value: '#ffffff', description: 'Page background' },
  { name: '--public-surface', value: '#f4f7fb', description: 'Card and section surface' },
  { name: '--public-surface-muted', value: '#eef2f8', description: 'Muted surface (zebra rows, etc.)' },
  { name: '--public-text', value: '#1a1a2e', description: 'Primary text color' },
  { name: '--public-text-muted', value: '#4a5568', description: 'Secondary text, captions' },
  { name: '--public-text-inverse', value: '#ffffff', description: 'Text on dark backgrounds' },
  { name: '--public-border', value: '#d2daea', description: 'Default borders and dividers' },
  { name: '--public-success', value: '#276749', description: 'Success state' },
  { name: '--public-warning', value: '#b45309', description: 'Warning state' },
  { name: '--public-error', value: '#c53030', description: 'Error state' },
  { name: '--public-info', value: '#2b6cb0', description: 'Informational state' },
  { name: '--public-link', value: '#1a3d7c', description: 'Hyperlink color' },
  { name: '--public-focus-ring', value: '#fbbf24', description: 'Keyboard focus ring (amber)' },
];

const TYPOGRAPHY_TOKENS = [
  { name: '--public-font-family', value: "'Noto Sans', Inter, system-ui", description: 'Body font stack' },
  { name: '--public-font-heading', value: "'Noto Sans', Inter, system-ui", description: 'Heading font stack' },
  { name: '--public-font-size-xs', value: '0.75rem', description: '12px' },
  { name: '--public-font-size-sm', value: '0.875rem', description: '14px' },
  { name: '--public-font-size-base', value: '1rem', description: '16px' },
  { name: '--public-font-size-lg', value: '1.125rem', description: '18px' },
  { name: '--public-font-size-xl', value: '1.25rem', description: '20px' },
  { name: '--public-font-size-2xl', value: '1.5rem', description: '24px' },
  { name: '--public-font-size-3xl', value: '1.875rem', description: '30px' },
  { name: '--public-font-weight-bold', value: '700', description: 'Bold headings' },
  { name: '--public-font-weight-semibold', value: '600', description: 'Subheadings, labels' },
  { name: '--public-font-weight-medium', value: '500', description: 'Navigation, buttons' },
  { name: '--public-font-weight-regular', value: '400', description: 'Body copy' },
  { name: '--public-line-height-normal', value: '1.5', description: 'Body text' },
];

const LAYOUT_TOKENS = [
  { name: '--public-container-width', value: '1200px', description: 'Max content width (overrideable)' },
  { name: '--public-section-spacing', value: '3rem', description: 'Vertical section padding' },
  { name: '--public-header-height', value: '72px', description: 'Header height' },
  { name: '--public-topbar-height', value: '40px', description: 'Utility bar height' },
  { name: '--public-radius', value: '0.375rem', description: 'Default border radius' },
  { name: '--public-min-touch-target', value: '44px', description: 'WCAG minimum touch target' },
  { name: '--public-focus-width', value: '3px', description: 'Focus ring width' },
];

function TokenTable({ tokens }: { tokens: { name: string; value: string; description: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Token</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Default Value</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tokens.map((t) => (
            <tr key={t.name} className="hover:bg-muted/20">
              <td className="px-3 py-2">
                <code className="text-xs font-mono text-primary">{t.name}</code>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {/^#[0-9a-f]{3,8}$/i.test(t.value) && (
                    <div
                      className="h-4 w-4 rounded-full border border-gray-200 shrink-0"
                      style={{ background: t.value }}
                    />
                  )}
                  <code className="text-xs font-mono text-muted-foreground">{t.value}</code>
                </div>
              </td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TokensContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Theme Tokens</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          CSS custom properties powering the public website design system. All tokens are overrideable via Template Builder → Customization → Theme Settings.
        </p>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50/50 px-4 py-3 text-xs text-amber-800">
        Token values shown are defaults. Active values are set by the template theme at runtime on
        <code className="mx-1 font-mono">var(--public-*)</code> CSS variables injected by TemplateRenderer.
        To change values, go to{' '}
        <a href="/templates" className="font-medium underline">Templates → Customization</a>.
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Color Tokens</CardTitle></CardHeader>
        <CardContent><TokenTable tokens={COLOR_TOKENS} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Typography Tokens</CardTitle></CardHeader>
        <CardContent><TokenTable tokens={TYPOGRAPHY_TOKENS} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Layout & Accessibility Tokens</CardTitle></CardHeader>
        <CardContent><TokenTable tokens={LAYOUT_TOKENS} /></CardContent>
      </Card>
    </div>
  );
}

export default function TokensPage() {
  return (
    <AdminPageShell sectionTitle="Theme Tokens">
      {() => <TokensContent />}
    </AdminPageShell>
  );
}
