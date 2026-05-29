# Template Module Registry

## Purpose

The Module Registry is a central catalog of all CMS modules that can be placed into template regions. It supports both current and future modules, allowing the system to grow without rebuilding the template engine.

## How Modules Register

Each module has a registry entry with:
- `moduleKey` - unique stable identifier (e.g., `BLOG_LIST`)
- `moduleName` - admin-friendly display name
- `moduleType` - renderer type used by public portal
- `category` - grouping (Content, Engagement, Governance, Utility, Custom)
- `isPublicEnabled` - whether module can appear on public portal
- `isActive` - whether module is available for placement
- `isSystemModule` - protected from deletion

## Public Visibility

Admin controls which modules appear publicly:
1. Module must be `isActive: true` to be placed in regions
2. Module must be `isPublicEnabled: true` to render on public portal
3. Module must be `isVisible: true` in the region assignment

## How Active Template Uses Modules

1. Public portal fetches `GET /public/template/render-data`
2. Response includes template, regions, and assigned modules
3. `ModuleRenderer` switches on `moduleType` to render each module
4. If renderer doesn't exist for a module type, shows placeholder or hides

## Adding a Future Module

1. Register in `TemplateModuleRegistry` (via admin UI or seed)
2. Set `isActive: false` initially
3. When implementation is ready, set `isActive: true`
4. Admin places module in template regions
5. Set `isPublicEnabled: true` when ready for public
6. Implement renderer in public-web

## Renderer Fallback

If a module's renderer is not yet implemented:
- Admin preview shows "Renderer not available" placeholder
- Public portal hides the module gracefully
- No crash or error displayed to visitors

## Current System Modules

| Key | Name | Category |
|-----|------|----------|
| PAGE_CONTENT | Page Content | Content |
| BLOG_LIST | Blog List | Content |
| DOCUMENT_LIST | Document List | Content |
| MEDIA_GALLERY | Media Gallery | Content |
| CHATBOT | Chatbot Widget | Engagement |
| SEARCH | Search Box | Utility |
| NAVIGATION_MENU | Navigation Menu | Utility |
| FOOTER_LINKS | Footer Links | Utility |
| CUSTOM_HTML | Custom HTML | Custom |

## Future Module Placeholders

| Key | Name | Category |
|-----|------|----------|
| FAQ_LIST | FAQ List | Content |
| ANNOUNCEMENT_LIST | Announcements | Content |
| TENDER_LIST | Tender List | Governance |
| SCHEME_LIST | Scheme List | Governance |
| EVENT_LIST | Event List | Content |
| FORM_EMBED | Form Embed | Engagement |
| GRIEVANCE_FORM | Grievance Form | Governance |
| CONTACT_DIRECTORY | Contact Directory | Utility |
| RTI_DISCLOSURE_LIST | RTI Disclosures | Governance |
