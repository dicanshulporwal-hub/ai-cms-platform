# Template Builder Compatibility

This document explains how Government Modern stays compatible with the existing Public Template Builder.

## Registration

Government Modern is registered by the template seed service as a normal `WebsiteTemplate`:

- `name`: Government Modern
- `slug`: `government-modern`
- `version`: `1.0.0`
- `templateType`: `GOVERNMENT`
- `configJson.supportedRegions`: builder section keys
- `configJson.supportedModules`: module types available to the template
- `configJson.defaultLayout`: layout metadata
- `configJson.themeSettings`: editable theme values

After seeding, it appears in Template Manager and can be selected/activated like other templates.

## Section Mapping

Government Modern sections are mapped to existing `TemplateRegion` records. No separate section table or renderer is used.

- Section key maps to `regionKey`
- Section title maps to `regionName`
- Section subtitle maps to `description`
- Section type maps to `regionType`
- Section order maps to `sortOrder`
- Section visibility maps to `isActive`

Placed modules are normal `TemplateRegionModule` records with `configJson`, `sortOrder`, and `isVisible`.

## Module Palette

The module palette comes from `TemplateModuleRegistry`. The registry now seeds Government Modern supported module types and filters them against Module Management:

- Hidden if the mapped CMS module is globally disabled.
- Hidden if the mapped CMS module is not template-available.
- Included for structural modules that do not have a CMS module record.
- Public rendering additionally requires public access for mapped CMS modules.

## Module Configuration

The builder settings rail edits common and module-specific fields directly in `TemplateRegionModule.configJson`. This keeps configuration compatible with existing save, preview, and render APIs.

## Theme Settings

Government Modern stores editable theme values in `configJson.themeSettings`. The customization UI also saves a compatible `configJson.theme` object for existing renderer code. Public rendering exposes `--public-*` CSS variables for modules and custom CSS.

## Preview

The builder uses existing draft region/module data for preview and device width simulation. Public preview/render data uses active template data and filters disabled modules before returning data to `apps/public-web`.

## Publish And Activate

The current schema has `DRAFT`, `ACTIVE`, `INACTIVE`, and `ARCHIVED` template statuses. In this codebase, activating a template is the operation that makes the layout public. Layout edits are saved as draft changes on the same template records until the chosen template is active.

## Disabled Modules

When a module is disabled in Module Management:

- It is hidden from the builder palette.
- Existing placed modules are filtered out of public render data.
- Public module data is not fetched by the public app because the module is not rendered.
- Optional Government Modern sections can remain empty/inactive until the module is enabled.

## Adding New Module Support

To add a new public template module later:

1. Add or enable the CMS module in Module Management.
2. Add a `TemplateModuleRegistry` seed entry with supported region types and default config.
3. Map the template module type to the CMS module key in the registry service.
4. Add a public renderer in `apps/public-web/src/components/modules`.
5. Register the renderer in `apps/public-web/src/lib/module-registry.ts`.
6. Document config fields in `docs/PUBLIC_TEMPLATE_MODULES.md`.
