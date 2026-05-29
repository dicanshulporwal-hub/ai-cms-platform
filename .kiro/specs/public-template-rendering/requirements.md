# Requirements Document

## Introduction

Public Template Rendering enables the `apps/public-web` Next.js 14 application to fetch the active website template from the backend API and render it as a fully functional public-facing website. The system uses a hybrid SSR approach — server-side rendering for the template shell (regions and layout) with client-side fetching for dynamic content modules. It supports all CMS content types (Pages, Blogs, Documents, FAQs, Forms), provides a fallback layout when no template is active, includes a GIGW-compliant starter template package, and enforces accessibility and security standards throughout.

## Glossary

- **PublicWeb**: The Next.js 14 application at `apps/public-web` serving the public-facing website on port 3002.
- **TemplateRenderer**: The root server component responsible for fetching the active template and orchestrating region rendering.
- **RegionRenderer**: A component that receives a TemplateRegion and renders its child modules in order.
- **ModuleRenderer**: A component that resolves a TemplateRegionModule to its corresponding public module component.
- **ModuleComponent**: An individual UI component (Navigation, PageContent, BlogList, DocumentList, FaqList, FormEmbed, Footer, Chatbot, Search, CustomHtml, MediaGallery) that renders a specific content type.
- **FallbackLayout**: A default layout rendered when no active template exists in the CMS.
- **StarterTemplate**: A GIGW-compliant multi-page template package consisting of template.json, index.html, and styles.css.
- **BackendAPI**: The NestJS API at `apps/api` exposing public endpoints under `/public/`.
- **ActiveTemplate**: The WebsiteTemplate record with `isActive: true` and `deletedAt: null`.
- **RenderData**: The JSON response from `GET /public/template/render-data` containing template metadata, regions, and modules.
- **GIGW**: Guidelines for Indian Government Websites — a compliance standard for government web portals.

## Requirements

### Requirement 1: Template Data Fetching

**User Story:** As a public website visitor, I want the site to load the active template layout from the CMS, so that I see the most current published design.

#### Acceptance Criteria

1. WHEN the PublicWeb receives a page request, THE TemplateRenderer SHALL fetch RenderData from `GET /public/template/render-data` on the server side.
2. THE TemplateRenderer SHALL cache the RenderData response using Next.js fetch cache with a revalidation interval configurable via environment variable.
3. IF the BackendAPI returns an error or is unreachable, THEN THE TemplateRenderer SHALL render the FallbackLayout instead of an error page.
4. THE TemplateRenderer SHALL pass the fetched regions array to RegionRenderer components in the order specified by the `sortOrder` field.

### Requirement 2: Region Rendering

**User Story:** As a public website visitor, I want the page to display structured layout regions (header, navigation, main content, footer), so that the site has a consistent and organized structure.

#### Acceptance Criteria

1. THE RegionRenderer SHALL render each active TemplateRegion as a semantic HTML landmark element corresponding to its regionType (HEADER as `<header>`, NAVIGATION as `<nav>`, CONTENT as `<main>`, FOOTER as `<footer>`, CHATBOT as `<aside>`).
2. THE RegionRenderer SHALL render child modules within each region in ascending `sortOrder`.
3. WHILE a region has `isActive` set to false, THE RegionRenderer SHALL skip that region entirely.
4. THE RegionRenderer SHALL apply the region's `regionKey` as a data attribute for styling hooks.

### Requirement 3: Module Resolution and Rendering

**User Story:** As a public website visitor, I want each content module to render correctly based on its type, so that I can interact with navigation, pages, blogs, documents, FAQs, and forms.

#### Acceptance Criteria

1. THE ModuleRenderer SHALL resolve each TemplateRegionModule to its corresponding ModuleComponent using the `moduleType` field.
2. THE ModuleRenderer SHALL pass the module's `configJson` to the resolved ModuleComponent as configuration props.
3. WHILE the environment is set to development, IF the ModuleRenderer encounters an unknown `moduleType`, THEN THE ModuleRenderer SHALL render a visible placeholder indicating the unrecognized module type.
4. WHILE the environment is set to production, IF the ModuleRenderer encounters an unknown `moduleType`, THEN THE ModuleRenderer SHALL skip the module silently without rendering any output.
5. IF a ModuleComponent throws a runtime error, THEN THE ModuleRenderer SHALL catch the error and render an error boundary without crashing the entire page.

### Requirement 4: Navigation Module

**User Story:** As a public website visitor, I want a navigation menu, so that I can browse between pages and sections of the site.

#### Acceptance Criteria

1. THE Navigation ModuleComponent SHALL render a responsive navigation bar with links derived from published Pages.
2. THE Navigation ModuleComponent SHALL highlight the currently active route.
3. THE Navigation ModuleComponent SHALL support keyboard navigation with visible focus indicators.
4. THE Navigation ModuleComponent SHALL include a skip-to-content link as the first focusable element.

### Requirement 5: Page Content Module

**User Story:** As a public website visitor, I want to read published page content, so that I can access information provided by the organization.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/pages/[slug]`, THE PageContent ModuleComponent SHALL fetch the published Page by slug from the BackendAPI.
2. THE PageContent ModuleComponent SHALL render the page title, content body, and featured image.
3. IF the requested page slug does not exist or the page status is not PUBLISHED, THEN THE PageContent ModuleComponent SHALL return a 404 response.
4. THE PageContent ModuleComponent SHALL sanitize all HTML content before rendering to prevent cross-site scripting.

### Requirement 6: Blog List and Detail Modules

**User Story:** As a public website visitor, I want to browse and read blog posts, so that I can stay informed about updates and articles.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/blog`, THE BlogList ModuleComponent SHALL display a paginated list of published blog posts with title, excerpt, featured image, and publication date.
2. WHEN a visitor navigates to `/blog/[slug]`, THE BlogList ModuleComponent SHALL display the full blog post content.
3. IF the requested blog post slug does not exist or the post status is not PUBLISHED, THEN THE BlogList ModuleComponent SHALL return a 404 response.
4. THE BlogList ModuleComponent SHALL sanitize all HTML content before rendering.

### Requirement 7: Document List Module

**User Story:** As a public website visitor, I want to browse and download published documents, so that I can access official files and resources.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/documents`, THE DocumentList ModuleComponent SHALL display a list of published documents with title, category, file type, and download link.
2. THE DocumentList ModuleComponent SHALL fetch document data from `GET /public/documents`.
3. THE DocumentList ModuleComponent SHALL support filtering documents by category.

### Requirement 8: FAQ List Module

**User Story:** As a public website visitor, I want to browse frequently asked questions, so that I can find answers without contacting support.

#### Acceptance Criteria

1. THE FaqList ModuleComponent SHALL fetch FAQ data from `GET /public/faqs`.
2. THE FaqList ModuleComponent SHALL render FAQs in an accessible accordion pattern with proper ARIA attributes.
3. THE FaqList ModuleComponent SHALL support keyboard interaction for expanding and collapsing FAQ items.

### Requirement 9: Form Embed Module

**User Story:** As a public website visitor, I want to fill out and submit forms published by the organization, so that I can provide feedback or request services.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/forms/[slug]`, THE FormEmbed ModuleComponent SHALL fetch the form definition from `GET /public/forms/:slug`.
2. THE FormEmbed ModuleComponent SHALL render form fields according to the form definition schema.
3. WHEN a visitor submits a form, THE FormEmbed ModuleComponent SHALL POST the submission to the BackendAPI forms endpoint.
4. IF form submission fails due to validation errors, THEN THE FormEmbed ModuleComponent SHALL display field-level error messages.
5. WHEN form submission succeeds, THE FormEmbed ModuleComponent SHALL display a confirmation message.

### Requirement 10: Footer Module

**User Story:** As a public website visitor, I want a consistent footer across all pages, so that I can find contact information, links, and legal notices.

#### Acceptance Criteria

1. THE Footer ModuleComponent SHALL render footer content based on its `configJson` configuration.
2. THE Footer ModuleComponent SHALL use a `<footer>` semantic HTML element with appropriate ARIA role.
3. THE Footer ModuleComponent SHALL support configurable sections for links, contact information, and copyright text.

### Requirement 11: Chatbot Module

**User Story:** As a public website visitor, I want access to the chatbot widget, so that I can get instant assistance.

#### Acceptance Criteria

1. THE Chatbot ModuleComponent SHALL render the existing ChatbotWidget component.
2. THE Chatbot ModuleComponent SHALL load the chatbot asynchronously on the client side without blocking initial page render.

### Requirement 12: Search Module

**User Story:** As a public website visitor, I want to search across all published content, so that I can quickly find relevant information.

#### Acceptance Criteria

1. THE Search ModuleComponent SHALL render a search input field accessible from the template layout.
2. WHEN a visitor submits a search query, THE Search ModuleComponent SHALL display results from published pages, blog posts, documents, and FAQs.
3. THE Search ModuleComponent SHALL debounce search input to avoid excessive API calls.

### Requirement 13: Custom HTML Module

**User Story:** As a CMS administrator, I want to embed custom HTML blocks in the template, so that I can add banners, widgets, or third-party integrations.

#### Acceptance Criteria

1. THE CustomHtml ModuleComponent SHALL render HTML content from its `configJson.html` field.
2. THE CustomHtml ModuleComponent SHALL sanitize the HTML content to remove script tags, event handlers, and unsafe attributes before rendering.
3. THE CustomHtml ModuleComponent SHALL preserve safe structural and styling HTML elements.

### Requirement 14: Media Gallery Module

**User Story:** As a public website visitor, I want to view image and media galleries, so that I can browse visual content published by the organization.

#### Acceptance Criteria

1. THE MediaGallery ModuleComponent SHALL render a responsive grid of media items from its configuration.
2. THE MediaGallery ModuleComponent SHALL provide alt text for all images.
3. THE MediaGallery ModuleComponent SHALL support keyboard navigation between gallery items.

### Requirement 15: Fallback Layout

**User Story:** As a public website visitor, I want to see a functional page even when no template is configured, so that the site remains accessible during initial setup.

#### Acceptance Criteria

1. IF the BackendAPI returns no ActiveTemplate (template is null), THEN THE TemplateRenderer SHALL render the FallbackLayout.
2. THE FallbackLayout SHALL display a minimal page with site title, basic navigation to available content routes, and a footer.
3. THE FallbackLayout SHALL use semantic HTML and meet the same accessibility standards as the template-driven layout.

### Requirement 16: Public Routes

**User Story:** As a public website visitor, I want clean URL paths for all content types, so that I can navigate and bookmark pages easily.

#### Acceptance Criteria

1. THE PublicWeb SHALL serve the homepage at route `/`.
2. THE PublicWeb SHALL serve individual pages at route `/pages/[slug]`.
3. THE PublicWeb SHALL serve the blog listing at route `/blog`.
4. THE PublicWeb SHALL serve individual blog posts at route `/blog/[slug]`.
5. THE PublicWeb SHALL serve the document listing at route `/documents`.
6. THE PublicWeb SHALL serve the FAQ listing at route `/faqs`.
7. THE PublicWeb SHALL serve individual forms at route `/forms/[slug]`.

### Requirement 17: SEO Metadata

**User Story:** As a CMS administrator, I want SEO metadata from the CMS to be rendered in page headers, so that search engines can properly index the public site.

#### Acceptance Criteria

1. WHEN a Page or BlogPost has `metaTitle` defined, THE PublicWeb SHALL use the metaTitle as the HTML document title.
2. WHEN a Page or BlogPost has `metaDescription` defined, THE PublicWeb SHALL render a meta description tag with the metaDescription value.
3. IF a Page or BlogPost does not have metaTitle defined, THEN THE PublicWeb SHALL fall back to the content title as the document title.
4. THE PublicWeb SHALL render Open Graph meta tags (og:title, og:description, og:image) using available page metadata and featured image.

### Requirement 18: Accessibility

**User Story:** As a public website visitor using assistive technology, I want the site to follow accessibility best practices, so that I can navigate and consume content effectively.

#### Acceptance Criteria

1. THE PublicWeb SHALL include a skip-to-content link as the first focusable element on every page.
2. THE PublicWeb SHALL use semantic HTML landmarks (header, nav, main, footer) corresponding to template regions.
3. THE PublicWeb SHALL ensure all interactive elements are reachable and operable via keyboard.
4. THE PublicWeb SHALL maintain a minimum color contrast ratio of 4.5:1 for normal text in the default theme.
5. THE PublicWeb SHALL provide visible focus indicators on all focusable elements.

### Requirement 19: Security

**User Story:** As a system administrator, I want the public site to enforce security best practices, so that visitor data is protected and the site is not exploitable.

#### Acceptance Criteria

1. THE PublicWeb SHALL sanitize all user-generated HTML content before rendering to prevent cross-site scripting attacks.
2. THE PublicWeb SHALL only fetch content with PUBLISHED status from the BackendAPI, ensuring draft content is never exposed.
3. THE PublicWeb SHALL NOT store or expose authentication tokens (JWT) in client-side code or browser storage.
4. THE CustomHtml ModuleComponent SHALL strip all `<script>` tags, inline event handlers (onclick, onerror, etc.), and `javascript:` protocol URLs from rendered HTML.
5. THE PublicWeb SHALL set appropriate security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) via Next.js configuration.

### Requirement 20: Starter Government Template Package

**User Story:** As a CMS administrator, I want a pre-built GIGW-compliant starter template, so that I can quickly launch a government website without designing from scratch.

#### Acceptance Criteria

1. THE StarterTemplate SHALL include a `template.json` file defining template metadata, regions, and module assignments.
2. THE StarterTemplate SHALL include an `index.html` file providing the base HTML structure with all GIGW-required sections (header with emblem, navigation, content area, footer with mandatory links).
3. THE StarterTemplate SHALL include a `styles.css` file with responsive styles meeting GIGW color and typography guidelines.
4. THE StarterTemplate SHALL define regions for header, navigation, main content, sidebar, and footer.
5. THE StarterTemplate SHALL pre-configure modules for Navigation, PageContent, BlogList, DocumentList, FaqList, FormEmbed, Footer, Chatbot, and Search.

### Requirement 21: Documentation

**User Story:** As a developer, I want clear documentation for the public template rendering system, so that I can understand, extend, and maintain the module architecture.

#### Acceptance Criteria

1. THE documentation SHALL describe the TemplateRenderer, RegionRenderer, and ModuleRenderer component hierarchy and data flow.
2. THE documentation SHALL provide instructions for creating new ModuleComponents and registering them in the module resolver.
3. THE documentation SHALL document all public routes and their corresponding data sources.
4. THE documentation SHALL include the StarterTemplate structure and instructions for importing custom templates.
