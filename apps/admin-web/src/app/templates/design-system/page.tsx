'use client';

import Link from 'next/link';
import { Palette, Sliders, Grid, Eye, CheckCircle } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const THEME_PRESETS = [
  { key: 'digital-india-blue', name: 'Digital India Blue', primary: '#1a3d7c', secondary: '#2c5282', accent: '#2b7ee0' },
  { key: 'government-green', name: 'Government Green', primary: '#1a5e3a', secondary: '#145230', accent: '#2d9e5f' },
  { key: 'neutral-ministry', name: 'Neutral Ministry', primary: '#1e293b', secondary: '#334155', accent: '#3b82f6' },
  { key: 'high-contrast', name: 'High Contrast', primary: '#003399', secondary: '#001a66', accent: '#0044cc' },
  { key: 'service-portal', name: 'Service Portal', primary: '#065f46', secondary: '#047857', accent: '#10b981' },
  { key: 'news-portal', name: 'News & Updates Portal', primary: '#7f1d1d', secondary: '#991b1b', accent: '#ef4444' },
];

const DESIGN_TOKENS_GROUPS = [
  { label: 'Colors', count: 20, description: 'Primary, secondary, accent, semantic, surface, text, border' },
  { label: 'Typography', count: 14, description: 'Font families, sizes, weights, line heights' },
  { label: 'Spacing', count: 13, description: '4px base grid, 0–24 scale' },
  { label: 'Radius', count: 5, description: 'none, sm, md, lg, full' },
  { label: 'Shadows', count: 5, description: 'none, sm, md, lg, card' },
  { label: 'Layout', count: 7, description: 'Container widths, section spacing, header heights' },
];

const PUBLIC_COMPONENTS = [
  'PublicButton', 'PublicBadge', 'PublicCard', 'PublicSection', 'PublicGrid',
  'PublicAlert', 'PublicTable', 'PublicAccordion', 'PublicBreadcrumb', 'PublicPagination',
  'PublicStatCard', 'PublicLinkList', 'PublicContainer', 'PublicImage', 'PublicSearchBox',
  'PublicSkipLink', 'PublicTopBar', 'PublicHeader', 'PublicFooter', 'PublicAccessibilityBar',
];

function DesignSystemContent() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Design System</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            UX4G/GIGW-readiness aligned public website design system. Tokens, components, presets, and layout for the Government Design System Template.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/templates/design-system/tokens">
            <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
              <Sliders className="h-4 w-4" /> Theme Tokens
            </button>
          </Link>
          <Link href="/templates/design-system/components">
            <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
              <Grid className="h-4 w-4" /> Components
            </button>
          </Link>
        </div>
      </div>

      {/* Accessibility Disclaimer */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-800">
        <strong>GIGW-Readiness Aligned · UX4G-Compatible Layout</strong>
        <p className="mt-1 text-xs text-blue-700 opacity-90">
          This design system follows UX4G/GIGW readiness patterns including skip links, semantic landmarks, keyboard navigation, high contrast, and reduced motion.
          Official GIGW certification requires separate assessment. Full WCAG compliance requires manual testing with assistive technologies.
        </p>
      </div>

      {/* Theme Presets */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Theme Presets</CardTitle>
              <CardDescription>6 government-ready presets, selectable from Template Builder</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {THEME_PRESETS.map((preset) => (
              <div key={preset.key} className="rounded-lg border p-4 hover:border-primary/50 hover:shadow-sm transition-all">
                <div className="flex gap-2 mb-3">
                  <div className="h-6 w-6 rounded-full border shadow-sm" style={{ background: preset.primary }} />
                  <div className="h-6 w-6 rounded-full border shadow-sm" style={{ background: preset.secondary }} />
                  <div className="h-6 w-6 rounded-full border shadow-sm" style={{ background: preset.accent }} />
                </div>
                <p className="text-xs font-semibold">{preset.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{preset.key}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/templates/design-system/presets">
              <button className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                <Eye className="h-3.5 w-3.5" /> View all presets and apply to template
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Design Tokens */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sliders className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Design Tokens</CardTitle>
              <CardDescription>CSS custom properties under :root — all overrideable from template theme settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DESIGN_TOKENS_GROUPS.map((group) => (
              <div key={group.label} className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{group.label}</span>
                  <span className="text-[10px] text-muted-foreground bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{group.count} tokens</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{group.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/templates/design-system/tokens">
              <button className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                <Sliders className="h-3.5 w-3.5" /> View token reference
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Component Library */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Grid className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Public Component Library</CardTitle>
              <CardDescription>{PUBLIC_COMPONENTS.length} reusable design-system components used by all module renderers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PUBLIC_COMPONENTS.map((name) => (
              <span key={name} className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs font-mono hover:bg-primary/5 hover:border-primary/30 transition-colors">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {name}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/templates/design-system/components">
              <button className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                <Grid className="h-3.5 w-3.5" /> View component library
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Government Design System Template */}
      <Card className="border-blue-200 bg-blue-50/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xl">🏛</div>
            <div>
              <CardTitle className="text-base">Government Design System Template</CardTitle>
              <CardDescription>
                Slug: <code className="text-xs font-mono">government-design-system</code> · Type: GOVERNMENT · Version: 1.0.0
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">Supported Sections (18)</p>
              <p className="text-xs text-muted-foreground">topbar, header, navigation, hero, announcements, quick_access, latest_updates, services, schemes, tenders, newsroom, departments, documents, rti, statistics, gallery, footer, chatbot</p>
            </div>
            <div>
              <p className="font-medium mb-1">Supported Modules (32)</p>
              <p className="text-xs text-muted-foreground">All government, content, utility, engagement, and structure modules. Disabled CMS modules are hidden from palette and render data.</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Link href="/templates/onboarding">
              <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                Select this template
              </button>
            </Link>
            <Link href="/templates/builder">
              <button className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted">
                Open Layout Builder
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility / GIGW */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accessibility & GIGW Readiness</CardTitle>
          <CardDescription>Built-in accessibility features in the design system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              ['✓', 'Skip to main content link'],
              ['✓', 'Semantic HTML landmarks'],
              ['✓', 'Keyboard-accessible navigation'],
              ['✓', 'Visible focus states (3px ring)'],
              ['✓', 'ARIA labels on interactive elements'],
              ['✓', 'Alt text on all public images'],
              ['✓', 'High contrast mode toggle'],
              ['✓', 'Font size controls (80%–150%)'],
              ['✓', 'Reduced motion support'],
              ['✓', 'Mobile touch targets (44px min)'],
              ['✓', 'Responsive tables'],
              ['✓', 'Accessible accordion (FAQ)'],
              ['✓', 'Color contrast-ready tokens'],
              ['✓', 'lang attribute support'],
              ['✓', 'GIGW-required footer links'],
              ['✓', 'Accessibility statement link'],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-start gap-2 rounded-md bg-green-50 border border-green-100 px-3 py-2">
                <span className="text-green-600 font-bold shrink-0">{icon}</span>
                <span className="text-xs text-green-800">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <AdminPageShell sectionTitle="Design System">
      {() => <DesignSystemContent />}
    </AdminPageShell>
  );
}
