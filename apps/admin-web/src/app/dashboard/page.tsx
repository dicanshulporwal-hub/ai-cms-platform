'use client';

import {
  Bot,
  FilePlus2,
  FileText,
  ImageUp,
  Loader2,
  MessageCircle,
  Newspaper,
  PenLine,
  Send,
  Sparkles,
  UploadCloud,
  Users,
} from 'lucide-react';
import { DashboardSection } from '@/components/dashboard/dashboard-section';
import { EmptyState } from '@/components/dashboard/empty-state';
import { LoadingSkeleton } from '@/components/dashboard/loading-skeleton';
import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { RecentActivityList } from '@/components/dashboard/recent-activity-list';
import { RecentContentList } from '@/components/dashboard/recent-content-list';
import { RecentLeadsList } from '@/components/dashboard/recent-leads-list';
import { StatCard } from '@/components/dashboard/stat-card';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import type { AuthUser } from '@/types/auth';

function isAdmin(user: AuthUser) {
  return user.role === 'Super Admin' || user.role === 'Admin';
}

function getScopeLabel(scope: string) {
  const labels: Record<string, string> = {
    own_content: 'Showing your authored content and AI usage.',
    publish_queue: 'Showing approved content waiting to publish.',
    read_only: 'Showing read-only CMS content status.',
    review_queue: 'Showing content waiting for review.',
    system: 'Showing full system analytics.',
  };

  return labels[scope] ?? 'Showing dashboard analytics for your role.';
}

function getQuickActions(user: AuthUser) {
  const actions = [];

  if (isAdmin(user) || user.role === 'Editor') {
    actions.push(
      {
        description: 'Start a new website page draft.',
        href: '/pages/new',
        icon: FilePlus2,
        title: 'Create Page',
      },
      {
        description: 'Write a new blog post draft.',
        href: '/blogs/new',
        icon: PenLine,
        title: 'Create Blog',
      },
      {
        description: 'Add images to the media library.',
        href: '/media',
        icon: ImageUp,
        title: 'Upload Media',
      },
    );
  }

  if (isAdmin(user) || user.role === 'Reviewer' || user.role === 'Publisher') {
    actions.push({
      description: 'Review submissions and publishing queues.',
      href: '/workflow',
      icon: Send,
      title: 'View Workflow',
    });
  }

  if (isAdmin(user)) {
    actions.push({
      description: 'Review leads captured by the chatbot.',
      href: '/chatbot/leads',
      icon: Users,
      title: 'View Chatbot Leads',
    });
  }

  actions.push({
    description: 'Track AI assistant usage across your workspace.',
    href: '/ai/usage',
    icon: Sparkles,
    title: 'AI Usage',
  });

  return actions;
}

function DashboardContent({ user }: { user: AuthUser }) {
  const dashboardQuery = useDashboardSummary();
  const summary = dashboardQuery.data;
  const quickActions = getQuickActions(user);

  if (dashboardQuery.isLoading) {
    return <LoadingSkeleton />;
  }

  if (dashboardQuery.isError || !summary) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <p className="font-medium">Dashboard could not be loaded.</p>
        <p className="mt-1">
          {dashboardQuery.error?.message ??
            'Please refresh or sign in with a role that can view dashboard analytics.'}
        </p>
        <Button
          className="mt-3"
          onClick={() => dashboardQuery.refetch()}
          type="button"
          variant="outline"
        >
          <Loader2
            className={[
              'h-4 w-4',
              dashboardQuery.isFetching ? 'animate-spin' : '',
            ].join(' ')}
          />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {user.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {getScopeLabel(summary.scope)}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card px-3 py-2 text-sm">
          <p className="text-muted-foreground">Role</p>
          <p className="font-medium">{user.role}</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <StatCard
          description="Active, non-archived pages"
          icon={FileText}
          label="Total Pages"
          value={summary.totalPages}
        />
        <StatCard
          icon={UploadCloud}
          label="Published Pages"
          value={summary.publishedPages}
        />
        <StatCard icon={FileText} label="Draft Pages" value={summary.draftPages} />
        <StatCard
          description="Submitted, under review, or approved"
          icon={Send}
          label="Pending Reviews"
          value={summary.pendingWorkflowItems}
        />
        <StatCard icon={Newspaper} label="Total Blogs" value={summary.totalBlogs} />
        <StatCard icon={ImageUp} label="Total Media" value={summary.totalMedia} />
        <StatCard
          icon={Sparkles}
          label="AI Requests"
          value={summary.totalAIRequests}
        />
        <StatCard
          icon={MessageCircle}
          label="Chatbot Conversations"
          value={summary.totalChatbotConversations}
        />
        <StatCard icon={Users} label="Leads Captured" value={summary.totalLeads} />
      </section>

      <DashboardSection
        description="Common next steps based on your current role."
        title="Quick Actions"
      >
        {quickActions.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => (
              <QuickActionCard
                description={action.description}
                href={action.href}
                icon={action.icon}
                key={action.title}
                title={action.title}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="No quick actions are available for this role." />
        )}
      </DashboardSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardSection
          description="Latest changes captured by audit logs."
          title="Recent Activity"
        >
          <RecentActivityList activities={summary.recentActivities} />
        </DashboardSection>

        <DashboardSection
          description="Latest captured chatbot leads."
          title="Recent Leads"
        >
          <RecentLeadsList leads={summary.recentLeads} />
        </DashboardSection>

        <DashboardSection
          description="Recently updated pages in your dashboard scope."
          title="Recent Pages"
        >
          <RecentContentList
            basePath="/pages"
            emptyMessage="No pages found for this scope."
            items={summary.recentPages}
          />
        </DashboardSection>

        <DashboardSection
          description="Recently updated blogs in your dashboard scope."
          title="Recent Blogs"
        >
          <RecentContentList
            basePath="/blogs"
            emptyMessage="No blogs found for this scope."
            items={summary.recentBlogs}
          />
        </DashboardSection>
      </div>

      {isAdmin(user) ? (
        <DashboardSection
          description="System-level counters visible to Admin and Super Admin roles."
          title="System Overview"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label="Total Users" value={summary.totalUsers} />
            <StatCard
              icon={Bot}
              label="Chatbot Conversations"
              value={summary.totalChatbotConversations}
            />
            <StatCard icon={Sparkles} label="AI Requests" value={summary.totalAIRequests} />
            <StatCard icon={Users} label="Leads" value={summary.totalLeads} />
          </div>
        </DashboardSection>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminPageShell sectionTitle="Dashboard">
      {(user) => <DashboardContent user={user} />}
    </AdminPageShell>
  );
}
