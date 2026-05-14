import { ReactNode } from 'react';
import { LayoutDashboard, LogOut, Newspaper, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/lib/client-auth-api';

interface AppShellProps {
  children: ReactNode;
  user: AuthUser;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Content', icon: Newspaper },
  { label: 'AI Tools', icon: Sparkles },
  { label: 'Settings', icon: Settings },
];

export function AppShell({
  children,
  user,
  onLogout,
  isLoggingOut = false,
}: AppShellProps) {
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
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = index === 0;

            return (
              <button
                key={item.label}
                className={[
                  'flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                ].join(' ')}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:px-8">
          <div>
            <p className="text-sm font-medium">Dashboard</p>
            <p className="text-xs text-muted-foreground">
              Signed in as {user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
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
