# Public Template Rendering

## Overview

The Public Template Rendering system powers the `apps/public-web` Next.js 14 application. It fetches the active website template from the backend API at server-render time and transforms it into a fully rendered public website using a component hierarchy: **TemplateRenderer → RegionRenderer → ModuleRenderer → ModuleComponent**.

Key capabilities:

- Server-side rendering of template regions and modules for fast initial page loads
- Automatic fallback layout when no active template exists or the API is unreachable
- 11 built-in module components covering navigation, content, blogs, documents, FAQs, forms, search, chatbot, custom HTML, and media galleries
- HTML sanitization for all user-generated content
- SEO metadata generation with Open Graph support
- ISR (Incremental Static Regeneration) with configurable revalidation intervals

---

## Architecture

### Component Hierarchy

```
TemplateRenderer (Server Component)
│
├── Fetches render data from GET /public/template/render-data
├── If template exists → renders sorted RegionRenderers
├── If template is null/error → renders FallbackLayout
│
├── RegionRenderer (Server Component)
│   ├── Maps regionType to semantic HTML landmark element
│   ├── Skips inactive regions (isActive: false)
│   ├── Sorts child modules by sortOrder
│   │
│   └── ModuleRenderer (Server Component)
│       ├── Resolves moduleType via module-registry.ts
│       ├── Passes configJson as `config` prop
│       ├── Wraps component in ModuleErrorBoundary
│       ├── Dev mode: shows placeholder for unknown types
│       └── Production: silently skips unknown types
│           │
│           └── ModuleComponent
│               └── (NavigationModule, PageContentModule, BlogListModule, etc.)
│
└── FallbackLayout (Server Component)
    ├── SkipLink → header → nav → main → footer
    └── Uses NEXT_PUBLIC_SITE_NAME env variable
```

### Directory Structure

```
apps/public-web/src/
├── app/
│   ├── layout.tsx                    # Root layout with TemplateRenderer
│   ├── page.tsx                      # Homepage
│   ├── pages/[slug]/page.tsx         # Individual pages
│   ├── blog/
│   │   ├── page.tsx                  # Blog listing
│   │   └── [slug]/page.tsx           # Blog detail
│   ├── documents/page.tsx            # Document listing
│   ├── faqs/page.tsx                 # FAQ listing
│   └── forms/[slug]/page.tsx         # Form embed
├── components/
│   ├── template/
│   │   ├── template-renderer.tsx     # Root orchestrator
│   │   ├── region-renderer.tsx       # Region → landmark mapping
│   │   ├── module-renderer.tsx       # Module type resolution
│   │   └── fallback-layout.tsx       # Default layout
│   ├── modules/
│   │   ├── navigation.tsx            # Navigation bar (client)
│   │   ├── page-content.tsx          # Page body (server)
│   │   ├── blog-list.tsx             # Blog listing (server)
│   │   ├── document-list.tsx         # Document listing (server)
│   │   ├── faq-list.tsx              # FAQ accordion (server + client)
│   │   ├── form-embed.tsx            # Form renderer (client)
│   │   ├── footer-module.tsx         # Footer (server)
│   │   ├── chatbot-module.tsx        # Chatbot wrapper (client)
│   │   ├── search-module.tsx         # Search (client)
│   │   ├── custom-html.tsx           # Custom HTML (server)
│   │   └── media-gallery.tsx         # Media grid (server)
│   └── ui/
│       ├── skip-link.tsx             # Skip-to-content link
│       └── error-boundary.tsx        # Module error boundary (client)
├── lib/
│   ├── api-client.ts                 # Server-side API fetch utility
│   ├── sanitize-html.ts             # HTML sanitization
│   ├── module-registry.ts           # Module type → component map
│   └── metadata.ts                  # SEO metadata generation
└── types/
    ├── template.ts                   # Template, Region, Module types
    └── content.ts                    # Page, Blog, Document, FAQ, Form types
```

---

## Data Flow

### Request Lifecycle

1. **Browser request** arrives at a Next.js App Router page (e.g., `/blog/my-post`).
2. The root `layout.tsx` renders `<TemplateRenderer>` wrapping the page content.
3. **TemplateRenderer** calls `fetchRenderData()` which hits `GET /public/template/render-data` on the backend API.
4. The response is cached using Next.js fetch cache with a revalidation interval of `TEMPLATE_REVALIDATE_SECONDS` (default: 60s).
5. If the response contains a valid template, regions are sorted by `sortOrder` and each is passed to a **RegionRenderer**.
6. Each **RegionRenderer** maps its `regionType` to a semantic HTML element, sorts its modules by `sortOrder`, and renders each via **ModuleRenderer**.
7. **ModuleRenderer** looks up the `moduleType` in the module registry, passes `configJson` as the `config` prop, and wraps the result in a `ModuleErrorBoundary`.
8. The page's route-specific content (e.g., blog post detail) is injected as `children` into the CONTENT region.

### API Client

All server-side data fetching goes through `src/lib/api-client.ts`:

```typescript
const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const REVALIDATE_SECONDS = parseInt(process.env.TEMPLATE_REVALIDATE_SECONDS ?? '60', 10);

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) return null;
  return response.json() as Promise<T>;
}
```

On any network error or non-2xx response, `apiFetch` returns `null` — the system gracefully degrades rather than crashing.

---

## Component Reference

### TemplateRenderer

**File:** `src/components/template/template-renderer.tsx`
**Type:** Async Server Component

| Responsibility | Behavior |
|---|---|
| Fetch render data | Calls `fetchRenderData()` from api-client |
| Template exists | Sorts regions by `sortOrder`, renders `RegionRenderer` for each |
| Template is null/error | Renders `FallbackLayout` with page children |
| Content injection | Passes `children` to the region with `regionType === 'CONTENT'` |

### RegionRenderer

**File:** `src/components/template/region-renderer.tsx`
**Type:** Server Component

| Responsibility | Behavior |
|---|---|
| Semantic mapping | Maps `regionType` to HTML landmark element |
| Inactive filtering | Returns `null` if `region.isActive` is `false` |
| Module ordering | Sorts modules by `sortOrder` ascending |
| Data attribute | Applies `data-region={region.regionKey}` to the element |

**Region type → HTML element mapping:**

| regionType | HTML Element |
|---|---|
| `HEADER` | `<header>` |
| `NAVIGATION` | `<nav>` |
| `CONTENT` | `<main>` |
| `FOOTER` | `<footer>` |
| `CHATBOT` | `<aside>` |
| _(unknown)_ | `<section>` |

### ModuleRenderer

**File:** `src/components/template/module-renderer.tsx`
**Type:** Server Component

| Responsibility | Behavior |
|---|---|
| Type resolution | Calls `resolveModule(module.moduleType)` from module-registry |
| Config passthrough | Passes `module.configJson` as `config` prop |
| Error isolation | Wraps component in `ModuleErrorBoundary` |
| Unknown type (dev) | Renders amber dashed placeholder with module type name |
| Unknown type (prod) | Returns `null` silently |

### FallbackLayout

**File:** `src/components/template/fallback-layout.tsx`
**Type:** Server Component

Renders a minimal accessible layout when no template is active:
- `<SkipLink>` as first element
- `<header>` with site name from `NEXT_PUBLIC_SITE_NAME`
- `<nav>` with links to Home, Blog, Documents, FAQs
- `<main id="main-content">` wrapping page children
- `<footer>` with copyright

---

## Module Components

All module components accept the `ModuleComponentProps` interface:

```typescript
interface ModuleComponentProps {
  config: Record<string, unknown> | null;
  moduleKey: string;
}
```

| moduleType Key | Component | Rendering | Description |
|---|---|---|---|
| `NAVIGATION` | NavigationModule | Client | Responsive nav bar with active route highlighting and keyboard navigation |
| `PAGE_CONTENT` | PageContentModule | Server | Renders page title, sanitized HTML body, and featured image |
| `BLOG_LIST` | BlogListModule | Server | Paginated blog listing with title, excerpt, image, and date |
| `DOCUMENT_LIST` | DocumentListModule | Server | Document listing with category filtering and download links |
| `FAQ_LIST` | FaqListModule | Server + Client | Accessible accordion with ARIA attributes and keyboard interaction |
| `FORM_EMBED` | FormEmbedModule | Client | Dynamic form rendering with validation and submission handling |
| `FOOTER` | FooterModule | Server | Configurable footer with links, contact info, and copyright |
| `CHATBOT` | ChatbotModule | Client | Async-loaded chatbot widget that doesn't block page render |
| `SEARCH` | SearchModule | Client | Debounced search input with cross-content results |
| `CUSTOM_HTML` | CustomHtmlModule | Server | Sanitized custom HTML from configJson |
| `MEDIA_GALLERY` | MediaGalleryModule | Server | Responsive image grid with alt text and keyboard navigation |

---

## Creating New Modules

Follow these steps to add a new module component to the system:

### Step 1: Create the Component File

Create a new file in `src/components/modules/`:

```typescript
// src/components/modules/my-new-module.tsx
import type { ModuleComponentProps } from '@/types/template';

export function MyNewModule({ config, moduleKey }: ModuleComponentProps) {
  // Access configuration from config object
  const title = (config?.title as string) ?? 'Default Title';

  return (
    <div data-module={moduleKey}>
      <h2>{title}</h2>
      {/* Your module content */}
    </div>
  );
}
```

For client-side interactivity, add the `'use client'` directive at the top of the file.

### Step 2: Define the moduleType Key

Choose a unique uppercase key for your module (e.g., `MY_NEW_MODULE`). This key is used in the template configuration to reference your module.

### Step 3: Register in the Module Registry

Open `src/lib/module-registry.ts` and add your module:

```typescript
import { MyNewModule } from '@/components/modules/my-new-module';

const MODULE_MAP: Record<string, ComponentType<ModuleComponentProps>> = {
  // ... existing modules
  MY_NEW_MODULE: MyNewModule,
};
```

### Step 4: Configure in Template

Add a module entry in the template's region configuration (via the admin CMS or template.json) with:
- `moduleType`: Your chosen key (e.g., `MY_NEW_MODULE`)
- `moduleKey`: A unique instance identifier
- `configJson`: Configuration object your component expects
- `sortOrder`: Position within the region

### Guidelines

- **Server components** (default): Best for static content that doesn't need interactivity. No `'use client'` directive needed.
- **Client components**: Use `'use client'` when you need event handlers, state, or browser APIs.
- **Error handling**: Your module is automatically wrapped in `ModuleErrorBoundary` — if it throws, the rest of the page continues rendering.
- **Config shape**: Document what your module expects in `configJson` so template authors know how to configure it.

---

## Public Routes

| Route | Description | Data Source (API Endpoint) |
|---|---|---|
| `/` | Homepage | Template render data only |
| `/pages/[slug]` | Individual page | `GET /public/pages/:slug` via `fetchPageBySlug(slug)` |
| `/blog` | Blog listing | `GET /public/blogs` via `fetchBlogPosts(page, limit)` |
| `/blog/[slug]` | Blog post detail | `GET /public/blogs/:slug` via `fetchBlogBySlug(slug)` |
| `/documents` | Document listing | `GET /public/documents` via `fetchDocuments(category?)` |
| `/faqs` | FAQ listing | `GET /public/faqs` via `fetchFaqs()` |
| `/forms/[slug]` | Form embed | `GET /public/forms/:slug` via `fetchFormBySlug(slug)` |

All routes are wrapped by `TemplateRenderer` in the root layout, so the template shell (header, navigation, footer, etc.) renders around every page automatically.

### Error Handling by Route

| Scenario | Behavior |
|---|---|
| Page/blog slug not found | Returns Next.js `notFound()` → 404 page |
| API unreachable | TemplateRenderer renders FallbackLayout |
| Module throws error | ErrorBoundary catches it; rest of page renders normally |

---

## Starter Template

The starter template is a GIGW-compliant template package located at `packages/starter-template/`.

### Structure

```
packages/starter-template/
├── template.json       # Template metadata, regions, and module assignments
├── index.html          # Base HTML structure with GIGW-required sections
└── styles.css          # Responsive styles meeting GIGW guidelines
```

### template.json

Defines the template configuration:

- **Metadata**: name, slug, version, templateType (`GOVERNMENT`)
- **Regions**: header, navigation, main, sidebar, footer (each with regionType, sortOrder, isActive)
- **Module assignments**: Pre-configured modules for Navigation, PageContent, BlogList, DocumentList, FaqList, FormEmbed, Footer, Chatbot, and Search

### Importing a Custom Template

To create and import a custom template:

1. **Create a template.json** following this structure:

```json
{
  "name": "My Custom Template",
  "slug": "my-custom-template",
  "version": "1.0.0",
  "templateType": "CUSTOM",
  "description": "A custom template for my organization",
  "regions": [
    {
      "regionKey": "header",
      "regionName": "Header",
      "regionType": "HEADER",
      "sortOrder": 1,
      "isRequired": true,
      "isActive": true,
      "modules": [
        {
          "moduleType": "NAVIGATION",
          "moduleKey": "main-nav",
          "displayTitle": "Main Navigation",
          "configJson": {},
          "sortOrder": 1,
          "isVisible": true
        }
      ]
    },
    {
      "regionKey": "content",
      "regionName": "Main Content",
      "regionType": "CONTENT",
      "sortOrder": 2,
      "isRequired": true,
      "isActive": true,
      "modules": [
        {
          "moduleType": "PAGE_CONTENT",
          "moduleKey": "page-body",
          "displayTitle": "Page Content",
          "configJson": {},
          "sortOrder": 1,
          "isVisible": true
        }
      ]
    },
    {
      "regionKey": "footer",
      "regionName": "Footer",
      "regionType": "FOOTER",
      "sortOrder": 3,
      "isRequired": true,
      "isActive": true,
      "modules": [
        {
          "moduleType": "FOOTER",
          "moduleKey": "site-footer",
          "displayTitle": "Site Footer",
          "configJson": {
            "copyright": "© 2024 My Organization",
            "links": []
          },
          "sortOrder": 1,
          "isVisible": true
        }
      ]
    }
  ]
}
```

2. **Import via the Admin CMS**: Use the template management interface in `apps/admin-web` to upload and activate your template.

3. **Activate the template**: Set `isActive: true` on your template record. Only one template can be active at a time — the backend enforces this constraint.

4. **Verify**: Visit the public site. The TemplateRenderer will fetch your new template's render data and render it accordingly.

### Available Module Types for Templates

Use any of the 11 registered module types in your template regions:

`NAVIGATION`, `PAGE_CONTENT`, `BLOG_LIST`, `DOCUMENT_LIST`, `FAQ_LIST`, `FORM_EMBED`, `FOOTER`, `CHATBOT`, `SEARCH`, `CUSTOM_HTML`, `MEDIA_GALLERY`

---

## Environment Variables

| Variable | Description | Default | Required |
|---|---|---|---|
| `PUBLIC_API_BASE_URL` | Backend API base URL for server-side fetching | `http://localhost:3001` | No |
| `TEMPLATE_REVALIDATE_SECONDS` | ISR revalidation interval (seconds) for cached API responses | `60` | No |
| `NEXT_PUBLIC_SITE_NAME` | Site name displayed in FallbackLayout and browser title | `AI CMS` | No |

Set these in `apps/public-web/.env.local` for local development:

```env
PUBLIC_API_BASE_URL=http://localhost:3001
TEMPLATE_REVALIDATE_SECONDS=60
NEXT_PUBLIC_SITE_NAME=My Organization
```

---

## Security

### HTML Sanitization

All user-generated HTML content (page bodies, blog posts, custom HTML modules) is sanitized before rendering via `src/lib/sanitize-html.ts`:

- **Stripped**: `<script>` tags and their content, inline event handlers (`onclick`, `onerror`, `onload`, etc.), `javascript:` protocol URLs, `<style>` tags containing expressions/behaviors
- **Preserved**: Safe structural elements (`div`, `p`, `h1`–`h6`, `a`, `img`, `table`, `ul`, `ol`, `blockquote`, `pre`, `code`, etc.), safe attributes (`href`, `src`, `alt`, `class`, `id`, `aria-*`, `role`, etc.)

### Security Headers

The Next.js configuration applies these headers to all routes:

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking via iframes |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer information |
| `X-DNS-Prefetch-Control` | `on` | Enables DNS prefetching for performance |

### No Client-Side Tokens

The public-web application never stores or exposes JWT tokens:

- All authenticated API calls happen server-side only via `api-client.ts`
- No tokens are stored in browser localStorage, sessionStorage, or cookies
- Internal API URLs are not exposed to the client bundle

### Published-Only Content

The backend API enforces that only content with `status: PUBLISHED` is returned via public endpoints. The frontend does not implement its own status filtering — this is a server-side guarantee.
