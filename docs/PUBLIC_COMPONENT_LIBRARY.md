# Public Component Library

All components are in `apps/public-web/src/design-system/`. They use CSS custom property design tokens and are compatible with all public module renderers.

---

## Components

### PublicButton

```tsx
import { PublicButton } from '@/design-system/components/PublicButton';

<PublicButton variant="primary" size="md" loading={false}>
  Submit Application
</PublicButton>
```

**Props:** `variant` (primary|secondary|outline|ghost|link|danger), `size` (sm|md|lg), `loading`, `disabled`, standard button props.

**Accessibility:** Focus ring via `--public-focus-ring`. Min touch target 44px. `aria-disabled` on loading/disabled.

---

### PublicBadge

```tsx
import { PublicBadge } from '@/design-system/components/PublicBadge';

<PublicBadge variant="success">Active</PublicBadge>
<PublicBadge variant="warning">Closing Soon</PublicBadge>
<PublicBadge variant="error">Urgent</PublicBadge>
```

**Props:** `variant` (default|success|warning|error|info|new|important).

---

### PublicCard

```tsx
import { PublicCard } from '@/design-system/components/PublicCard';

<PublicCard
  variant="government"
  header="Scheme Name"
  badge={<PublicBadge variant="new">New</PublicBadge>}
  cta={<PublicButton variant="outline" size="sm">Know More</PublicButton>}
  footer={<span>Category: Agriculture</span>}
>
  Scheme description text here.
</PublicCard>
```

**Props:** `variant` (flat|bordered|elevated|government), `header`, `footer`, `image` `{src, alt}`, `badge`, `cta`.

---

### PublicSection

```tsx
import { PublicSection } from '@/design-system/components/PublicSection';

<PublicSection
  title="Latest Tenders"
  subtitle="Procurement & Notices"
  actionLink={<Link href="/tenders">View all →</Link>}
  backgroundVariant="surface"
  spacingVariant="md"
>
  {/* module content */}
</PublicSection>
```

**Props:** `title`, `subtitle`, `description`, `actionLink`, `backgroundVariant` (default|surface|primary|muted|transparent), `layoutVariant` (contained|full), `spacingVariant` (none|sm|md|lg).

---

### PublicGrid

```tsx
import { PublicGrid } from '@/design-system/components/PublicGrid';

<PublicGrid cols={3} gap="md">
  <PublicCard>...</PublicCard>
  <PublicCard>...</PublicCard>
  <PublicCard>...</PublicCard>
</PublicGrid>
```

**Props:** `cols` (1|2|3|4|5|6), `gap` (sm|md|lg). Always mobile-first.

---

### PublicAlert

```tsx
import { PublicAlert } from '@/design-system/components/PublicAlert';

<PublicAlert variant="warning" title="Important Notice">
  The last date for tender submissions has been extended to 30 June 2026.
</PublicAlert>
```

**Props:** `variant` (info|success|warning|error|notice), `title`.

**Accessibility:** `role="alert"`.

---

### PublicTable

```tsx
import { PublicTable } from '@/design-system/components/PublicTable';

<PublicTable
  caption="Active Tenders"
  columns={[
    { key: 'title', header: 'Tender Title' },
    { key: 'closingDate', header: 'Closing Date', render: (v) => new Date(v as string).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (v) => <PublicBadge>{String(v)}</PublicBadge> },
  ]}
  rows={tenders}
  emptyMessage="No active tenders."
/>
```

**Accessibility:** `scope="col"` on headers, `caption` as screen-reader label.

---

### PublicAccordion

```tsx
import { PublicAccordion } from '@/design-system/components/PublicAccordion';

<PublicAccordion
  items={faqs.map(f => ({ question: f.question, answer: f.answer }))}
  allowMultiple
/>
```

**Accessibility:** `aria-expanded`, `aria-controls`, `role="region"` on panels. Keyboard: Tab to item, Enter/Space to toggle.

---

### PublicBreadcrumb

```tsx
import { PublicBreadcrumb } from '@/design-system/components/PublicBreadcrumb';

<PublicBreadcrumb items={[
  { label: 'Home', href: '/' },
  { label: 'Schemes', href: '/schemes' },
  { label: 'PM Kisan' },  // last item — no href
]} />
```

**Accessibility:** `aria-label="Breadcrumb"`, `aria-current="page"` on last item. Schema.org `BreadcrumbList`.

---

### PublicPagination

```tsx
'use client';
import { PublicPagination } from '@/design-system/components/PublicPagination';

<PublicPagination currentPage={2} totalPages={8} onPageChange={setPage} />
```

**Accessibility:** `aria-current="page"`, `aria-label` on prev/next buttons.

---

### PublicStatCard

```tsx
import { PublicStatCard } from '@/design-system/components/PublicStatCard';

<PublicStatCard label="Active Schemes" value="1,200+" icon="📋" />
```

---

### PublicSearchBox

```tsx
'use client';
import { PublicSearchBox } from '@/design-system/components/PublicSearchBox';

<PublicSearchBox placeholder="Search the portal..." compact />
```

**Accessibility:** `role="search"`, `<label>` with `sr-only`, keyboard submit.

---

### PublicSkipLink

```tsx
import { PublicSkipLink } from '@/design-system/layout/PublicSkipLink';
// Place as first element in <body>
<PublicSkipLink />
```

---

### PublicAccessibilityBar

```tsx
'use client';
import { PublicAccessibilityBar } from '@/design-system/layout/PublicAccessibilityBar';
// Place in TOPBAR region
<PublicAccessibilityBar />
```

Font size and high contrast preferences saved to `localStorage('a11y-prefs')`.

---

## Module Usage Examples

### Announcement List Module
Uses: `PublicSection`, `PublicBadge`, `Link`

### Tender List Module
Uses: `PublicSection`, `PublicTable`, `PublicBadge`

### Scheme/Service List Module
Uses: `PublicSection`, `PublicCard`, `PublicBadge`, `PublicGrid`, `PublicButton`

### Statistics Counters Module
Uses: `PublicSection`, `PublicStatCard`, `PublicGrid`

### FAQ List Module
Uses: `PublicSection`, `PublicAccordion`

### Newsroom List Module
Uses: `PublicSection`, `PublicCard`, `PublicBadge`, `PublicGrid`

### Document List Module
Uses: `PublicSection`, `PublicBadge`

### Quick Links Module
Uses: `PublicSection`, `PublicGrid`

### Footer Module
Uses: `PublicFooter`, `PublicLinkList`, `PublicGrid`
