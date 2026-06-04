# Admin Theme Guidelines

## Overview

The AI CMS admin panel uses a flat, clean, responsive dashboard style inspired by modern admin interfaces. The theme is **entirely original** — no proprietary ThemeForest assets are used.

> This admin theme is inspired by flat dashboard layouts and does not include proprietary ThemeForest assets unless separately licensed.

## Architecture

```
apps/admin-web/src/
├── app/globals.css            # CSS custom properties (design tokens)
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx      # Main shell: sidebar + topbar + content
│   │   ├── admin-page-shell.tsx  # Auth wrapper (render-prop)
│   │   └── admin-breadcrumbs.tsx # Path-based breadcrumbs
│   └── ui/
│       ├── admin-status-badge.tsx  # Status badge variants
│       ├── card.tsx            # Base card component
│       ├── table.tsx           # Data table components
│       └── button.tsx          # Button variants
├── config/
│   └── admin-menu.ts          # Centralized menu configuration
├── hooks/
│   └── use-enabled-modules.ts # Module-aware visibility hook
├── lib/
│   └── filter-admin-menu.ts   # Menu filtering helper
└── tailwind.config.ts         # Tailwind with CSS variable tokens
```

## Design Tokens

All theme colors are defined as HSL CSS custom properties in `globals.css`:

| Token | Purpose |
|-------|---------|
| `--sidebar-bg` | Dark sidebar background |
| `--sidebar-text` | Default sidebar text |
| `--sidebar-text-active` | Active/highlighted text |
| `--sidebar-hover` | Hover state background |
| `--sidebar-active` | Active item background |
| `--sidebar-group-text` | Muted group labels |
| `--sidebar-border` | Sidebar divider lines |
| `--topbar-bg` | Top header background |
| `--topbar-height` | Header height (60px) |
| `--status-success/warning/error/info` | Badge colors |

## Sidebar

### Structure
- Dark background (`--sidebar-bg`)
- Sticky logo header (60px)
- Search input for filtering
- Collapsible grouped navigation
- User profile at bottom
- Compact mode (toggle from topbar)
- Mobile drawer on small screens

### Menu Configuration
All sidebar items are defined in `apps/admin-web/src/config/admin-menu.ts`:

```typescript
{
  key: 'my_group',
  label: 'My Group',
  icon: SomeIcon,
  adminOnly: true,        // Hide for non-admin users
  defaultCollapsed: true, // Start collapsed
  items: [
    {
      href: '/my-route',
      label: 'My Module',
      icon: SomeIcon,
      adminOnly: true,
      moduleKey: 'my_module',  // Links to CMS Module system
    },
  ],
}
```

### Adding a New Menu Item

1. Open `apps/admin-web/src/config/admin-menu.ts`
2. Find the appropriate group or create a new one
3. Add the item with `href`, `label`, `icon`
4. If the item corresponds to a toggleable CMS module, add `moduleKey`
5. Add `adminOnly: true` if only admins should see it

### Visibility Rules

Menu items are filtered by `apps/admin-web/src/lib/filter-admin-menu.ts`:
1. `adminOnly` groups/items hidden for non-Admin/Super Admin
2. Items with `moduleKey` hidden if that module is disabled in Module Management
3. Groups with zero visible items are hidden
4. Search filter matches item labels

## Module-Aware Behavior

The sidebar fetches enabled modules via `useEnabledModules()` hook (cached 5 min).
- If a module is disabled in Operations → Modules, its sidebar item disappears
- Dashboard cards should also check module state before rendering
- No API calls for disabled module data

## Topbar

- Section title (from `AdminPageShell` prop)
- Sidebar compact toggle (desktop)
- Mobile menu button
- Notification bell with unread count
- User dropdown with role badge and logout

## Page Pattern

Every admin page follows this pattern:

```tsx
export default function MyPage() {
  return (
    <AdminPageShell sectionTitle="My Page">
      {(user) => <MyContent user={user} />}
    </AdminPageShell>
  );
}
```

## Styling Future Pages

1. Use Tailwind classes (no inline styles)
2. Use existing UI components: `Card`, `Table`, `Button`, `AdminStatusBadge`
3. Use `StatCard` for metric displays
4. Use `DashboardSection` for card-wrapped sections
5. Use the `rounded-lg border bg-card` pattern for panels
6. Spacing: `space-y-6` between sections, `gap-4` in grids
7. Don't add new CSS frameworks or heavy UI libraries

## Responsive Behavior

- Desktop: Full sidebar (260px) or compact sidebar (64px)
- Tablet: Compact sidebar by default
- Mobile: Hidden sidebar with drawer (hamburger menu in topbar)
- Tables: `overflow-x-auto` wrapper for horizontal scroll
- Grids: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` responsive pattern

## Accessibility

- `aria-current="page"` on active nav items
- `aria-expanded` on collapsible groups
- `aria-label` on navigation landmarks
- Keyboard accessible sidebar (all items are links/buttons)
- Focus-visible states preserved
- Sufficient color contrast (sidebar text against dark bg)
- Skip link present on public site

## Green Code Rules

- Menu config is a static import (no API call for menu structure)
- Enabled modules fetched once, cached 5 minutes
- Collapsed state in localStorage (no backend)
- No polling for notification counts (fetched on mount only)
- Icons tree-shaken from lucide-react
- No duplicate fetches for sidebar rendering

## License Safety

- No ThemeForest/Envato assets copied
- No Bootstrap 3 or jQuery
- All icons from MIT-licensed lucide-react
- Tailwind CSS (MIT license)
- Custom CSS only
- Reference theme used only as visual inspiration for layout patterns
