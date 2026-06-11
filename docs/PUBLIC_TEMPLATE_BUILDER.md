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
