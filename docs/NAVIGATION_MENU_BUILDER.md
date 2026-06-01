# Navigation / Menu Builder

## Overview

Create and manage public website navigation menus (header, footer, sidebar, mobile). Supports nested items, multiple link types, and cached public rendering.

## Sidebar Location

Content → Navigation (with sub-items: All Menus, Create Menu)

## Menu Locations

| Location | Usage |
|----------|-------|
| HEADER | Main site navigation |
| FOOTER | Footer links |
| SIDEBAR_MENU | Sidebar navigation |
| MOBILE | Mobile-specific menu |
| UTILITY | Utility bar (language, accessibility) |
| CUSTOM_MENU | Custom placement |

## Link Types

| Type | Example |
|------|---------|
| INTERNAL_PAGE | /pages/about-us |
| BLOG | /blog or /blog/post-slug |
| DOCUMENT | /documents/annual-report |
| FAQ | /faqs |
| FORM | /forms/contact |
| SEARCH | /search |
| CUSTOM_ROUTE | /any-public-route |
| EXTERNAL_URL | https://external.com |
| NO_LINK | Dropdown parent label |

## Public API (no auth)

| Endpoint | Description |
|----------|-------------|
| `GET /public/menus` | List active menus |
| `GET /public/menus/location/HEADER` | Get header menu with items |
| `GET /public/menus/location/FOOTER?lang=en` | Get footer menu by language |

## Public Response

```json
{
  "id": "...",
  "name": "Main Header",
  "slug": "main-header",
  "location": "HEADER",
  "items": [
    { "id": "...", "label": "Home", "url": "/", "target": "SELF", "children": [] },
    { "id": "...", "label": "About", "url": "/pages/about", "target": "SELF", "children": [
      { "id": "...", "label": "Team", "url": "/pages/team", "target": "SELF" }
    ]}
  ]
}
```

## Green Code

- Public menus cached in memory (60s TTL per location+language)
- Cache invalidated on admin changes
- Only visible, non-deleted items returned publicly
- Lists paginated (take: 50)
- Nested tree built server-side (no N+1)
- No heavy dependencies

## Security

- Admin/API routes blocked from menu URLs
- Only published content links shown publicly
- Disabled module links hidden
- Draft/private content excluded
