'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Bell, ChevronDown, ChevronRight, LogOut, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnreadNotificationCount } from '@/hooks/use-notifications';
import { adminMenuGroups, type MenuGroup, type MenuItem } from '@/config/admin-menu';
import type { AuthUser } from '@/types/auth';

interface AppShellProps {
  children: ReactNode;
  user: AuthUser;
  onLogout: () => void;
  isLoggingOut?: boolean;
  sectionTitle?: string;
}

function isAdmin(user: AuthUser) {
  return user.role === 'Super Admin' || user.role === 'Admin';
}

function getCollapsedState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('sidebar-collapsed') || '{}'); } catch { return {}; }
}

function saveCollapsedState(state: Record<string, boolean>) {
  try { localStorage.setItem('sidebar-collapsed', JSON.stringify(state)); } catch {}
}

export function AppShell({ children, user, onLogout, isLoggingOut = false, sectionTitle = 'Dashboard' }: AppShellProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const unreadCountQuery = useUnreadNotificationCount();
  const unreadCount = unreadCountQuery.data?.count ?? 0;

  useEffect(() => { setCollapsed(getCollapsedState()); }, []);

  function toggleGroup(key: string) {
    setCollapsed(prev => { const next = { ...prev, [key]: !prev[key] }; saveCollapsedState(next); return next; });
  }

  // Filter groups based on user role
  const visibleGroups = adminMenuGroups.filter(group => {
    if (group.adminOnly && !isAdmin(user)) return false;
    const visibleItems = group.items.filter(item => !(item.adminOnly && !isAdmin(user)));
    return visibleItems.length > 0;
  });

  // Check if a group has an active route (auto-expand)
  function isGroupActive(group: MenuGroup): boolean {
    return group.items.some(item => {
      if (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
      if (item.children?.some(c => pathname === c.href || pathname.startsWith(`${c.href}/`))) return true;
      return false;
    });
  }

  function isGroupExpanded(group: MenuGroup): boolean {
    if (isGroupActive(group)) return true; // Auto-expand active group
    if (collapsed[group.key] !== undefined) return !collapsed[group.key];
    return !group.defaultCollapsed;
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card lg:block overflow-y-auto">
        <div className="flex h-16 items-center border-b border-border px-6 sticky top-0 bg-card z-10">
          <div>
            <p className="text-sm font-semibold">AI CMS</p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {visibleGroups.map((group) => {
            const expanded = isGroupExpanded(group);
            const groupActive = isGroupActive(group);
            const GroupIcon = group.icon;
            const visibleItems = group.items.filter(item => !(item.adminOnly && !isAdmin(user)));

            // Single-item groups render without group header
            if (group.key === 'dashboard') {
              const item = visibleItems[0];
              const Icon = item.icon || GroupIcon;
              const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={group.key} href={item.href} className={['flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm transition-colors', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'].join(' ')}>
                  <Icon className="h-4 w-4" />{item.label}
                </Link>
              );
            }

            return (
              <div key={group.key} className="pt-2">
                {/* Group Header */}
                <button type="button" onClick={() => toggleGroup(group.key)} className={['flex h-8 w-full items-center gap-2 rounded-md px-3 text-xs font-semibold uppercase tracking-wider transition-colors', groupActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'].join(' ')}>
                  <GroupIcon className="h-3.5 w-3.5" />
                  <span className="flex-1 text-left">{group.label}</span>
                  {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>

                {/* Group Items */}
                {expanded && (
                  <div className="mt-0.5 space-y-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon || GroupIcon;
                      const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const hasChildren = item.children && item.children.length > 0;
                      const childActive = item.children?.some(c => pathname === c.href || pathname.startsWith(`${c.href}/`));

                      return (
                        <div key={item.href}>
                          <Link href={item.href} className={['flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'].join(' ')}>
                            <Icon className="h-4 w-4" />
                            {item.label}
                            {hasChildren && <ChevronDown className={['ml-auto h-3 w-3 transition-transform', active || childActive ? 'rotate-180' : ''].join(' ')} />}
                          </Link>
                          {hasChildren && (active || childActive) && (
                            <div className="ml-7 mt-0.5 space-y-0.5 border-l border-border pl-3">
                              {item.children!.map(sub => {
                                const subActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                                return (
                                  <Link key={sub.href} href={sub.href} className={['flex h-7 items-center rounded-md px-2 text-xs transition-colors', subActive ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'].join(' ')}>
                                    {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:px-8">
          <div>
            <p className="text-sm font-medium">{sectionTitle}</p>
            <p className="text-xs text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-muted" href="/notifications">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-destructive px-1.5 py-0.5 text-center text-xs font-medium text-destructive-foreground">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
            </Link>
            <div className="relative">
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm transition-colors hover:bg-muted" onClick={() => setUserMenuOpen(o => !o)} type="button">
                <UserRound className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 z-20 w-72 rounded-md border border-border bg-card p-3 shadow-lg">
                  <div className="border-b border-border pb-3">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="mt-2 inline-flex rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium">{user.role}</p>
                  </div>
                  <Button className="mt-3 w-full" disabled={isLoggingOut} onClick={onLogout} type="button" variant="outline">
                    <LogOut className="h-4 w-4" />{isLoggingOut ? 'Signing out' : 'Logout'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
