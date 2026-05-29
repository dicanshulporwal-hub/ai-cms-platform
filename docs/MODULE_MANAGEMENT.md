# Module Management

## Concept

The Module Management system allows Super Admin/Admin to enable or disable CMS modules per project/site. Disabling a module hides it from admin UI, blocks backend APIs, hides from public portal, and prevents template placement — without deleting any data.

## Module States

| State | Effect |
|-------|--------|
| `isEnabledGlobally` | Master switch. If false, module is completely disabled. |
| `isAdminVisible` | Whether module appears in admin sidebar. |
| `isPublicEnabled` | Whether module renders on public portal. |
| `isTemplateAvailable` | Whether module can be placed in template regions. |

## Categories

- CORE — Dashboard, Auth, Users, Roles, Settings (cannot be disabled)
- CONTENT — Pages, Blogs, Documents, Categories, Tags
- MEDIA — Media library
- AI — AI Assistant, SEO, Chatbot, Providers
- GOVERNANCE — Workflow, Notifications, Audit Logs
- UTILITY — Templates, Public Website, Search
- PUBLIC_ENGAGEMENT — Forms, Grievance, Newsletter
- GOVERNMENT — Tender, Scheme, RTI
- CUSTOM — User-registered modules

## Core Module Rules

- `auth`, `users`, `roles`, `settings` cannot be disabled
- `dashboard` should not be disabled
- Core modules are protected from deletion

## Dependencies

Modules can declare dependencies. Example:
- `ai_chatbot` depends on `ai_providers`
- `ai_seo` depends on `ai_providers`

Enabling a module checks that all dependencies are enabled first.
Disabling a module checks that no other enabled modules depend on it.

## Backend Guard

```typescript
@ModuleEnabled('blogs')
@Controller('blogs')
export class BlogsController { ... }
```

The `ModuleEnabledGuard` returns 403 if the module is disabled.

## API Endpoints

```
GET    /modules                          List all modules
GET    /modules/enabled                  Get enabled modules
GET    /modules/sidebar                  Get sidebar-visible modules
GET    /modules/:moduleKey               Get module details
POST   /modules                          Register new module
PATCH  /modules/:moduleKey/enable        Enable module
PATCH  /modules/:moduleKey/disable       Disable module
PATCH  /modules/:moduleKey/admin-visibility
PATCH  /modules/:moduleKey/public-visibility
PATCH  /modules/:moduleKey/template-availability
GET    /public/modules/enabled           Public-safe enabled modules
```

## Future Module Registration

To add a new module (e.g., FAQ):
1. Add entry to `seed-cms-modules.ts` or register via API
2. Set `isEnabledGlobally: false` initially
3. When implementation is ready, enable via admin UI
4. Set `isPublicEnabled: true` for public portal
5. Set `isTemplateAvailable: true` for template placement
