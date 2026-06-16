# Public Template Builder

The Public Template Builder edits the active website template by using existing template records, regions, and region modules.

## Data Model

- `WebsiteTemplate`: template metadata, status, active flag, preview metadata, theme settings, and supported modules.
- `TemplateRegion`: builder section/region with key, title, subtitle, type, sort order, required flag, and visibility.
- `TemplateRegionModule`: module placed inside a region with module type, module key, display title, visibility, sort order, and `configJson`.
- `TemplateModuleRegistry`: module palette entries with supported region types and default config.

## Builder Flow

1. Select or activate a template.
2. Open `/templates/builder`.
3. The builder loads the active template, regions, and module palette.
4. The palette is filtered by template support and Module Management settings.
5. Admins add, remove, reorder, show/hide, and configure modules.
6. Section settings are edited from the settings rail.
7. Preview can be checked in desktop, tablet, and mobile widths.
8. Activation controls which layout is rendered by the public website.

## Preview

The builder preview uses draft region/module data and does not require changing published content. Public website render data only returns active templates, active regions, visible modules, and public-safe module types.

## Theme Settings

Template customization saves both legacy `theme` values and builder-compatible `themeSettings` values. Public rendering reads both and exposes CSS variables for template modules.

## Module Management

If a CMS module is globally disabled or not template-available, it is hidden from the palette. If it is already placed in a layout, public render data filters it out before the public site receives it.

## Government Design System Template

The `government-design-system` template (slug) is registered as a GOVERNMENT type template in Template Manager. It provides:

- 18 configurable sections (regions)
- 32 supported module types
- 6 theme presets (Digital India Blue, Government Green, Neutral Ministry, High Contrast, Service Portal, News Portal)
- Design-system-based CSS token system (`--public-*` custom properties)
- UX4G/GIGW-readiness aligned accessibility structure

### Section Configuration

Each section can be configured from the Settings panel:
- Section title and description
- Sort order
- Visibility (enable/disable section)
- Modules placed within the section

### Module Configuration

Common config for all modules:
- `displayTitle` — section heading shown to public
- `showTitle` — show/hide heading
- `limit` — number of items
- `displayMode` — list/card/grid/table/ticker/accordion
- `categoryId`, `departmentId` — optional filters
- `showDate`, `showImage`, `showCTA` — display toggles
- `customCssClass` — custom Tailwind class override

### Theme Preset Selection

1. Open Templates → Customize.
2. Select a preset under Color Presets.
3. Optionally fine-tune individual colors.
4. Save — changes apply immediately.

### Desktop / Tablet / Mobile Preview

Use the device toggle in the builder toolbar (Monitor / Tablet / Smartphone icons) to preview the layout at different widths.

### Publish / Activate

Click **Activate** on the template card in Templates page. Only one template can be active at a time. The public website immediately uses the activated template's regions and modules.

## Design System Admin Pages

| Page | Path |
|---|---|
| Design System Overview | `/templates/design-system` |
| Theme Tokens Reference | `/templates/design-system/tokens` |
| Component Library | `/templates/design-system/components` |
| Theme Presets | `/templates/design-system/presets` |

