# Implementation Plan: Public Template Rendering

## Overview

Transform the `apps/public-web` Next.js 14 application from its current minimal state into a full template-driven public website renderer. The implementation follows a bottom-up approach: types and utilities first, then the core rendering pipeline (TemplateRenderer → RegionRenderer → ModuleRenderer), followed by individual module components, public routes, and finally the starter template package and documentation.

## Tasks

- [x] 1. Set up types, utilities, and core infrastructure
  - [x] 1.1 Create TypeScript type definitions for template and content data models
    - Create `src/types/template.ts` with RenderData, WebsiteTemplate, TemplateRegion, TemplateRegionModule, and ModuleComponentProps interfaces
    - Create `src/types/content.ts` with PageData, BlogPost, DocumentItem, FaqItem, FormDefinition, FormField, and SearchResult interfaces
    - _Requirements: 1.1, 2.1, 3.1, 3.2_

  - [x] 1.2 Implement the public API client for server-side data fetching
    - Create `src/lib/api-client.ts` with `apiFetch` generic utility using Next.js fetch cache and configurable revalidation
    - Implement fetchRenderData, fetchPageBySlug, fetchBlogPosts, fetchBlogBySlug, fetchDocuments, fetchFaqs, fetchFormBySlug, and searchContent functions
    - Use `PUBLIC_API_BASE_URL` and `TEMPLATE_REVALIDATE_SECONDS` environment variables
    - _Requirements: 1.1, 1.2, 5.1, 6.1, 6.2, 7.2, 8.1, 9.1, 12.2_

  - [x] 1.3 Implement HTML sanitization utility
    - Create `src/lib/sanitize-html.ts` with sanitizeHtml function that strips script tags, event handlers, and javascript: URLs
    - Export helper functions: isAllowedTag, isAllowedAttribute, isSafeUrl
    - Define ALLOWED_TAGS and ALLOWED_ATTRIBUTES sets preserving safe structural elements
    - _Requirements: 5.4, 6.4, 13.2, 13.3, 19.1, 19.4_

  - [ ]* 1.4 Write property test for HTML sanitization
    - **Property 10: HTML sanitization removes dangerous content**
    - Generate random HTML strings containing XSS vectors (script tags, event handlers, javascript: URLs), verify all dangerous content is stripped while safe elements are preserved
    - **Validates: Requirements 5.4, 6.4, 13.2, 13.3, 19.1, 19.4**

  - [x] 1.5 Create the module registry
    - Create `src/lib/module-registry.ts` with MODULE_MAP mapping moduleType strings to component references
    - Implement resolveModule function returning the component or null for unknown types
    - Implement getRegisteredModuleTypes helper
    - _Requirements: 3.1_

  - [ ]* 1.6 Write property test for module type resolution
    - **Property 7: Module type resolution correctness**
    - For any known moduleType in the registry, resolveModule returns non-null; for any unknown string, it returns null
    - **Validates: Requirements 3.1**

  - [x] 1.7 Create SEO metadata utility
    - Create `src/lib/metadata.ts` with generateContentMetadata function
    - Handle metaTitle fallback to content title, metaDescription, and Open Graph tags (og:title, og:description, og:image)
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [ ]* 1.8 Write property test for SEO metadata generation
    - **Property 17: SEO metadata generation**
    - Generate content objects with various combinations of metaTitle, metaDescription, and featuredImage; verify correct Metadata output
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4**

- [x] 2. Implement core template rendering pipeline
  - [x] 2.1 Create the SkipLink and ModuleErrorBoundary UI components
    - Create `src/components/ui/skip-link.tsx` rendering a skip-to-content link as the first focusable element
    - Create `src/components/ui/error-boundary.tsx` as a client-side React error boundary that catches module errors and shows dev-only error messages
    - _Requirements: 3.5, 4.4, 18.1, 18.5_

  - [x] 2.2 Implement the RegionRenderer server component
    - Create `src/components/template/region-renderer.tsx`
    - Map regionType to semantic HTML landmarks (HEADER→header, NAVIGATION→nav, CONTENT→main, FOOTER→footer, CHATBOT→aside)
    - Skip inactive regions, sort modules by sortOrder, apply data-region attribute
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 18.2_

  - [ ]* 2.3 Write property tests for region rendering logic
    - **Property 2: Regions rendered in sortOrder**
    - **Property 3: Region type to semantic landmark mapping**
    - **Property 5: Inactive regions are excluded from output**
    - **Property 6: Region key applied as data attribute**
    - **Validates: Requirements 1.4, 2.1, 2.2, 2.3, 2.4, 18.2**

  - [x] 2.4 Implement the ModuleRenderer server component
    - Create `src/components/template/module-renderer.tsx`
    - Resolve moduleType via module registry, pass configJson as config prop
    - Show placeholder for unknown types in dev, skip silently in production
    - Wrap resolved component in ModuleErrorBoundary
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 2.5 Write property test for module configJson passthrough
    - **Property 8: Module configJson passthrough**
    - Generate random configJson objects, verify they are passed identically as the config prop to the resolved component
    - **Validates: Requirements 3.2**

  - [x] 2.6 Implement the FallbackLayout server component
    - Create `src/components/template/fallback-layout.tsx`
    - Render SkipLink, header with site name, nav with links to /, /blog, /documents, /faqs, main content area, and footer
    - Use semantic HTML landmarks and NEXT_PUBLIC_SITE_NAME env variable
    - _Requirements: 15.1, 15.2, 15.3, 18.2_

  - [x] 2.7 Implement the TemplateRenderer server component
    - Create `src/components/template/template-renderer.tsx`
    - Fetch render data via api-client, render FallbackLayout on error/null, otherwise render sorted regions via RegionRenderer
    - Pass children to the CONTENT region
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 15.1_

  - [ ]* 2.8 Write property test for fallback rendering
    - **Property 1: Fallback rendering on API failure or null template**
    - For any API response that is an error or contains null template, verify FallbackLayout is rendered
    - **Validates: Requirements 1.3, 15.1**

- [x] 3. Checkpoint - Core rendering pipeline
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement module components (server-rendered)
  - [x] 4.1 Implement the PageContent module component
    - Create `src/components/modules/page-content.tsx` as a server component
    - Fetch page by slug, render title, sanitized content body, and featured image
    - Return notFound() for missing/unpublished pages
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.2 Implement the BlogList module component
    - Create `src/components/modules/blog-list.tsx` as a server component
    - Render paginated list with title, excerpt, featured image, and publication date
    - Support detail view for /blog/[slug] with full sanitized content
    - Return notFound() for missing/unpublished posts
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 4.3 Implement the DocumentList module component
    - Create `src/components/modules/document-list.tsx` as a server component
    - Fetch and display documents with title, category, file type, and download link
    - Support category filtering
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 4.4 Write property test for document category filtering
    - **Property 13: Document category filtering**
    - Generate documents with various categories and a filter value, verify only matching documents are displayed
    - **Validates: Requirements 7.3**

  - [x] 4.5 Implement the FaqList module component
    - Create `src/components/modules/faq-list.tsx` with server data fetching and client-side accordion interaction
    - Render accessible accordion with ARIA attributes (aria-expanded, aria-controls, role="region")
    - Support keyboard interaction for expand/collapse
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 4.6 Write property test for FAQ accordion ARIA attributes
    - **Property 14: FAQ accordion ARIA attributes**
    - Generate FAQ items, verify each has button with aria-expanded and aria-controls, and answer panel with matching id and role="region"
    - **Validates: Requirements 8.2**

  - [x] 4.7 Implement the Footer module component
    - Create `src/components/modules/footer-module.tsx` as a server component
    - Render footer content from configJson with sections for links, contact info, and copyright
    - Use semantic footer element with appropriate ARIA role
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 4.8 Implement the CustomHtml module component
    - Create `src/components/modules/custom-html.tsx` as a server component
    - Render sanitized HTML from configJson.html field
    - Strip script tags, event handlers, and unsafe attributes while preserving safe elements
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 4.9 Implement the MediaGallery module component
    - Create `src/components/modules/media-gallery.tsx` as a server component
    - Render responsive grid of media items with alt text for all images
    - Support keyboard navigation between gallery items
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ]* 4.10 Write property test for media gallery alt text
    - **Property 18: Media gallery renders all items with alt text**
    - Generate media configurations, verify every image element has a non-empty alt attribute
    - **Validates: Requirements 14.1, 14.2**

- [x] 5. Implement module components (client-rendered)
  - [x] 5.1 Implement the Navigation module component
    - Create `src/components/modules/navigation.tsx` as a client component
    - Render responsive navigation bar with links from published pages
    - Highlight active route, support keyboard navigation with visible focus indicators
    - Include skip-to-content link as first focusable element
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 5.2 Implement the FormEmbed module component
    - Create `src/components/modules/form-embed.tsx` as a client component
    - Fetch form definition, render fields according to schema (TEXT, TEXTAREA, EMAIL, SELECT, CHECKBOX, etc.)
    - Handle form submission POST to backend, display field-level validation errors and success confirmation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 5.3 Write property test for form field rendering
    - **Property 15: Form fields rendered from definition**
    - Generate FormDefinition objects with various field types, verify each field renders with correct type, label, and required attribute
    - **Validates: Requirements 9.2**

  - [x] 5.4 Implement the Search module component
    - Create `src/components/modules/search-module.tsx` as a client component
    - Render search input with debounced API calls
    - Display results from pages, blogs, documents, and FAQs
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 5.5 Implement the Chatbot module component
    - Create `src/components/modules/chatbot-module.tsx` as a client component
    - Wrap existing ChatbotWidget with async loading (dynamic import)
    - Ensure it does not block initial page render
    - _Requirements: 11.1, 11.2_

- [x] 6. Checkpoint - All module components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Set up public routes and integrate template rendering
  - [x] 7.1 Update root layout to use TemplateRenderer
    - Modify `src/app/layout.tsx` to wrap children with TemplateRenderer
    - Add SkipLink as first element in body
    - Remove direct ChatbotWidget usage (now handled via template modules)
    - _Requirements: 1.1, 18.1_

  - [x] 7.2 Create homepage route
    - Update `src/app/page.tsx` to render the homepage content within the template
    - _Requirements: 16.1_

  - [x] 7.3 Create page detail route
    - Create `src/app/pages/[slug]/page.tsx` with PageContent rendering and SEO metadata
    - Use generateContentMetadata for dynamic metadata
    - _Requirements: 5.1, 5.2, 5.3, 16.2, 17.1, 17.2, 17.3, 17.4_

  - [x] 7.4 Create blog routes
    - Create `src/app/blog/page.tsx` for blog listing
    - Create `src/app/blog/[slug]/page.tsx` for blog detail with SEO metadata
    - _Requirements: 6.1, 6.2, 6.3, 16.3, 16.4, 17.1, 17.2, 17.3, 17.4_

  - [x] 7.5 Create documents route
    - Create `src/app/documents/page.tsx` for document listing with category filtering
    - _Requirements: 7.1, 7.2, 7.3, 16.5_

  - [x] 7.6 Create FAQs route
    - Create `src/app/faqs/page.tsx` for FAQ listing with accordion
    - _Requirements: 8.1, 8.2, 8.3, 16.6_

  - [x] 7.7 Create forms route
    - Create `src/app/forms/[slug]/page.tsx` for form embed
    - _Requirements: 9.1, 9.2, 16.7_

- [x] 8. Configure security headers and finalize Next.js config
  - [x] 8.1 Update next.config.js with security headers
    - Add X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin, X-DNS-Prefetch-Control: on
    - Apply headers to all routes via `/(.*)`
    - _Requirements: 19.5_

  - [ ]* 8.2 Write integration test for security headers
    - Verify all required security headers are present in responses
    - _Requirements: 19.5_

- [x] 9. Checkpoint - Routes and security
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create starter government template package
  - [x] 10.1 Create template.json for the GIGW-compliant starter template
    - Create `packages/starter-template/template.json` with template metadata (name, slug, version, type: GOVERNMENT)
    - Define regions: header, navigation, main, sidebar, footer
    - Pre-configure module assignments for Navigation, PageContent, BlogList, DocumentList, FaqList, FormEmbed, Footer, Chatbot, and Search
    - _Requirements: 20.1, 20.4, 20.5_

  - [x] 10.2 Create index.html for the starter template
    - Create `packages/starter-template/index.html` with GIGW-required sections (header with emblem, navigation, content area, footer with mandatory links)
    - Use semantic HTML structure
    - _Requirements: 20.2_

  - [x] 10.3 Create styles.css for the starter template
    - Create `packages/starter-template/styles.css` with responsive styles meeting GIGW color and typography guidelines
    - Ensure minimum 4.5:1 contrast ratio for normal text
    - _Requirements: 20.3, 18.4_

- [x] 11. Create documentation
  - [x] 11.1 Write public template rendering documentation
    - Create `docs/public-template-rendering.md`
    - Document TemplateRenderer → RegionRenderer → ModuleRenderer hierarchy and data flow
    - Provide instructions for creating new ModuleComponents and registering them in the module registry
    - Document all public routes and their data sources
    - Include StarterTemplate structure and instructions for importing custom templates
    - _Requirements: 21.1, 21.2, 21.3, 21.4_

- [x] 12. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing chatbot-widget.tsx, chatbot-api.ts, and chatbot types are preserved and wrapped by the new ChatbotModule
- TypeScript is used throughout as per project conventions
- All server-side data fetching uses Next.js fetch cache with configurable revalidation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.5", "1.7"] },
    { "id": 2, "tasks": ["1.4", "1.6", "1.8", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.4", "2.6"] },
    { "id": 4, "tasks": ["2.3", "2.5", "2.7", "2.8"] },
    { "id": 5, "tasks": ["4.1", "4.3", "4.5", "4.7", "4.8", "4.9", "5.1", "5.4", "5.5"] },
    { "id": 6, "tasks": ["4.2", "4.4", "4.6", "4.10", "5.2"] },
    { "id": 7, "tasks": ["5.3", "7.1"] },
    { "id": 8, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "8.1"] },
    { "id": 9, "tasks": ["8.2", "10.1", "10.2", "10.3", "11.1"] }
  ]
}
```
