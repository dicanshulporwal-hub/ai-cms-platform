'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import type { AuthUser } from '@/types/auth';

interface AdminPageShellProps {
  children: (user: AuthUser) => ReactNode;
  sectionTitle: string;
}

export function AdminPageShell({
  children,
  sectionTitle,
}: AdminPageShellProps) {
  const router = useRouter();
  const userQuery = useCurrentUser();
  const logoutMutation = useLogout();

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.replace('/login');
        router.refresh();
      },
    });
  }

  if (userQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading
        </div>
      </main>
    );
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session unavailable</CardTitle>
            <CardDescription>
              Your session could not be loaded. Please sign in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.replace('/login')}>
              Return to login
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <AppShell
      isLoggingOut={logoutMutation.isPending}
      onLogout={handleLogout}
      sectionTitle={sectionTitle}
      user={userQuery.data}
    >
      {children(userQuery.data)}
    </AppShell>
  );
}
