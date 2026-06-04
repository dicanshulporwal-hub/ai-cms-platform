import { adminMenuGroups, type MenuGroup, type MenuItem } from '@/config/admin-menu';
import type { AuthUser } from '@/types/auth';

function isAdmin(user: AuthUser): boolean {
  return user.role === 'Super Admin' || user.role === 'Admin';
}

/**
 * Filters admin menu groups based on:
 * 1. User role (adminOnly items hidden for non-admins)
 * 2. Enabled modules (items with moduleKey hidden if module disabled)
 * 3. Search term (case-insensitive label match)
 *
 * @param user - Current authenticated user
 * @param enabledModules - Set of enabled module keys (empty = allow all)
 * @param search - Optional search filter
 */
export function filterAdminMenu(
  user: AuthUser,
  enabledModules: Set<string>,
  search?: string,
): MenuGroup[] {
  const searchLower = (search || '').toLowerCase().trim();
  const hasModuleData = enabledModules.size > 0;

  return adminMenuGroups
    .filter((group) => {
      // Role check at group level
      if (group.adminOnly && !isAdmin(user)) return false;
      return true;
    })
    .map((group) => {
      const filteredItems = group.items.filter((item) => {
        // Role check at item level
        if (item.adminOnly && !isAdmin(user)) return false;

        // Module enabled check (only if we have module data from API)
        if (hasModuleData && item.moduleKey && !enabledModules.has(item.moduleKey)) {
          return false;
        }

        // Search filter
        if (searchLower) {
          const matchesItem = item.label.toLowerCase().includes(searchLower);
          const matchesChildren = item.children?.some((c) =>
            c.label.toLowerCase().includes(searchLower),
          );
          return matchesItem || matchesChildren;
        }

        return true;
      });

      return { ...group, items: filteredItems };
    })
    .filter((group) => {
      // Hide groups with no visible items
      if (group.items.length === 0) return false;
      // When searching, also match group label
      if (searchLower && group.items.length === 0) {
        return group.label.toLowerCase().includes(searchLower);
      }
      return true;
    });
}
