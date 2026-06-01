# Green Code Audit Report

**Date:** June 1, 2026  
**Scope:** Full codebase audit against Green Code Policy  
**Status:** Documentation only — no code changes made

---

## 1. Duplicate API Calls

**Risk Level: LOW**

The admin-web uses React Query hooks which deduplicate requests via query keys. No page was found calling the same endpoint multiple times in the same render tree.

**Minor concern:**
- `apps/api/src/dashboard/dashboard.service.ts` — The `getSummary()` method executes 17+ database queries. If sub-endpoints (`getContentStats`, `getAiStats`, `getChatbotStats`) are called individually, the full summary is re-executed each time rather than being cached or shared.

---

## 2. Missing Pagination (`findMany` without `take`)

**Risk Level: HIGH**

The following queries return unbounded result sets:

| File | Method | Table |
|------|--------|-------|
| `apps/api/src/templates/templates.service.ts` | `findAll()` | `websiteTemplate` |
| `apps/api/src/roles/roles.service.ts` | `findAll()` | `role` |
| `apps/api/src/modules/module-registry.service.ts` | `findAll()`, `getEnabledModules()` | `cmsModule` |
| `apps/api/src/templates/template-module-registry.service.ts` | `findAll()`, `findActivePublic()` | `templateModuleRegistry` |
| `apps/api/src/templates/template-layout.service.ts` | `getRegions()`, `getRegionModules()` | `templateRegion` |
| `apps/api/src/translations/language-providers.service.ts` | `findAll()` | `languageProviderConfig` |
| `apps/api/src/workflow/workflow.service.ts` | `history()` | `workflowHistory` |
| `apps/api/src/broken-links/broken-links.service.ts` | `runFullSiteScan()` | `page`, `blogPost`, `faq` |
| `apps/api/src/sitemap/sitemap-generator.service.ts` | `generate()` | `page`, `blogPost`, `sitemapEntry` |
| `apps/api/src/sitemap/sitemap.controller.ts` | `listCrawlRules()` | `seoCrawlRule` |
| `apps/api/src/notifications/notifications.service.ts` | user lookup | `user` |
| `apps/api/src/ai/ai-router.service.ts` | `autoSelect()`, `getHealth()` | `aiProviderConfig`, `aiModelConfig` |

**Highest risk:** `broken-links.service.ts` `runFullSiteScan()` loads ALL published pages, blogs, and FAQs into memory. On a large site this could cause memory exhaustion.

**Note:** Some unbounded queries are acceptable when the table is guaranteed small (roles, modules, language providers). Templates and workflow history should be paginated.

---

## 3. Unnecessary Dependencies

**Risk Level: LOW**

| Package | App | Issue |
|---------|-----|-------|
| `clsx` + `tailwind-merge` | admin-web, public-web | Both present; `tailwind-merge` via `cn()` utility makes standalone `clsx` redundant |
| `lucide-react` | public-web | Full icon library imported but only 2-3 icons used |
| `dompurify` | admin-web | Used for client-side sanitization; could rely on server-side sanitization instead |

**Recommendation:** Consolidate shared dependencies into `packages/ui` workspace package. Evaluate tree-shaking for `lucide-react` in public-web.

---

## 4. Heavy Frontend Components

**Risk Level: MEDIUM**

No `next/dynamic` or `React.lazy()` usage found anywhere in admin-web or public-web.

**Components that should be lazy-loaded:**

| Component/Page | Reason |
|---------------|--------|
| TipTap editor (`@tiptap/react` + 4 extensions) | Only needed on page/blog edit pages, not in main bundle |
| `apps/admin-web/src/app/dashboard/page.tsx` | 230+ lines, 14 icons, 8 components loaded eagerly |
| `apps/admin-web/src/app/templates/page.tsx` | Renders `dangerouslySetInnerHTML` preview cards with full template HTML |
| Template preview HTML in `src/lib/template-previews.ts` | ~50KB of static HTML strings loaded on every admin page that imports it |
| Admin-only dashboard sections (System Overview) | Loaded for all roles but only visible to Admin+ |

---

## 5. Possible Over-Fetching

**Risk Level: HIGH**

Queries fetching all columns when only a subset is needed:

| File | Query | Columns Wasted |
|------|-------|----------------|
| `templates/templates.service.ts` `findAll()` | Full record | `configJson` (large JSON), `complianceJson`, `fileKey`, `fileUrl` |
| `templates/template-layout.service.ts` `ensureTemplateExists()` | Full record | Only needs to check existence |
| `templates/template-seed.service.ts` `getTemplatePreviewHtml()` | Full record | Only needs `configJson` |
| `broken-links/broken-links.service.ts` `runFullSiteScan()` | All page/blog/FAQ columns | Only needs `id`, `title`, `slug`, `content` |
| `workflow/workflow.service.ts` | Full page/blog with `include` | Fetches `content` (LongText) for status changes |
| `ai/ai-router.service.ts` `getHealth()` | All provider config fields | Includes `apiKeyEncrypted` — security risk |
| `broken-links/broken-links.service.ts` `getScan()` | All issues without pagination | Could be thousands of issues |
| `roles/roles.service.ts` `findAll()` | Full record | Fetches `permissions` JSON for list view |

**Security concern:** `ai-router.service.ts` fetches `apiKeyEncrypted` in `getHealth()` — this field should never leave the service layer.

---

## 6. AI Calls That Can Be Cached

**Risk Level: MEDIUM**

No caching layer exists for AI responses. Every call goes directly to the provider.

**Cacheable operations:**

| Operation | Cache Key | TTL |
|-----------|-----------|-----|
| `generateSeo(title, content)` | `hash(title + content)` | 24h |
| `generateFaq(content)` | `hash(content)` | 24h |
| `generateAltText(imageUrl, context)` | `hash(imageUrl + context)` | 7d |
| `summarizeContent(content, maxLength)` | `hash(content + maxLength)` | 24h |
| `ai-router.autoSelect()` config lookup | `ai-config` | 60s |
| `ai-router.getHealth()` provider check | `ai-health` | 60s |

**Impact:** Without caching, regenerating SEO for the same page content makes a new API call each time. With caching, repeated operations cost zero tokens.

---

## 7. Disabled Module Data Fetching

**Risk Level: HIGH**

**Critical finding:** Public controllers do NOT check module enabled status.

| Controller | Module | Issue |
|-----------|--------|-------|
| `apps/api/src/blogs/public-blogs.controller.ts` | blogs | No `@ModuleEnabled()` guard |
| `apps/api/src/documents/public-documents.controller.ts` | documents | No `@ModuleEnabled()` guard |
| `apps/api/src/faqs/public-faqs.controller.ts` | faqs | No `@ModuleEnabled()` guard |
| `apps/api/src/forms/public-forms.controller.ts` | forms | No `@ModuleEnabled()` guard |

**Public-web also fetches unconditionally:**
- `apps/public-web/src/app/blog/page.tsx` — calls `fetchBlogPosts()` regardless of module status
- `apps/public-web/src/app/documents/page.tsx` — calls `fetchDocuments()` regardless
- `apps/public-web/src/app/faqs/page.tsx` — calls `fetchFaqs()` regardless

**Impact:** Disabled modules still generate database queries, network requests, and rendered pages — wasting compute and potentially confusing users who disabled the module.

---

## 8. Database Queries That May Need Indexes

**Risk Level: MEDIUM**

| Query Pattern | Tables | Current Index | Recommendation |
|--------------|--------|---------------|----------------|
| `WHERE status = 'PUBLISHED' AND deletedAt IS NULL` | `pages`, `blog_posts` | Separate indexes on `status` and `deletedAt` | Add composite `@@index([status, deletedAt])` |
| `ORDER BY publishedAt DESC` | `blog_posts` | No index on `publishedAt` | Add `@@index([publishedAt])` |
| `WHERE isEnabled = true AND (isFree = true OR isFreeTier = true)` | `ai_model_configs` | Only `@@index([isEnabled])` | Add composite `@@index([isEnabled, isFree])` |
| `WHERE isManual = true AND isEnabled = true` | `sitemap_entries` | Only `@@index([isManual])` and `@@index([isEnabled])` | Add composite `@@index([isManual, isEnabled])` |
| `WHERE scanId = ? ORDER BY severity ASC, createdAt DESC` | `broken_link_issues` | Only `@@index([scanId])` | Add composite `@@index([scanId, severity])` |
| `WHERE sourceType = ? AND sourceId = ? AND status = 'ACTIVE'` | `structured_data_entries` | `@@index([sourceType, sourceId])` | Add `status` to composite: `@@index([sourceType, sourceId, status])` |

**Most impactful:** Composite `[status, deletedAt]` on `pages` and `blog_posts` — this is the most frequently used filter across the entire codebase (sitemap, broken links, schema, public controllers, dashboard).

---

## Priority Summary

| Priority | Category | Action |
|----------|----------|--------|
| **P0 (Critical)** | Disabled module fetching | Add `@ModuleEnabled()` guards to public controllers |
| **P0 (Critical)** | Over-fetching | Add `select` to broken-links scan (prevents OOM on large sites) |
| **P1 (High)** | Missing pagination | Add `take` to templates, workflow history, scan issues |
| **P1 (High)** | Security | Remove `apiKeyEncrypted` from ai-router `getHealth()` response |
| **P2 (Medium)** | AI caching | Add content-hash based cache for AI responses |
| **P2 (Medium)** | Missing indexes | Add composite `[status, deletedAt]` and `publishedAt` indexes |
| **P2 (Medium)** | Lazy loading | Use `next/dynamic` for TipTap editor and heavy components |
| **P3 (Low)** | Dependencies | Consolidate shared packages; evaluate tree-shaking |
| **P3 (Low)** | Dashboard | Cache summary query or share across sub-endpoints |

---

## Compliance Score

Based on the Green Code Review Checklist:

| Category | Score |
|----------|-------|
| Database Queries | 60% (missing select, missing pagination) |
| API Design | 75% (good auth, missing module guards on public) |
| Frontend | 65% (no lazy loading, template previews in memory) |
| AI Usage | 70% (good logging, missing caching) |
| External Requests | 85% (timeouts set, limits in place) |
| File Operations | 90% (good validation, size limits) |
| Security | 80% (good sanitization, apiKey exposure risk) |

**Overall Green Code Compliance: ~72%**

Target: 80%+ for production readiness.
