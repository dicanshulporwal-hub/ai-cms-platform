# Roles and Permissions

## Architecture

The CMS uses a role-based access control (RBAC) system with granular permissions. Each user is assigned one role, and each role has a set of permission keys that determine what actions the user can perform.

## Permission Groups

Permissions are organized by module:

| Module | Permissions |
|--------|------------|
| Dashboard | `dashboard.view` |
| Users | `users.view`, `users.create`, `users.update`, `users.delete`, `users.change_status` |
| Roles | `roles.view`, `roles.create`, `roles.update`, `roles.delete`, `roles.update_permissions` |
| Pages | `pages.view`, `pages.create`, `pages.update`, `pages.delete`, `pages.submit`, `pages.approve`, `pages.publish` |
| Blogs | `blogs.view`, `blogs.create`, `blogs.update`, `blogs.delete`, `blogs.submit`, `blogs.approve`, `blogs.publish` |
| Media | `media.view`, `media.upload`, `media.update`, `media.delete` |
| Workflow | `workflow.view`, `workflow.request_changes`, `workflow.approve`, `workflow.publish` |
| AI | `ai.use`, `ai.view_usage` |
| Chatbot | `chatbot.view`, `chatbot.settings`, `chatbot.view_conversations`, `chatbot.view_leads` |
| Settings | `settings.view`, `settings.update` |
| Notifications | `notifications.view`, `notifications.update` |
| Audit Logs | `audit_logs.view` |
| Email Logs | `email_logs.view` |

## Default System Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| Super Admin | Full platform access | All permissions (bypasses checks) |
| Admin | Day-to-day CMS operations | All except role modification |
| Editor | Content creation | Pages/blogs CRUD, media upload, AI |
| Reviewer | Content review | Workflow review/approve |
| Publisher | Content publishing | Workflow publish |
| Viewer | Read-only access | View-only permissions |

## Security Rules

1. Super Admin bypasses all permission checks
2. Super Admin role permissions cannot be modified
3. Super Admin role cannot be deactivated or deleted
4. System role names cannot be changed
5. Users cannot modify their own role's permissions
6. Roles with assigned users cannot be deleted
7. Inactive roles cannot be assigned to new users
8. Only Super Admin can create/update/delete roles

## Backend Guard Usage

### Role-based (existing):
```typescript
@Roles('Super Admin', 'Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
```

### Permission-based (new):
```typescript
@Permissions('pages.create')
@UseGuards(JwtAuthGuard, PermissionsGuard)
```

## API Endpoints

```
GET    /roles                  List all roles
GET    /roles/permissions      Get all permission groups
GET    /roles/:id              Get role by ID
POST   /roles                  Create role (Super Admin)
PUT    /roles/:id              Update role (Super Admin)
PATCH  /roles/:id/permissions  Update permissions (Super Admin)
PATCH  /roles/:id/status       Activate/deactivate (Super Admin)
DELETE /roles/:id              Delete role (Super Admin)
```

## Testing Checklist

- [ ] Login as Super Admin
- [ ] View roles list at /roles
- [ ] Create a custom role
- [ ] Edit role name and description
- [ ] Assign permissions via /roles/:id/permissions
- [ ] Activate/deactivate a custom role
- [ ] Delete a custom role with no users
- [ ] Verify system roles cannot be deleted
- [ ] Verify Super Admin permissions cannot be modified
- [ ] Login as Admin and verify read-only access
- [ ] Verify inactive roles don't appear in user creation dropdown
