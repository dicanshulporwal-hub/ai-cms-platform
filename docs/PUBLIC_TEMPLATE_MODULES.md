# Public Template Modules

Template modules are stored in `TemplateModuleRegistry` and placed inside regions as `TemplateRegionModule` records.

## Supported Government Modern Module Types

- `SITE_HEADER`
- `NAVIGATION_MENU`
- `PAGE_CONTENT`
- `BLOG_LIST`
- `DOCUMENT_LIST`
- `FAQ_LIST`
- `FORM_EMBED`
- `SEARCH`
- `CHATBOT`
- `FOOTER_LINKS`
- `MEDIA_GALLERY`
- `ANNOUNCEMENT_LIST`
- `TENDER_LIST`
- `SCHEME_LIST`
- `SERVICE_LIST`
- `GRIEVANCE_SUBMIT`
- `GRIEVANCE_TRACK`
- `RTI_DISCLOSURE`
- `DEPARTMENT_LIST`
- `CONTACT_DIRECTORY`
- `ORGANIZATION_CHART`
- `NEWSROOM_LIST`
- `PRESS_RELEASE_LIST`
- `ACCESSIBILITY_CONTROLS`
- `LANGUAGE_SWITCHER`
- `STATISTICS_COUNTERS`
- `QUICK_LINKS`
- `SOCIAL_LINKS`
- `NEWSLETTER_SUBSCRIBE`
- `CUSTOM_HTML`

Legacy aliases such as `NAVIGATION` and `FOOTER` are still supported for older seeded layouts.

## Common Config

Common module config is saved in `configJson`:

- `displayTitle`
- `showTitle`
- `limit`
- `displayMode`
- `categoryId`
- `departmentId`
- `showDate`
- `showImage`
- `showCTA`
- `showSearch`
- `showFilters`
- `customCssClass`
- `isVisible`

## Module-Specific Config

- Announcements: `announcementType`, `showPinnedFirst`, `showImportantOnly`, `tickerMode`
- Tenders: `procurementType`, `showActiveOnly`, `showClosingDate`, `showCorrigendumBadge`
- Schemes/services: `categoryId`, `departmentId`, `showApplyButton`, `showApplicationMode`
- Newsroom: `itemType`, `showFeaturedOnly`, `showGallery`
- Contact directory: `departmentId`, `designationId`, `showSearch`, `showFilters`
- Navigation: `menuId`, `location`, `sticky`, `displayMode`
- Hero/custom HTML: `title`, `subtitle`, `backgroundImage`, `primaryCTA`, `secondaryCTA`, `html`
- Statistics: `statSource`, `manualCounters`, `autoCounters`

## Public Component Usage by Module

All updated module renderers use design-system components from `@/design-system/`:

| Module | Design System Components |
|---|---|
| ANNOUNCEMENT_LIST | `PublicSection`, `PublicBadge` |
| TENDER_LIST | `PublicSection`, `PublicTable`, `PublicBadge` |
| SCHEME_LIST / SERVICE_LIST | `PublicSection`, `PublicCard`, `PublicBadge`, `PublicGrid`, `PublicButton` |
| NEWSROOM_LIST / PRESS_RELEASE_LIST | `PublicSection`, `PublicCard`, `PublicBadge`, `PublicGrid` |
| BLOG_LIST | `PublicSection`, `PublicCard`, `PublicGrid` |
| DOCUMENT_LIST | `PublicSection`, `PublicBadge` |
| FAQ_LIST | `PublicSection`, `PublicAccordion` |
| STATISTICS_COUNTERS | `PublicSection`, `PublicStatCard`, `PublicGrid` |
| QUICK_LINKS | `PublicSection`, `PublicGrid` |
| MEDIA_GALLERY | `PublicSection`, `PublicGrid` |
| FOOTER / FOOTER_LINKS | `PublicFooter`, `PublicLinkList`, `PublicGrid` |
| GRIEVANCE_SUBMIT / GRIEVANCE_TRACK | `PublicSection`, `PublicButton` |
| RTI_DISCLOSURE | `PublicSection`, `PublicButton` |
| DEPARTMENT_LIST / CONTACT_DIRECTORY | `PublicSection`, `PublicCard`, `PublicGrid` |
| SOCIAL_LINKS | Inline (icon links) |
| LANGUAGE_SWITCHER | Client component (button toggle) |
| NEWSLETTER_SUBSCRIBE | `PublicSection`, `PublicButton`, `PublicAlert` |

## Disabled Module Behaviour

- If a CMS module is globally disabled (`isEnabledGlobally: false`), it does not appear in the Template Builder module palette.
- If a module is placed in a layout but then disabled, `getPublicRenderData()` filters it from the regions before returning data to the public frontend.
- The public site never receives data for disabled module types.
- Admin preview mode shows a placeholder `UnsupportedModulePlaceholder` for unknown module types in development; in production it returns `null` and silently skips rendering.

## Missing Renderer Fallback

If a module type has no renderer registered in `module-registry.ts`:
- In development: renders a visible amber dashed placeholder with the module type name.
- In production: silently returns `null` — the public site does not crash.

## Public Rendering Rules

The public site renders only modules returned by the public template render-data API. Missing renderers are skipped in production. Custom HTML is sanitized before rendering and scripts are not executed.

