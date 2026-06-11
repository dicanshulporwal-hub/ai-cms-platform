# Government Modern Template

Government Modern is a configurable public website template for the Public Template Builder. It is not a hardcoded-only public layout. The template is registered as a `WebsiteTemplate` with slug `government-modern` and renders through the active public template flow.

## Template Metadata

- Name: Government Modern
- Slug: `government-modern`
- Version: `1.0.0`
- Type: `GOVERNMENT`
- Preview image: `/templates/previews/government-modern.png`
- Layout model: `TemplateRegion` and `TemplateRegionModule`
- Theme model: `WebsiteTemplate.configJson.theme` and `WebsiteTemplate.configJson.themeSettings`

## Sections

Government Modern exposes these builder sections:

- `topbar`
- `header`
- `navigation`
- `hero`
- `quick_access`
- `latest_updates`
- `services`
- `tenders`
- `newsroom`
- `departments`
- `documents`
- `statistics`
- `gallery`
- `footer`
- `chatbot`

Each section is stored as a template region and supports visibility, sort order, title, subtitle, module placement, and module ordering.

## Default Layout

The seed creates safe default modules for core enabled areas such as header, navigation, hero, quick links, latest updates, newsroom, documents, statistics, gallery, footer, and chatbot. Optional government sections such as tenders, services, and contact directory are available as regions, but start empty/inactive when the matching CMS module is disabled.

## Theme

Theme settings are stored in `configJson.themeSettings` and mirrored to `configJson.theme` for compatibility with the current public renderer. Public rendering exposes CSS variables such as `--public-primary`, `--public-secondary`, `--public-accent`, `--public-background`, `--public-text`, `--public-border`, `--public-radius`, and `--public-font-family`.

## Rendering

The public website renders Government Modern through:

Active Template -> Active Regions -> Visible Region Modules -> Public Module Renderer -> Published public content APIs.

Disabled modules are filtered before public render data is returned.
