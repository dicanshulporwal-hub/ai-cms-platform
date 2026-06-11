# Public Template Modules

Template modules are stored in `TemplateModuleRegistry` and placed inside regions as `TemplateRegionModule` records.

## Supported Government Modern Module Types

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

## Public Rendering Rules

The public site renders only modules returned by the public template render-data API. Missing renderers are skipped in production. Custom HTML is sanitized before rendering and scripts are not executed.
