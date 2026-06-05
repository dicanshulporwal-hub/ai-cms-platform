# Public Template Builder

## Overview

The Public Template Builder allows Admin/Super Admin users to visually configure the public website layout using enabled CMS modules. It provides a 3-panel interface for managing regions, modules, and their settings.

## Architecture

```
Admin: /templates/builder         → Visual 3-panel builder
Admin: /templates/builder/preview → Responsive iframe preview (desktop/tablet/mobile)
API:   /templates/:id/regions     → Region CRUD
API:   /templates/:id/regions/:regionId/modules → Module CRUD
API:   /template-modules          → Module palette (registry)
Public: /public/template/render-data → Active template + regions + modules + settings
```

## Builder Layout

### Left Panel — Module Palette
- Shows all active + public-enabled modules from TemplateModuleRegistry
- Grouped by category (Content, Government, Navigation, Utility)
- Search filter for quick module lookup
- Click "+" to add module to content region

### Center Panel — Layout Canvas
- Displays all template regions in order (Header, Navigation, Content, Sidebar, Footer)
- Each region shows its modules as cards
- Module actions: Move Up/Down, Toggle Visibility, Remove
- Click "Add Module" button on any region to insert a module
- Device width switcher: Desktop (100%) / Tablet (768px) / Mobile (375px)

### Right Panel — Module Settings
- Click any module on canvas to configure it
- Common config: Display Title, Items Limit, Display Mode, Show Title/Image/Date
- Save Configuration persists to database via API

## Responsive Preview

Route: `/templates/builder/preview`

- Renders the actual public website in an iframe
- Device switcher: Desktop / Tablet / Mobile
- Fullscreen mode (dark cinema view)
- Refresh button (reload without full page reload)
- Open in new tab link

## Supported Public Module Renderers (19 total)

| Module Type | Component | Category |
|-------------|-----------|----------|
| SITE_HEADER | site-header.tsx | Navigation |
| NAVIGATION | navigation.tsx | Navigation |
| PAGE_CONTENT | page-content.tsx | Content |
| BLOG_LIST | blog-list.tsx | Content |
| DOCUMENT_LIST | document-list.tsx | Content |
| FAQ_LIST | faq-list.tsx | Content |
| FORM_EMBED | form-embed.tsx | Content |
| FOOTER | footer-module.tsx | Navigation |
| CHATBOT | chatbot-module.tsx | Utility |
| SEARCH | search-module.tsx | Utility |
| CUSTOM_HTML | custom-html.tsx | Utility |
| MEDIA_GALLERY | media-gallery.tsx | Content |
| ANNOUNCEMENT_LIST | announcement-list.tsx | Government |
| TENDER_LIST | tender-list.tsx | Government |
| SCHEME_LIST | scheme-list.tsx | Government |
| SERVICE_LIST | scheme-list.tsx | Government |
| QUICK_LINKS | quick-links.tsx | Utility |
| NEWSROOM_LIST | newsroom-list.tsx | Government |
| PRESS_RELEASE_LIST | newsroom-list.tsx | Government |

## Public Rendering Flow

1. `TemplateRenderer` fetches render data from `/public/template/render-data`
2. Returns active template + active regions + visible modules + site settings
3. Sorts regions by `sortOrder`, renders each via `RegionRenderer`
4. `RegionRenderer` maps regionType to semantic HTML (header/nav/main/aside/footer)
5. Renders sorted visible modules via `ModuleRenderer`
6. `ModuleRenderer` resolves component from module-registry, wraps in error boundary
7. Missing module type → shows nothing publicly (dev mode shows placeholder)

## How to Configure Homepage

1. Go to **Website Builder → Templates → Layout Builder**
2. The builder loads the active template's regions and modules
3. Add modules from the left palette to appropriate regions
4. Reorder modules with up/down arrows
5. Configure each module via the right settings panel
6. Preview at `/templates/builder/preview` or click "Live Preview"
7. Changes are saved to DB and reflected publicly immediately

## How to Add a New Module Renderer

1. Create component in `apps/public-web/src/components/modules/my-module.tsx`
2. Export as `MyModuleComponent` accepting `ModuleComponentProps`
3. Register in `apps/public-web/src/lib/module-registry.ts`: `MY_MODULE: MyModuleComponent`
4. Register in TemplateModuleRegistry via admin API or seed

## Green Code Compliance

- Module palette fetched once on builder load (no polling)
- Regions/modules fetched once (reload on save)
- Public rendering: only active template, only visible modules
- Disabled modules skipped (no rendering, no data fetch)
- Async server components fetch only their own data
- Modules return `null` if no data (no empty wrappers)
- No heavy drag-and-drop library (MVP uses add/move up/move down)

## Sidebar Location

Website Builder → Templates → Layout Builder

## Troubleshooting

- **Module not showing publicly**: Check `isVisible=true` in template builder, check module is registered in module-registry.ts
- **Builder shows no template**: Activate a template first at /templates
- **Module palette empty**: Check TemplateModuleRegistry has active + publicEnabled entries
