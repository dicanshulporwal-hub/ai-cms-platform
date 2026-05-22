'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import {
  Bell,
  ClipboardCheck,
  FileText,
  FolderTree,
  Images,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Tags,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnreadNotificationCount } from '@/hooks/use-notifications';
import type { AuthUser } from '@/types/auth';

interface AppShellProps {
  children: ReactNode;
  user: AuthUser;
  onLogout: () => void;
  isLoggingOut?: boolean;
  sectionTitle?: string;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pages', label: 'Pages', icon: FileText },
  { href: '/blogs', label: 'Blogs', icon: Newspaper },
  { href: '/workflow', label: 'Workflow', icon: ClipboardCheck },
  { href: '/media', label: 'Media', icon: Images },
  { href: '/categories', label: 'Categories', icon: FolderTree },
  { href: '/tags', label: 'Tags', icon: Tags },
];

export function AppShell({
  children,
  user,
  onLogout,
  isLoggingOut = false,
  sectionTitle = 'Dashboard',
}: AppShellProps) {
  const pathname = usePathname();
  const unreadCountQuery = useUnreadNotificationCount();
  const unreadCount = unreadCountQuery.data?.count ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <div>
            <p className="text-sm font-semibold">AI CMS</p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                href={item.href}
                key={item.label}
                className={[
                  'flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:px-8">
          <div>
            <p className="text-sm font-medium">{sectionTitle}</p>
            <p className="text-xs text-muted-foreground">
              Signed in as {user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-muted"
              href="/notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-destructive px-1.5 py-0.5 text-center text-xs font-medium text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </Link>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <Button
              disabled={isLoggingOut}
              onClick={onLogout}
              type="button"
              variant="outline"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? 'Signing out' : 'Logout'}
            </Button>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
