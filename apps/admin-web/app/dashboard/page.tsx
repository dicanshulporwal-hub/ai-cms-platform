'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, ShieldCheck, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchCurrentUser, logout } from '@/lib/client-auth-api';

export default function DashboardPage() {
  const router = useRouter();
  const userQuery = useQuery({
    queryFn: fetchCurrentUser,
    queryKey: ['current-user'],
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      router.replace('/login');
      router.refresh();
    },
  });

  if (userQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading dashboard
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

  const user = userQuery.data;

  return (
    <AppShell
      isLoggingOut={logoutMutation.isPending}
      onLogout={() => logoutMutation.mutate()}
      user={user}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              Logged-in user
            </CardTitle>
            <CardDescription>Current authenticated session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Role
            </CardTitle>
            <CardDescription>Role returned by the backend JWT flow.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="inline-flex rounded-md border border-border bg-muted px-3 py-1 text-sm font-medium">
              {user.role}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
