'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState, useCallback } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnreadNotificationCount } from '@/hooks/use-notifications';
import { useEnabledModules } from '@/hooks/use-enabled-modules';
import { filterAdminMenu } from '@/lib/filter-admin-menu';
import { type MenuGroup, type MenuItem } from '@/config/admin-menu';
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
  try {
    return JSON.parse(localStorage.getItem('sidebar-collapsed') || '{}');
  } catch {
    return {};
  }
}

function saveCollapsedState(state: Record<string, boolean>) {
  try {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(state));
  } catch {}
}

function getSidebarCompact(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('sidebar-compact') === 'true';
}

function saveSidebarCompact(compact: boolean) {
  try {
    localStorage.setItem('sidebar-compact', String(compact));
  } catch {}
}

export function AppShell({
  children,
  user,
  onLogout,
  isLoggingOut = false,
  sectionTitle = 'Dashboard',
}: AppShellProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [compact, setCompact] = useState(false);
  const unreadCountQuery = useUnreadNotificationCount();
  const unreadCount = unreadCountQuery.data?.count ?? 0;
  const enabledModulesQuery = useEnabledModules();
  const enabledModules = enabledModulesQuery.data ?? new Set<string>();

  useEffect(() => {
    setCollapsed(getCollapsedState());
    setCompact(getSidebarCompact());
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleGroup = useCallback((key: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveCollapsedState(next);
      return next;
    });
  }, []);

  const toggleCompact = useCallback(() => {
    setCompact((prev) => {
      const next = !prev;
      saveSidebarCompact(next);
      return next;
    });
  }, []);

  // Filter menu using centralized helper
  const visibleGroups = filterAdminMenu(user, enabledModules, sidebarSearch);

  function isGroupActive(group: MenuGroup): boolean {
    return group.items.some((item) => {
      if (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`))
        return true;
      if (item.children?.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`)))
        return true;
      return false;
    });
  }

  function isGroupExpanded(group: MenuGroup): boolean {
    if (sidebarSearch.trim()) return true;
    if (isGroupActive(group)) return true;
    if (collapsed[group.key] !== undefined) return !collapsed[group.key];
    return !group.defaultCollapsed;
  }

  // Sidebar content (shared between desktop and mobile)
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-[60px] items-center justify-between px-5 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-active">
            <span className="text-sm font-bold text-white">AI</span>
          </div>
          {!compact && (
            <div>
              <p className="text-sm font-semibold text-sidebar-text-active">AI CMS</p>
              <p className="text-[10px] text-sidebar-group-text">Admin Panel</p>
            </div>
          )}
        </Link>
      </div>

      {/* Sidebar Search */}
      {!compact && (
        <div className="px-3 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-sidebar-group-text" />
            <input
              type="text"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search menu..."
              className="w-full rounded-md border-0 bg-sidebar-hover py-2 pl-8 pr-3 text-xs text-sidebar-text placeholder:text-sidebar-group-text focus:outline-none focus:ring-1 focus:ring-sidebar-active"
              aria-label="Search navigation menu"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto admin-scrollbar px-3 py-2 space-y-0.5" aria-label="Admin navigation">
        {visibleGroups.map((group) => {
          const expanded = isGroupExpanded(group);
          const groupActive = isGroupActive(group);
          const GroupIcon = group.icon;

          // Dashboard renders as single link
          if (group.key === 'dashboard') {
            const item = group.items[0];
            if (!item) return null;
            const Icon = item.icon || GroupIcon;
            const active =
              item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={group.key}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-sidebar-active text-white shadow-sm'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active',
                  compact ? 'justify-center px-0' : '',
                ].join(' ')}
                title={compact ? item.label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!compact && <span>{item.label}</span>}
              </Link>
            );
          }

          return (
            <div key={group.key} className="pt-3 first:pt-0">
              {/* Group Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                aria-expanded={expanded}
                className={[
                  'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                  groupActive ? 'text-sidebar-active' : 'text-sidebar-group-text hover:text-sidebar-text',
                  compact ? 'justify-center' : '',
                ].join(' ')}
              >
                <GroupIcon className="h-3.5 w-3.5 flex-shrink-0" />
                {!compact && (
                  <>
                    <span className="flex-1 text-left">{group.label}</span>
                    {expanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </>
                )}
              </button>

              {/* Group Items */}
              {expanded && !compact && (
                <div className="mt-0.5 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon || GroupIcon;
                    const active = item.exact
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const hasChildren = item.children && item.children.length > 0;
                    const childActive = item.children?.some(
                      (c) => pathname === c.href || pathname.startsWith(`${c.href}/`),
                    );

                    return (
                      <div key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          className={[
                            'flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-all duration-150',
                            active
                              ? 'bg-sidebar-active text-white font-medium shadow-sm'
                              : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active',
                          ].join(' ')}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0 opacity-75" />
                          <span className="flex-1">{item.label}</span>
                          {hasChildren && (
                            <ChevronDown
                              className={[
                                'h-3 w-3 transition-transform',
                                active || childActive ? '' : '-rotate-90',
                              ].join(' ')}
                            />
                          )}
                        </Link>
                        {hasChildren && (active || childActive) && (
                          <div className="ml-5 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                            {item.children!.map((sub) => {
                              const subActive =
                                pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  aria-current={subActive ? 'page' : undefined}
                                  className={[
                                    'flex items-center rounded-md px-2 py-1.5 text-xs transition-colors',
                                    subActive
                                      ? 'text-sidebar-text-active font-medium bg-sidebar-hover'
                                      : 'text-sidebar-group-text hover:text-sidebar-text hover:bg-sidebar-hover',
                                  ].join(' ')}
                                >
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

      {/* Sidebar footer */}
      {!compact && (
        <div className="border-t border-sidebar-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-hover text-sidebar-text">
              <UserRound className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-text-active truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-group-text truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 hidden flex-col bg-sidebar-bg lg:flex transition-all duration-200',
          compact ? 'w-16' : 'w-[260px]',
        ].join(' ')}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-sidebar-bg shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div
        className={[
          'transition-all duration-200',
          compact ? 'lg:pl-16' : 'lg:pl-[260px]',
        ].join(' ')}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-border bg-white/95 backdrop-blur-sm px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop sidebar toggle */}
            <button
              type="button"
              onClick={toggleCompact}
              className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={compact ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {compact ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>

            {/* Page Title */}
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-foreground">{sectionTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              href="/notifications"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                onClick={() => setUserMenuOpen((o) => !o)}
                type="button"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-3.5 w-3.5" />
                </div>
                <span className="hidden md:inline font-medium text-foreground">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 top-11 z-30 w-64 rounded-lg border border-border bg-white p-3 shadow-lg" role="menu">
                    <div className="border-b border-border pb-3 mb-3">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <span className="mt-2 inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {user.role}
                      </span>
                    </div>
                    <Button
                      className="w-full justify-start gap-2 h-9 text-sm"
                      disabled={isLoggingOut}
                      onClick={onLogout}
                      type="button"
                      variant="ghost"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? 'Signing out...' : 'Sign out'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
