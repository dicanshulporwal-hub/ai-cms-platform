export interface RecentActivity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userName?: string | null;
  createdAt: string;
}

export interface RecentContent {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

export interface RecentLead {
  id: string;
  name?: string | null;
  email?: string | null;
  sourcePage?: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  submittedPages: number;
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  submittedBlogs: number;
  totalMedia: number;
  totalUsers: number;
  pendingWorkflowItems: number;
  totalAIRequests: number;
  totalChatbotConversations: number;
  totalLeads: number;
  recentActivities: RecentActivity[];
  recentPages: RecentContent[];
  recentBlogs: RecentContent[];
  recentLeads: RecentLead[];
  scope: string;
}
