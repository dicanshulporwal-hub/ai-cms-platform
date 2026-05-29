'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import {
  Bell,
  ChevronDown,
  ClipboardCheck,
  FileText,
  FolderTree,
  Images,
  Layout,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Newspaper,
  Settings,
  Shield,
  Sparkles,
  Tags,
  UserRound,
  Users,
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

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/pages', label: 'Pages', icon: FileText },
  { href: '/blogs', label: 'Blogs', icon: Newspaper },
  { href: '/categories', label: 'Categories', icon: FolderTree },
  { href: '/tags', label: 'Tags', icon: Tags },
  { href: '/media', label: 'Media', icon: Images },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/workflow', label: 'Workflow', icon: ClipboardCheck },
  { href: '/ai/usage', label: 'AI Usage', icon: Sparkles },
  { href: '/ai/providers', label: 'AI Providers', icon: Sparkles, adminOnly: true },
  { href: '/chatbot', label: 'Chatbot', icon: MessageCircle, exact: true },
  { href: '/chatbot/leads', label: 'Leads', icon: Users },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/users', label: 'Users', icon: Users, adminOnly: true },
  { href: '/roles', label: 'Roles', icon: Shield, adminOnly: true },
  { href: '/templates', label: 'Templates', icon: Layout, adminOnly: true },
  { href: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
];

function isAdmin(user: AuthUser) {
  return user.role === 'Super Admin' || user.role === 'Admin';
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
            // Skip admin-only items for non-admin users
            if (item.adminOnly && !isAdmin(user)) {
              return null;
            }

            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

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
            <div className="relative">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm transition-colors hover:bg-muted"
                onClick={() => setUserMenuOpen((isOpen) => !isOpen)}
                type="button"
              >
                <UserRound className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {userMenuOpen ? (
                <div className="absolute right-0 top-12 z-20 w-72 rounded-md border border-border bg-card p-3 shadow-lg">
                  <div className="border-b border-border pb-3">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="mt-2 inline-flex rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium">
                      {user.role}
                    </p>
                  </div>
                  <Button
                    className="mt-3 w-full"
                    disabled={isLoggingOut}
                    onClick={onLogout}
                    type="button"
                    variant="outline"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? 'Signing out' : 'Logout'}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
