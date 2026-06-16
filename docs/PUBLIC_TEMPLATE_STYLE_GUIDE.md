# Public Template Style Guide

This guide covers the visual language used across all public website templates, with a focus on the Government Design System Template.

---

## Colors

All colors use CSS custom properties. Override them via Template Builder → Customize.

```css
/* Primary (header, buttons, headings) */
--public-primary: #1a3d7c;

/* Secondary (navigation, footer background) */
--public-secondary: #2c5282;

/* Accent (interactive links, CTA buttons) */
--public-accent: #2b7ee0;

/* Background / Surface */
--public-background: #ffffff;
--public-surface: #f4f7fb;
--public-surface-muted: #eef2f8;

/* Text */
--public-text: #1a1a2e;
--public-text-muted: #4a5568;
--public-text-inverse: #ffffff;

/* Focus ring (always amber for WCAG contrast) */
--public-focus-ring: #fbbf24;
```

**Usage rules:**
- Never use hardcoded hex colors in public components. Always use CSS variables.
- Focus rings must always use `--public-focus-ring` at 3px width.
- Error/success/warning states use semantic tokens: `--public-error`, `--public-success`, `--public-warning`.

---

## Typography

| Scale | Variable | Size | Usage |
|---|---|---|---|
| XS | `--public-font-size-xs` | 12px | Labels, captions |
| SM | `--public-font-size-sm` | 14px | Body secondary |
| Base | `--public-font-size-base` | 16px | Body primary |
| LG | `--public-font-size-lg` | 18px | Lead text |
| XL | `--public-font-size-xl` | 20px | Section intro |
| 2XL | `--public-font-size-2xl` | 24px | H3, card titles |
| 3XL | `--public-font-size-3xl` | 30px | H2 section titles |

**Font stack:** `'Noto Sans', Inter, ui-sans-serif, system-ui, -apple-system, sans-serif`

Noto Sans is recommended for Government of India websites due to its Hindi and regional script support.

---

## Spacing

Base unit: 4px (Tailwind-compatible). Use `--public-space-*` tokens or Tailwind spacing utilities.

```
1 → 4px    2 → 8px    3 → 12px   4 → 16px
6 → 24px   8 → 32px   12 → 48px  16 → 64px
```

Section padding: `--public-section-spacing` (default 3rem = 48px).

---

## Grid

Use `PublicGrid` with 1–6 columns. Always mobile-first:
- 1 column on mobile
- 2 columns on `sm` (640px+)
- Up to 4 columns on `lg` (1024px+)

**Container:** max-width `--public-container-width` (default 1200px), centered, with `px-4 sm:px-6 lg:px-8`.

---

## Cards

Use `PublicCard` with `variant="government"` for government content (adds top border in primary color).

Standard variants:
- `bordered` — default, white background with border
- `elevated` — white with shadow
- `flat` — surface background, no border
- `government` — bordered with 4px primary top accent

---

## Buttons

Use `PublicButton` with appropriate variants:

| Variant | When to use |
|---|---|
| `primary` | Main CTA, primary action |
| `secondary` | Secondary action |
| `outline` | Alternative action, less prominence |
| `ghost` | Toolbar actions, icon-only buttons |
| `link` | Inline text links that need button semantics |
| `danger` | Destructive actions |

Minimum touch target: 44px (enforced by `min-h-[var(--public-min-touch-target)]`).

---

## Badges

Use `PublicBadge` for status labels:

| Variant | Color | Use case |
|---|---|---|
| `default` | Grey | General labels |
| `success` | Green | Active, approved, completed |
| `warning` | Amber | Pending, closing soon |
| `error` | Red | Urgent, closed, rejected |
| `info` | Blue | Category, type |
| `new` | Primary blue | New items |
| `important` | Orange | Important notices |

---

## Tables

Use `PublicTable` for structured data (tenders, documents, contacts).

- Always include a `caption` for screen readers.
- Use `render` functions for custom cell content (badges, links).
- Provide an `emptyMessage` for empty states.

---

## Forms

All form inputs must have visible labels (never placeholder-only). Use `for`/`id` associations.
Focus styles: `focus:ring-2 focus:ring-[var(--public-accent)]` on inputs.

---

## Navigation

- Primary nav: horizontal on desktop, hamburger menu on mobile.
- All nav items must be keyboard accessible (Tab + Enter/Space).
- Active route: `border-bottom: 2px solid --public-accent`.
- Sticky navigation is controlled by `configJson.sticky` in the Navigation module config.

---

## Footer

The footer **must** include these GIGW-required links:
- Website Policies
- Accessibility Statement
- Sitemap
- Help
- Feedback
- Contact Us
- Terms of Use

These are built into `PublicFooter` and cannot be removed.

---

## Mobile Behaviour

- All layouts are mobile-first using Tailwind responsive prefixes.
- Cards stack to 1 column on mobile.
- Navigation collapses to hamburger menu.
- Touch targets minimum 44px.
- Table overflows horizontally with `overflow-x-auto`.
- Topbar accessibility controls hidden on very small screens.

---

## Accessibility Notes

- All `PublicImage` calls require a non-empty `alt` prop.
- Focus rings use `focus-visible:` pseudo-class (not `focus:`) to avoid showing rings on click.
- Accordion items use `aria-expanded`, `aria-controls`, and `role="region"`.
- Pagination uses `aria-current="page"` on the active button and `aria-label` on prev/next.
- Skip link: always first element in the document, `href="#main-content"`.
- The `<main>` element must have `id="main-content"` for the skip link to work.
