'use client';

import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const COMPONENT_DOCS = [
  {
    name: 'PublicButton',
    category: 'Actions',
    description: 'Accessible button with variants (primary, secondary, outline, ghost, link, danger) and sizes (sm, md, lg). Supports loading state and keyboard focus ring.',
    props: 'variant, size, loading, disabled, children, className',
    usage: 'All CTAs, form submits, navigation actions.',
  },
  {
    name: 'PublicBadge',
    category: 'Display',
    description: 'Compact status label. Variants: default, success, warning, error, info, new, important.',
    props: 'variant, children, className',
    usage: 'Content status, category tags, priority indicators.',
  },
  {
    name: 'PublicCard',
    category: 'Layout',
    description: 'Reusable content card with header, body, footer, image, badge, CTA slots. Variants: flat, bordered, elevated, government.',
    props: 'variant, header, footer, image, badge, cta, children',
    usage: 'Blog posts, services, schemes, tenders, news items.',
  },
  {
    name: 'PublicSection',
    category: 'Layout',
    description: 'Section wrapper with optional title, subtitle, description, action link. Background variants: default, surface, primary, muted, transparent.',
    props: 'title, subtitle, description, actionLink, backgroundVariant, layoutVariant, spacingVariant',
    usage: 'Wraps all module content sections for consistent spacing and headings.',
  },
  {
    name: 'PublicGrid',
    category: 'Layout',
    description: 'Responsive mobile-first grid. 1–6 columns, sm/md/lg gap settings.',
    props: 'cols (1-6), gap (sm|md|lg)',
    usage: 'Services, schemes, schemes, statistics, gallery grids.',
  },
  {
    name: 'PublicAlert',
    category: 'Feedback',
    description: 'Dismissible notice block. Variants: info, success, warning, error, notice.',
    props: 'variant, title, children',
    usage: 'Announcements, form errors, tender notices, important notifications.',
  },
  {
    name: 'PublicTable',
    category: 'Data',
    description: 'Accessible responsive table with empty state, caption, and custom cell renderers.',
    props: 'columns, rows, emptyMessage, caption',
    usage: 'Tender lists, document lists, contact directories.',
  },
  {
    name: 'PublicAccordion',
    category: 'Navigation',
    description: 'Keyboard-accessible expand/collapse accordion for FAQs and content disclosure.',
    props: 'items (question + answer), allowMultiple',
    usage: 'FAQ List module, RTI disclosure sections.',
  },
  {
    name: 'PublicBreadcrumb',
    category: 'Navigation',
    description: 'Accessible breadcrumb with schema.org BreadcrumbList markup.',
    props: 'items (label + href)',
    usage: 'All public detail pages, category pages.',
  },
  {
    name: 'PublicPagination',
    category: 'Navigation',
    description: 'Accessible page controls for list modules.',
    props: 'currentPage, totalPages, onPageChange',
    usage: 'Blog, document, tender, scheme, newsroom list modules.',
  },
  {
    name: 'PublicStatCard',
    category: 'Display',
    description: 'Statistics counter card with icon, value, label, description.',
    props: 'label, value, description, icon',
    usage: 'Statistics Counters module.',
  },
  {
    name: 'PublicLinkList',
    category: 'Navigation',
    description: 'Footer links, quick links, policy links. Vertical or horizontal orientation.',
    props: 'items, title, orientation',
    usage: 'Footer module columns, quick links widget.',
  },
  {
    name: 'PublicContainer',
    category: 'Layout',
    description: 'Responsive max-width wrapper using --public-container-width token.',
    props: 'children, as, narrow, className',
    usage: 'Any section needing contained width.',
  },
  {
    name: 'PublicImage',
    category: 'Media',
    description: 'Optimized image with required alt text, lazy loading, and responsive sizing.',
    props: 'src, alt (required), width, height, loading, objectFit, rounded',
    usage: 'Any public image rendering in cards, galleries, hero.',
  },
  {
    name: 'PublicSearchBox',
    category: 'Forms',
    description: 'Accessible site-wide search input with role="search" and label.',
    props: 'placeholder, searchPath, compact',
    usage: 'Header search, topbar search.',
  },
  {
    name: 'PublicSkipLink',
    category: 'Accessibility',
    description: 'Skip to main content link. Visually hidden until keyboard focused. WCAG 2.4.1.',
    props: 'none',
    usage: 'First element in every public page layout.',
  },
  {
    name: 'PublicTopBar',
    category: 'Layout',
    description: 'Utility bar for accessibility controls, language switcher, social links.',
    props: 'leftContent, rightContent',
    usage: 'TOPBAR region.',
  },
  {
    name: 'PublicHeader',
    category: 'Layout',
    description: 'Government header with emblem, logo, site name, tagline, search, and actions.',
    props: 'emblemUrl, logoUrl, siteName, tagline, searchSlot, actionsSlot',
    usage: 'HEADER region.',
  },
  {
    name: 'PublicFooter',
    category: 'Layout',
    description: 'Government footer with mandatory GIGW policy links, last updated, visitor count.',
    props: 'siteName, description, logoUrl, columnsSlot, lastUpdated, visitorCount',
    usage: 'FOOTER region.',
  },
  {
    name: 'PublicAccessibilityBar',
    category: 'Accessibility',
    description: 'Inline accessibility controls (font size A- A A+, high contrast toggle) for topbar use.',
    props: 'none',
    usage: 'TOPBAR region alongside social links.',
  },
];

const categories = [...new Set(COMPONENT_DOCS.map((c) => c.category))];

function ComponentsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Public Component Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {COMPONENT_DOCS.length} reusable components built on design tokens for all public module renderers.
          Located at <code className="text-xs font-mono">apps/public-web/src/design-system/components/</code>.
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{cat}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {COMPONENT_DOCS.filter((c) => c.category === cat).map((comp) => (
              <Card key={comp.name} className="overflow-hidden">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono">{comp.name}</CardTitle>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{comp.category}</span>
                  </div>
                  <CardDescription className="text-xs">{comp.description}</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1.5">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Props</span>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{comp.props}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Used by</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{comp.usage}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ComponentLibraryPage() {
  return (
    <AdminPageShell sectionTitle="Component Library">
      {() => <ComponentsContent />}
    </AdminPageShell>
  );
}
