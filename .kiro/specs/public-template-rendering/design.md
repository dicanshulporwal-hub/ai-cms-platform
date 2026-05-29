# Design Document: Public Template Rendering

## Overview

The Public Template Rendering system transforms CMS template data into a fully rendered public website using Next.js 14 App Router. It fetches the active template's render data (regions and modules) from the backend API at server-render time, then orchestrates a component hierarchy — TemplateRenderer → RegionRenderer → ModuleRenderer → ModuleComponent — to produce semantic, accessible HTML. A fallback layout handles cases where no active template exists or the API is unreachable.

## Architecture

### High-Level Data Flow

```
Browser Request
    → Next.js App Router (Server Component)
        → TemplateRenderer fetches GET /public/template/render-data
            → If template exists: RegionRenderer[] (sorted by sortOrder)
                → ModuleRenderer[] per region (sorted by sortOrder)
                    → ModuleComponent (Navigation, PageContent, BlogList, etc.)
            → If template is null/error: FallbackLayout
```

### Rendering Strategy

- **Server Components**: TemplateRenderer, RegionRenderer, ModuleRenderer, PageContent, BlogList (initial data), DocumentList, FaqList, Footer, CustomHtml, MediaGallery
- **Client Components**: Navigation (active route highlighting), Search (debounced input), FormEmbed (form state/submission), ChatbotWidget (existing)

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
│   ├── forms/[slug]/page.tsx         # Form embed
│   └── api/chatbot/                  # Existing chatbot proxy
├── components/
│   ├── template/
│   │   ├── template-renderer.tsx     # Root orchestrator (server)
│   │   ├── region-renderer.tsx       # Region → landmark mapping (server)
│   │   ├── module-renderer.tsx       # Module type resolution (server)
│   │   └── fallback-layout.tsx       # Default layout (server)
│   ├── modules/
│   │   ├── navigation.tsx            # Navigation bar (client)
│   │   ├── page-content.tsx          # Page body renderer (server)
│   │   ├── blog-list.tsx             # Blog listing (server)
│   │   ├── document-list.tsx         # Document listing (server)
│   │   ├── faq-list.tsx              # FAQ accordion (server + client)
│   │   ├── form-embed.tsx            # Form renderer (client)
│   │   ├── footer-module.tsx         # Footer (server)
│   │   ├── chatbot-module.tsx        # Chatbot wrapper (client)
│   │   ├── search-module.tsx         # Search (client)
│   │   ├── custom-html.tsx           # Custom HTML (server)
│   │   └── media-gallery.tsx         # Media grid (server)
│   ├── chatbot-widget.tsx            # Existing chatbot (client)
│   └── ui/
│       ├── skip-link.tsx             # Skip-to-content link
│       └── error-boundary.tsx        # Module error boundary (client)
├── lib/
│   ├── api-client.ts                 # Server-side API fetch utility
│   ├── sanitize-html.ts             # HTML sanitization utility
│   ├── module-registry.ts           # Module type → component map
│   └── chatbot-api.ts               # Existing chatbot API
└── types/
    ├── template.ts                   # Template, Region, Module types
    ├── content.ts                    # Page, Blog, Document, FAQ types
    └── chatbot.ts                    # Existing chatbot types
```

## Components and Interfaces

### TemplateRenderer (Server Component)

The root orchestrator that fetches render data and decides between template-driven or fallback rendering.

```typescript
// apps/public-web/src/components/template/template-renderer.tsx
import { fetchRenderData } from '@/lib/api-client';
import { RegionRenderer } from './region-renderer';
import { FallbackLayout } from './fallback-layout';

interface TemplateRendererProps {
  children: React.ReactNode;
}

export async function TemplateRenderer({ children }: TemplateRendererProps) {
  const renderData = await fetchRenderData();

  if (!renderData || !renderData.template) {
    return <FallbackLayout>{children}</FallbackLayout>;
  }

  const { regions } = renderData;
  const sortedRegions = [...regions].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {sortedRegions.map((region) => (
        <RegionRenderer key={region.id} region={region}>
          {region.regionType === 'CONTENT' ? children : null}
        </RegionRenderer>
      ))}
    </>
  );
}
```

### RegionRenderer (Server Component)

Maps region types to semantic HTML landmarks and renders child modules.

```typescript
// apps/public-web/src/components/template/region-renderer.tsx
import { ModuleRenderer } from './module-renderer';
import type { TemplateRegion } from '@/types/template';

const REGION_ELEMENT_MAP: Record<string, keyof JSX.IntrinsicElements> = {
  HEADER: 'header',
  NAVIGATION: 'nav',
  CONTENT: 'main',
  FOOTER: 'footer',
  CHATBOT: 'aside',
};

interface RegionRendererProps {
  region: TemplateRegion;
  children?: React.ReactNode;
}

export function RegionRenderer({ region, children }: RegionRendererProps) {
  if (!region.isActive) return null;

  const Element = REGION_ELEMENT_MAP[region.regionType] ?? 'section';
  const sortedModules = [...region.modules].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Element data-region={region.regionKey}>
      {sortedModules.map((module) => (
        <ModuleRenderer key={module.id} module={module} />
      ))}
      {children}
    </Element>
  );
}
```

### ModuleRenderer (Server Component)

Resolves module types to components with error boundary protection.

```typescript
// apps/public-web/src/components/template/module-renderer.tsx
import { resolveModule } from '@/lib/module-registry';
import { ModuleErrorBoundary } from '@/components/ui/error-boundary';
import type { TemplateRegionModule } from '@/types/template';

interface ModuleRendererProps {
  module: TemplateRegionModule;
}

export function ModuleRenderer({ module }: ModuleRendererProps) {
  const ModuleComponent = resolveModule(module.moduleType);

  if (!ModuleComponent) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div data-module-placeholder={module.moduleType} className="border-2 border-dashed border-amber-400 p-4 text-amber-700">
          Unknown module type: {module.moduleType}
        </div>
      );
    }
    return null;
  }

  return (
    <ModuleErrorBoundary moduleName={module.displayTitle}>
      <ModuleComponent config={module.configJson} moduleKey={module.moduleKey} />
    </ModuleErrorBoundary>
  );
}
```

### FallbackLayout (Server Component)

```typescript
// apps/public-web/src/components/template/fallback-layout.tsx
import { SkipLink } from '@/components/ui/skip-link';

interface FallbackLayoutProps {
  children: React.ReactNode;
}

export function FallbackLayout({ children }: FallbackLayoutProps) {
  return (
    <>
      <SkipLink />
      <header data-region="header">
        <h1>{process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI CMS'}</h1>
      </header>
      <nav data-region="navigation" aria-label="Main navigation">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/documents">Documents</a></li>
          <li><a href="/faqs">FAQs</a></li>
        </ul>
      </nav>
      <main id="main-content" data-region="main">
        {children}
      </main>
      <footer data-region="footer">
        <p>&copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI CMS'}</p>
      </footer>
    </>
  );
}
```

### API Client

```typescript
// apps/public-web/src/lib/api-client.ts
import type { RenderData, PageData, BlogPost, DocumentItem, FaqItem, FormDefinition } from '@/types/content';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const REVALIDATE_SECONDS = parseInt(process.env.TEMPLATE_REVALIDATE_SECONDS ?? '60', 10);

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

export function fetchRenderData(): Promise<RenderData | null> {
  return apiFetch<RenderData>('/public/template/render-data');
}

export function fetchPageBySlug(slug: string): Promise<PageData | null> {
  return apiFetch<PageData>(`/public/pages/${slug}`);
}

export function fetchBlogPosts(page?: number, limit?: number): Promise<{ data: BlogPost[]; total: number } | null> {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (limit) params.set('limit', String(limit));
  return apiFetch(`/public/blogs?${params.toString()}`);
}

export function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  return apiFetch<BlogPost>(`/public/blogs/${slug}`);
}

export function fetchDocuments(category?: string): Promise<DocumentItem[] | null> {
  const params = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch<DocumentItem[]>(`/public/documents${params}`);
}

export function fetchFaqs(): Promise<FaqItem[] | null> {
  return apiFetch<FaqItem[]>('/public/faqs');
}

export function fetchFormBySlug(slug: string): Promise<FormDefinition | null> {
  return apiFetch<FormDefinition>(`/public/forms/${slug}`);
}

export function searchContent(query: string): Promise<{ results: SearchResult[] } | null> {
  return apiFetch(`/public/search?q=${encodeURIComponent(query)}`);
}
```

### Module Registry

```typescript
// apps/public-web/src/lib/module-registry.ts
import type { ComponentType } from 'react';
import type { ModuleComponentProps } from '@/types/template';

import { NavigationModule } from '@/components/modules/navigation';
import { PageContentModule } from '@/components/modules/page-content';
import { BlogListModule } from '@/components/modules/blog-list';
import { DocumentListModule } from '@/components/modules/document-list';
import { FaqListModule } from '@/components/modules/faq-list';
import { FormEmbedModule } from '@/components/modules/form-embed';
import { FooterModule } from '@/components/modules/footer-module';
import { ChatbotModule } from '@/components/modules/chatbot-module';
import { SearchModule } from '@/components/modules/search-module';
import { CustomHtmlModule } from '@/components/modules/custom-html';
import { MediaGalleryModule } from '@/components/modules/media-gallery';

const MODULE_MAP: Record<string, ComponentType<ModuleComponentProps>> = {
  NAVIGATION: NavigationModule,
  PAGE_CONTENT: PageContentModule,
  BLOG_LIST: BlogListModule,
  DOCUMENT_LIST: DocumentListModule,
  FAQ_LIST: FaqListModule,
  FORM_EMBED: FormEmbedModule,
  FOOTER: FooterModule,
  CHATBOT: ChatbotModule,
  SEARCH: SearchModule,
  CUSTOM_HTML: CustomHtmlModule,
  MEDIA_GALLERY: MediaGalleryModule,
};

export function resolveModule(moduleType: string): ComponentType<ModuleComponentProps> | null {
  return MODULE_MAP[moduleType] ?? null;
}

export function getRegisteredModuleTypes(): string[] {
  return Object.keys(MODULE_MAP);
}
```

### HTML Sanitization

```typescript
// apps/public-web/src/lib/sanitize-html.ts

const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'a', 'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
  'blockquote', 'pre', 'code', 'kbd', 'samp',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'div', 'span', 'section', 'article', 'aside', 'figure', 'figcaption',
  'img', 'picture', 'source', 'video', 'audio',
  'details', 'summary', 'abbr', 'time', 'address',
]);

const ALLOWED_ATTRIBUTES = new Set([
  'href', 'src', 'alt', 'title', 'class', 'id', 'width', 'height',
  'target', 'rel', 'colspan', 'rowspan', 'scope', 'datetime',
  'loading', 'decoding', 'srcset', 'sizes', 'type', 'controls',
  'aria-label', 'aria-describedby', 'aria-hidden', 'role',
]);

const EVENT_HANDLER_PATTERN = /^on/i;
const JAVASCRIPT_URL_PATTERN = /^\s*javascript:/i;

export function sanitizeHtml(html: string): string {
  // Strip <script> tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Strip event handler attributes (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Strip javascript: protocol URLs
  sanitized = sanitized.replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '');

  // Strip <style> tags with expressions/behaviors
  sanitized = sanitized.replace(/<style\b[^>]*>[\s\S]*?(?:expression|behavior|url\s*\()[\s\S]*?<\/style>/gi, '');

  return sanitized;
}

export function isAllowedTag(tag: string): boolean {
  return ALLOWED_TAGS.has(tag.toLowerCase());
}

export function isAllowedAttribute(attr: string): boolean {
  if (EVENT_HANDLER_PATTERN.test(attr)) return false;
  return ALLOWED_ATTRIBUTES.has(attr.toLowerCase());
}

export function isSafeUrl(url: string): boolean {
  return !JAVASCRIPT_URL_PATTERN.test(url);
}
```

## Data Models

### Template Types

```typescript
// apps/public-web/src/types/template.ts

export interface RenderData {
  template: WebsiteTemplate | null;
  regions: TemplateRegion[];
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  version: string;
  templateType: 'GOVERNMENT' | 'CORPORATE' | 'BLOG' | 'LANDING_PAGE' | 'CUSTOM';
  status: 'ACTIVE';
  isActive: true;
  thumbnailUrl: string | null;
  configJson: Record<string, unknown> | null;
}

export interface TemplateRegion {
  id: string;
  templateId: string;
  regionKey: string;
  regionName: string;
  regionType: 'HEADER' | 'NAVIGATION' | 'CONTENT' | 'FOOTER' | 'CHATBOT';
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  modules: TemplateRegionModule[];
}

export interface TemplateRegionModule {
  id: string;
  templateId: string;
  regionId: string;
  moduleType: string;
  moduleKey: string;
  displayTitle: string;
  configJson: Record<string, unknown> | null;
  sortOrder: number;
  isVisible: boolean;
}

export interface ModuleComponentProps {
  config: Record<string, unknown> | null;
  moduleKey: string;
}
```

### Content Types

```typescript
// apps/public-web/src/types/content.ts

export interface PageData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: string | null;
  status: 'PUBLISHED';
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: string | null;
  status: 'PUBLISHED';
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string;
  category: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
}

export interface DocumentItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  documentType: string;
  category: { id: string; name: string; slug: string } | null;
  publishedAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: { id: string; name: string } | null;
  sortOrder: number;
}

export interface FormDefinition {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  fields: FormField[];
  submitButtonText: string | null;
  successMessage: string | null;
}

export interface FormField {
  id: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTI_SELECT' | 'RADIO' | 'CHECKBOX' | 'FILE_UPLOAD' | 'CONSENT' | 'HIDDEN';
  label: string;
  placeholder: string | null;
  isRequired: boolean;
  validationRules: Record<string, unknown> | null;
  options: { label: string; value: string }[] | null;
  sortOrder: number;
}

export interface SearchResult {
  id: string;
  type: 'PAGE' | 'BLOG' | 'DOCUMENT' | 'FAQ';
  title: string;
  slug: string;
  excerpt: string | null;
}
```

## SEO Metadata

```typescript
// apps/public-web/src/lib/metadata.ts
import type { Metadata } from 'next';
import type { PageData, BlogPost } from '@/types/content';

export function generateContentMetadata(content: PageData | BlogPost | null, fallbackTitle?: string): Metadata {
  if (!content) {
    return { title: fallbackTitle ?? 'Page Not Found' };
  }

  const title = content.metaTitle ?? content.title;
  const description = content.metaDescription ?? content.excerpt ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: content.featuredImage ? [{ url: content.featuredImage }] : undefined,
    },
  };
}
```

## Error Handling

### Module Error Boundary

```typescript
// apps/public-web/src/components/ui/error-boundary.tsx
'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  moduleName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[ModuleError] ${this.props.moduleName}:`, error.message);
  }

  render() {
    if (this.state.hasError) {
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            Module &quot;{this.props.moduleName}&quot; encountered an error.
          </div>
        );
      }
      return null;
    }
    return this.props.children;
  }
}
```

### API Error Handling Strategy

| Scenario | Behavior |
|----------|----------|
| API unreachable | Render FallbackLayout |
| API returns 500 | Render FallbackLayout |
| Template is null | Render FallbackLayout |
| Page/Blog not found | Return Next.js `notFound()` (404) |
| Module component throws | Error boundary catches, page continues |
| Form submission fails | Display field-level validation errors |

## Security

### Next.js Security Headers

```typescript
// apps/public-web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Security Principles

1. **No client-side tokens**: The public-web app never stores or exposes JWT tokens. All authenticated API calls happen server-side only.
2. **HTML sanitization**: All user-generated HTML (page content, blog content, custom HTML modules) is sanitized before rendering to strip script tags, event handlers, and javascript: URLs.
3. **Published-only content**: The backend API enforces that only PUBLISHED content is returned via public endpoints. The frontend does not implement its own status filtering.
4. **Server-side data fetching**: Template render data is fetched exclusively on the server, preventing exposure of internal API URLs to the client.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:3001` |
| `TEMPLATE_REVALIDATE_SECONDS` | ISR revalidation interval in seconds | `60` |
| `NEXT_PUBLIC_SITE_NAME` | Public site name for fallback layout | `AI CMS` |

## Starter Template Package

The GIGW-compliant starter template is a static package at `packages/starter-template/`:

```
packages/starter-template/
├── template.json       # Template metadata, regions, module assignments
├── index.html          # Base HTML with GIGW sections
└── styles.css          # Responsive GIGW-compliant styles
```

The `template.json` defines:
- Template metadata (name, slug, version, type: GOVERNMENT)
- Regions: header, navigation, main, sidebar, footer
- Module assignments: Navigation, PageContent, BlogList, DocumentList, FaqList, FormEmbed, Footer, Chatbot, Search


## Testing Strategy

### Unit Tests (Example-Based)
- Module resolution returns correct component for each known type
- Unknown moduleType renders placeholder in dev, nothing in production
- FallbackLayout renders semantic landmarks with navigation links
- Skip-to-content link is first focusable element
- Form submission success shows confirmation message
- Chatbot module renders ChatbotWidget asynchronously

### Property-Based Tests
- HTML sanitization (Property 10): Generate random HTML with XSS vectors, verify dangerous content stripped
- Region sort ordering (Properties 2, 4): Generate random sortOrder arrays, verify ascending output
- Inactive region filtering (Property 5): Generate mixed active/inactive regions, verify exclusion
- Region-to-landmark mapping (Property 3): Generate all regionType values, verify correct elements
- SEO metadata generation (Property 17): Generate content with various metadata combinations
- Module configJson passthrough (Property 8): Generate random config objects, verify identity
- Document category filtering (Property 13): Generate documents with categories, verify filter correctness
- Form field rendering (Property 15): Generate form definitions, verify all fields rendered

### Integration Tests
- TemplateRenderer fetches from correct API endpoint
- Page/Blog routes return 404 for non-existent or unpublished content
- Form submission POSTs to correct backend endpoint
- Security headers are present in responses

### Smoke Tests
- All public routes (/, /pages/[slug], /blog, /blog/[slug], /documents, /faqs, /forms/[slug]) return valid responses
- Starter template package validates against expected schema
- No JWT tokens exposed in client-side bundles

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Fallback rendering on API failure or null template

*For any* API response that is either an error (network failure, non-2xx status) or contains a null template field, the TemplateRenderer SHALL render the FallbackLayout instead of crashing or showing an error page.

**Validates: Requirements 1.3, 15.1**

### Property 2: Regions rendered in sortOrder

*For any* array of template regions with arbitrary sortOrder values, the TemplateRenderer SHALL render them in ascending sortOrder sequence.

**Validates: Requirements 1.4**

### Property 3: Region type to semantic landmark mapping

*For any* active TemplateRegion, the RegionRenderer SHALL produce the correct semantic HTML element: HEADER→`<header>`, NAVIGATION→`<nav>`, CONTENT→`<main>`, FOOTER→`<footer>`, CHATBOT→`<aside>`.

**Validates: Requirements 2.1, 18.2**

### Property 4: Modules rendered in sortOrder within regions

*For any* region containing multiple modules with arbitrary sortOrder values, the RegionRenderer SHALL render those modules in ascending sortOrder sequence.

**Validates: Requirements 2.2**

### Property 5: Inactive regions are excluded from output

*For any* set of template regions where some have `isActive: false`, the RegionRenderer SHALL produce output containing only the active regions — no inactive region's content or landmark element appears in the rendered HTML.

**Validates: Requirements 2.3**

### Property 6: Region key applied as data attribute

*For any* active TemplateRegion with a regionKey value, the rendered landmark element SHALL contain a `data-region` attribute equal to that regionKey.

**Validates: Requirements 2.4**

### Property 7: Module type resolution correctness

*For any* known moduleType string in the module registry, the `resolveModule` function SHALL return the corresponding ModuleComponent (non-null). For any unknown moduleType string, it SHALL return null.

**Validates: Requirements 3.1**

### Property 8: Module configJson passthrough

*For any* TemplateRegionModule with a configJson value, the ModuleRenderer SHALL pass that exact configJson object as the `config` prop to the resolved ModuleComponent.

**Validates: Requirements 3.2**

### Property 9: Error boundary isolation

*For any* ModuleComponent that throws a runtime error during rendering, the ModuleErrorBoundary SHALL catch the error and the surrounding page (other regions and modules) SHALL continue to render without interruption.

**Validates: Requirements 3.5**

### Property 10: HTML sanitization removes dangerous content

*For any* HTML string, after sanitization the output SHALL contain no `<script>` tags, no inline event handler attributes (onclick, onerror, onload, etc.), and no `javascript:` protocol URLs, while preserving safe structural elements (div, p, h1-h6, a, img, table, ul, ol, etc.).

**Validates: Requirements 5.4, 6.4, 13.2, 13.3, 19.1, 19.4**

### Property 11: Active route highlighting in navigation

*For any* current route path and set of navigation links, the Navigation ModuleComponent SHALL apply an active/highlighted state to exactly the link whose href matches the current route, and no other links.

**Validates: Requirements 4.2**

### Property 12: Page content renders title, body, and image

*For any* valid PageData object with non-null title, content, and featuredImage fields, the PageContent ModuleComponent SHALL produce output containing all three elements.

**Validates: Requirements 5.2**

### Property 13: Document category filtering

*For any* list of documents with assigned categories and a selected category filter, the DocumentList ModuleComponent SHALL display only documents whose category matches the filter.

**Validates: Requirements 7.3**

### Property 14: FAQ accordion ARIA attributes

*For any* FAQ item rendered in the FaqList ModuleComponent, the output SHALL include proper ARIA attributes: a button with `aria-expanded` (true/false) and `aria-controls` referencing the answer panel, and the answer panel with a corresponding `id` and `role="region"`.

**Validates: Requirements 8.2**

### Property 15: Form fields rendered from definition

*For any* FormDefinition containing a list of FormField objects, the FormEmbed ModuleComponent SHALL render an input/control element for each field matching its fieldType, with the correct label and required attribute.

**Validates: Requirements 9.2**

### Property 16: Form validation errors displayed at field level

*For any* set of validation errors returned from the API (mapping field IDs to error messages), the FormEmbed ModuleComponent SHALL display each error message adjacent to its corresponding form field.

**Validates: Requirements 9.4**

### Property 17: SEO metadata generation

*For any* content object (Page or BlogPost) with metaTitle and metaDescription fields, the `generateContentMetadata` function SHALL produce a Metadata object with the title set to metaTitle (or content title as fallback) and description set to metaDescription, plus Open Graph tags including og:title, og:description, and og:image when featuredImage is present.

**Validates: Requirements 17.1, 17.2, 17.3, 17.4**

### Property 18: Media gallery renders all items with alt text

*For any* media gallery configuration containing a list of media items, the MediaGallery ModuleComponent SHALL render an image element for each item, and every image element SHALL have a non-empty `alt` attribute.

**Validates: Requirements 14.1, 14.2**

### Property 19: Search input debouncing

*For any* sequence of rapid keystroke inputs within the debounce window, the Search ModuleComponent SHALL issue at most one API call after the debounce period elapses, using the final input value.

**Validates: Requirements 12.3**
