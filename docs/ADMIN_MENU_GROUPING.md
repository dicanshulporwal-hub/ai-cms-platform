# Admin Sidebar Menu Grouping

## Overview

The admin sidebar is organized into collapsible groups based on module similarity and usage patterns.

## Group Structure

| # | Group | Items |
|---|-------|-------|
| 1 | Dashboard | Dashboard |
| 2 | Content | Pages, Blogs, Categories, Tags, Documents, Media, Forms, FAQs |
| 3 | Website Builder | Templates (with sub-items) |
| 4 | Workflow | Workflow, Notifications |
| 5 | AI | AI Usage, AI Providers, AI Prompts |
| 6 | Search & Chatbot | Chatbot, Leads |
| 7 | Accessibility | Accessibility |
| 8 | SEO & Quality | Sitemap, Robots.txt, Structured Data, Broken Links |
| 9 | Analytics | Overview, Content, Search, Chatbot, AI Usage |
| 10 | Operations | Modules, Integrations, Backup & Restore |
| 11 | System | Users, Roles & Permissions, Settings |

## Website Builder Group

| Item | Path | Children |
|------|------|----------|
| Templates | /templates | Select Template, Layout Builder, HTML Importer, Modules, Upload, AI Generate |

### Layout Builder
- Route: `/templates/builder`
- 3-panel visual builder: Module Palette + Canvas + Settings
- Preview: `/templates/builder/preview` (responsive iframe)

## Government Modules Group

| Item | Path | Children |
|------|------|----------|
| Tenders | /tenders | All Tenders, Categories |
| RTI | /rti | Requests, Officers |
| Schemes & Services | /scheme-services | All, Categories, Departments |
| Depts & Contacts | /contact-directory | Overview, Departments, Officers, Designations |
| Newsroom | /newsroom | All Items, Categories |

## Behavior

- **Collapsible**: Click group header to expand/collapse
- **Auto-expand**: Group auto-expands when it contains the active route
- **Persist**: Collapsed state saved to localStorage
- **Role-aware**: Admin-only groups hidden for non-admin users
- **Active highlight**: Current route highlighted with primary color

## Configuration

Menu config is centralized in `apps/admin-web/src/config/admin-menu.ts`.

### Adding a New Module

```typescript
// In admin-menu.ts, add to the appropriate group:
{
  key: 'seo',
  label: 'SEO & Quality',
  items: [
    // ... existing items
    { href: '/seo/redirects', label: 'Redirects', icon: Globe, adminOnly: true },
  ],
}
```

### Creating a New Group

```typescript
{
  key: 'my_group',
  label: 'My Group',
  icon: SomeIcon,
  adminOnly: true,
  defaultCollapsed: true,
  items: [
    { href: '/my-route', label: 'My Module', icon: SomeIcon, adminOnly: true },
  ],
}
```

## Filtering Rules

1. If `group.adminOnly` and user is not Admin/Super Admin → hide group
2. If `item.adminOnly` and user is not Admin/Super Admin → hide item
3. If group has no visible items after filtering → hide group
4. Dashboard group renders without collapsible header (always visible)

## Green Code

- Menu config loaded once (static import, no API call)
- Collapsed state in localStorage (no backend storage)
- No duplicate API calls for menu visibility
- Icons imported from single lucide-react package (tree-shaken)
