# Government Design System Template

## Overview

The Government Design System Template (`government-design-system`) is a modern, accessible, design-system-based public website template for Government of India departments, ministries, schemes, services, tenders, disclosures, and citizen services.

It is built on a structured design token system, a reusable public component library, and is fully compatible with the Public Template Builder. It is not a hardcoded template — all sections, modules, themes, and layout are configurable by admins from the Template Builder.

---

## Design System Reference

The design system is based on UX4G/GIGW-readiness principles aligned with:
- [Digital India UX4G Design System](https://dic.gov.in/ux4g/)
- GIGW (Guidelines for Indian Government Websites)
- WCAG 2.1 accessibility guidelines

**Implementation location:** `apps/public-web/src/design-system/`

---

## Design Tokens

All CSS custom properties live in `apps/public-web/src/design-system/styles/public-theme.css` and are exported as TypeScript constants from `apps/public-web/src/design-system/tokens/`.

| Group | Tokens | CSS Prefix |
|---|---|---|
| Colors | 20 tokens | `--public-*` |
| Typography | 14 tokens | `--public-font-*` |
| Spacing | 13 tokens | `--public-space-*` |
| Radius | 1 token | `--public-radius` |
| Shadows | 5 tokens | `--public-shadow-*` |
| Layout | 7 tokens | `--public-container-*`, `--public-section-*` |
| Accessibility | 2 tokens | `--public-min-touch-target`, `--public-focus-ring` |

### Key Color Tokens

```css
--public-primary: #1a3d7c;        /* Government blue */
--public-secondary: #2c5282;      /* Navigation / footer */
--public-accent: #2b7ee0;         /* Interactive / links */
--public-background: #ffffff;
--public-surface: #f4f7fb;
--public-text: #1a1a2e;
--public-text-muted: #4a5568;
--public-border: #d2daea;
--public-focus-ring: #fbbf24;     /* Amber — WCAG compliant */
```

Token values are overridden at runtime by `TemplateRenderer` using inline CSS variables from the active template's `configJson.themeSettings`. Modules receive the active theme via the `theme` prop.

---

## Theme Presets

| Key | Name | Use Case |
|---|---|---|
| `digital-india-blue` | Digital India Blue | General government departments |
| `government-green` | Government Green | Environment, agriculture, rural departments |
| `neutral-ministry` | Neutral Ministry | Administrative ministries |
| `high-contrast` | High Contrast | Accessibility-first deployments |
| `service-portal` | Service Portal | Citizen service portals, e-governance apps |
| `news-portal` | News & Updates Portal | Newsroom, press, media portals |

Presets are selectable from **Templates → Customize → Color Presets** and stored in `configJson.themeSettings.activeThemePreset`.

---

## Layout Sections

The template has 18 configurable sections (regions), each a `TemplateRegion` record:

| Region Key | Type | Default State | Description |
|---|---|---|---|
| `topbar` | TOPBAR | Active | Accessibility controls, social links |
| `header` | HEADER | Active (required) | Emblem, logo, site name, search |
| `navigation` | NAVIGATION | Active (required) | Primary nav menu |
| `hero` | HERO | Active | Hero banner, CTAs |
| `announcements` | CONTENT | Active | Notice board, alerts |
| `quick_access` | CONTENT | Active | Citizen quick-access grid |
| `latest_updates` | CONTENT | Active | Blog posts, news |
| `services` | CONTENT | Inactive | Citizen services |
| `schemes` | CONTENT | Inactive | Government schemes |
| `tenders` | CONTENT | Inactive | Tenders/procurement |
| `newsroom` | CONTENT | Active | Newsroom items |
| `departments` | CONTENT | Inactive | Contact directory |
| `documents` | CONTENT | Active | Documents + RTI |
| `rti` | CONTENT | — | RTI Disclosure (in documents region) |
| `statistics` | CONTENT | Active | Key statistics counters |
| `gallery` | CONTENT | Active | Media gallery |
| `footer` | FOOTER | Active (required) | Policy links, copyright |
| `chatbot` | CHATBOT | Active | Floating chatbot widget |

---

## Public Components

All components are in `apps/public-web/src/design-system/components/` and `layout/`.

| Component | Category | Usage |
|---|---|---|
| `PublicButton` | Actions | CTAs, forms, navigation actions |
| `PublicBadge` | Display | Status, category, priority labels |
| `PublicCard` | Layout | Blog, services, schemes, news cards |
| `PublicSection` | Layout | All module section wrappers |
| `PublicGrid` | Layout | Cards, services, stats grids |
| `PublicAlert` | Feedback | Notices, errors, announcements |
| `PublicTable` | Data | Tenders, documents, contacts |
| `PublicAccordion` | Navigation | FAQ, RTI disclosures |
| `PublicBreadcrumb` | Navigation | All detail pages |
| `PublicPagination` | Navigation | Blog, tender, document lists |
| `PublicStatCard` | Display | Statistics module |
| `PublicLinkList` | Navigation | Footer columns, quick links |
| `PublicContainer` | Layout | Max-width content wrapper |
| `PublicImage` | Media | Lazy-loaded, accessible images |
| `PublicSearchBox` | Forms | Header search, topbar search |
| `PublicSkipLink` | Accessibility | WCAG bypass block |
| `PublicTopBar` | Layout | Utility bar region |
| `PublicHeader` | Layout | Government header region |
| `PublicFooter` | Layout | Government footer with GIGW links |
| `PublicAccessibilityBar` | Accessibility | Inline font/contrast controls |

---

## Accessibility / GIGW Readiness

This template follows UX4G/GIGW-readiness patterns:

- ✅ Skip to main content link (WCAG 2.4.1)
- ✅ Semantic HTML landmarks (`header`, `nav`, `main`, `footer`, `section`, `aside`)
- ✅ Keyboard-accessible navigation
- ✅ Visible focus states — 3px amber ring on all interactive elements
- ✅ ARIA labels on buttons, forms, dialogs
- ✅ Alt text required on all `PublicImage` components
- ✅ High contrast mode toggle (CSS filter + `public-high-contrast` class)
- ✅ Font size controls 80%–150%
- ✅ Reduced motion via `@media (prefers-reduced-motion: reduce)`
- ✅ Min touch targets (44px via `--public-min-touch-target`)
- ✅ Accessible accordion (FAQ) with `aria-expanded`, `aria-controls`
- ✅ Accessible pagination with `aria-current="page"` and `aria-label`
- ✅ Schema.org BreadcrumbList in `PublicBreadcrumb`
- ✅ `lang` attribute support on `<html>`
- ✅ GIGW mandatory footer links (Website Policies, Accessibility Statement, Sitemap, Help, Feedback, Contact Us, Terms of Use)
- ✅ Color contrast-ready tokens (dark text on light backgrounds)

> **Important:** This design system uses GIGW-readiness aligned patterns. Official GIGW certification requires separate assessment. Full WCAG compliance requires manual testing with assistive technologies and expert accessibility review.

---

## Module Support

The template supports all 32 registered public module types. Module palette is filtered by:
1. `CmsModule.isEnabledGlobally === true`
2. `CmsModule.isTemplateAvailable === true`
3. `CmsModule.isPublicEnabled === true`
4. Template's `configJson.supportedModules` list

Disabled modules do not appear in the builder palette and are filtered from public render data before the public site receives it.

---

## Template Builder Integration

1. Go to **Templates → Select Template** and activate `Government Design System Template`.
2. Navigate to **Templates → Layout Builder** to add/remove/reorder modules.
3. Navigate to **Templates → Customize** to select a theme preset and adjust colors, fonts, and spacing.
4. Use **Templates → Builder** for the full 3-panel visual builder with device preview.
5. Preview at desktop/tablet/mobile widths in the builder toolbar.
6. Click **Activate** to publish the layout to the public website.

---

## Testing Steps

1. Seed templates: `POST /templates/seed` (or run from admin → Templates).
2. Activate `government-design-system` template.
3. Open Template Builder and verify all 18 regions are present.
4. Add a module to a region and configure it in the Settings panel.
5. Open the public website and verify the module renders.
6. Toggle high contrast and font size in the accessibility toolbar.
7. Tab through the page — all elements should have visible focus rings.
8. Check that the skip link is visible on keyboard focus.
9. Disable a CMS module (e.g. Tenders) in Module Management and verify it disappears from the builder palette and public site.
10. Change theme preset in Customize and verify CSS variables update on the public site.
