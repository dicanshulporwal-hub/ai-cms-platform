import {
  Archive,
  BarChart3,
  Bell,
  Box,
  ClipboardCheck,
  FileText,
  FolderTree,
  Globe,
  Images,
  Layout,
  LayoutDashboard,
  Link2,
  MessageCircle,
  Newspaper,
  Settings,
  Shield,
  Sparkles,
  Tags,
  Users,
  Webhook,
} from 'lucide-react';

export interface MenuItem {
  href: string;
  label: string;
  icon?: any;
  exact?: boolean;
  adminOnly?: boolean;
  children?: { href: string; label: string }[];
}

export interface MenuGroup {
  key: string;
  label: string;
  icon: any;
  defaultCollapsed?: boolean;
  adminOnly?: boolean;
  items: MenuItem[];
}

export const adminMenuGroups: MenuGroup[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    key: 'content',
    label: 'Content',
    icon: FileText,
    items: [
      { href: '/pages', label: 'Pages', icon: FileText },
      { href: '/blogs', label: 'Blogs', icon: Newspaper },
      { href: '/categories', label: 'Categories', icon: FolderTree },
      { href: '/tags', label: 'Tags', icon: Tags },
      { href: '/documents', label: 'Documents', icon: FileText },
      { href: '/media', label: 'Media', icon: Images },
      { href: '/forms', label: 'Forms', icon: FileText },
      { href: '/faqs', label: 'FAQs', icon: FileText },
      {
        href: '/announcements', label: 'Announcements', icon: FileText,
        children: [
          { href: '/announcements', label: 'All' },
          { href: '/announcements/categories', label: 'Categories' },
        ],
      },
      {
        href: '/menus', label: 'Navigation', icon: Layout,
        children: [
          { href: '/menus', label: 'All Menus' },
          { href: '/menus/new', label: 'Create Menu' },
        ],
      },
    ],
  },
  {
    key: 'website',
    label: 'Website Builder',
    icon: Layout,
    adminOnly: true,
    items: [
      {
        href: '/templates', label: 'Templates', icon: Layout, adminOnly: true,
        children: [
          { href: '/templates/onboarding', label: 'Select Template' },
          { href: '/templates/import-html', label: 'HTML Importer' },
          { href: '/templates/modules', label: 'Modules' },
          { href: '/templates/upload', label: 'Upload' },
          { href: '/templates/ai-generate', label: 'AI Generate' },
        ],
      },
    ],
  },
  {
    key: 'workflow',
    label: 'Workflow',
    icon: ClipboardCheck,
    items: [
      { href: '/workflow', label: 'Workflow', icon: ClipboardCheck },
      { href: '/notifications', label: 'Notifications', icon: Bell },
      {
        href: '/content-calendar', label: 'Content Calendar', icon: ClipboardCheck,
        children: [
          { href: '/content-calendar', label: 'Calendar' },
          { href: '/content-calendar/scheduled', label: 'Scheduled' },
          { href: '/content-calendar/queue', label: 'Queue' },
        ],
      },
    ],
  },
  {
    key: 'ai',
    label: 'AI',
    icon: Sparkles,
    adminOnly: true,
    items: [
      { href: '/ai/usage', label: 'AI Usage', icon: Sparkles },
      { href: '/ai/providers', label: 'AI Providers', icon: Sparkles, adminOnly: true },
      { href: '/ai/prompts', label: 'AI Prompts', icon: Sparkles, adminOnly: true },
    ],
  },
  {
    key: 'chatbot',
    label: 'Search & Chatbot',
    icon: MessageCircle,
    items: [
      { href: '/chatbot', label: 'Chatbot', icon: MessageCircle, exact: true },
      { href: '/chatbot/leads', label: 'Leads', icon: Users },
    ],
  },
  {
    key: 'accessibility',
    label: 'Accessibility',
    icon: Shield,
    adminOnly: true,
    defaultCollapsed: true,
    items: [
      { href: '/accessibility', label: 'Accessibility', icon: Shield, adminOnly: true },
    ],
  },
  {
    key: 'seo',
    label: 'SEO & Quality',
    icon: Globe,
    adminOnly: true,
    defaultCollapsed: true,
    items: [
      { href: '/seo/sitemap', label: 'Sitemap', icon: Globe, adminOnly: true },
      { href: '/seo/robots', label: 'Robots.txt', icon: Globe, adminOnly: true },
      { href: '/seo/schema', label: 'Structured Data', icon: Globe, adminOnly: true },
      { href: '/broken-links', label: 'Broken Links', icon: Link2, adminOnly: true },
      {
        href: '/seo/redirects', label: 'Redirects', icon: Link2, adminOnly: true,
        children: [
          { href: '/seo/redirects', label: 'Redirect Rules' },
          { href: '/seo/redirects/404', label: '404 Logs' },
        ],
      },
    ],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    adminOnly: true,
    defaultCollapsed: true,
    items: [
      { href: '/analytics', label: 'Overview', icon: BarChart3, adminOnly: true },
      { href: '/analytics/content', label: 'Content', adminOnly: true },
      { href: '/analytics/search', label: 'Search', adminOnly: true },
      { href: '/analytics/chatbot', label: 'Chatbot', adminOnly: true },
      { href: '/analytics/ai', label: 'AI Usage', adminOnly: true },
    ],
  },
  {
    key: 'operations',
    label: 'Operations',
    icon: Box,
    adminOnly: true,
    defaultCollapsed: true,
    items: [
      { href: '/modules', label: 'Modules', icon: Box, adminOnly: true },
      { href: '/integrations', label: 'Integrations', icon: Webhook, adminOnly: true },
      { href: '/backup-manager', label: 'Backup & Restore', icon: Archive, adminOnly: true },
      {
        href: '/deployment', label: 'Deployment', icon: Box, adminOnly: true,
        children: [
          { href: '/deployment', label: 'Overview' },
          { href: '/deployment/environments', label: 'Environments' },
          { href: '/deployment/checklist', label: 'Checklist' },
          { href: '/deployment/logs', label: 'Logs' },
        ],
      },
      {
        href: '/api-access', label: 'API Access', icon: Box, adminOnly: true,
        children: [
          { href: '/api-access', label: 'Overview' },
          { href: '/api-access/clients', label: 'API Clients' },
          { href: '/api-access/logs', label: 'API Logs' },
        ],
      },
    ],
  },
  {
    key: 'government',
    label: 'Government Modules',
    icon: FileText,
    adminOnly: true,
    defaultCollapsed: true,
    items: [
      {
        href: '/tenders', label: 'Tenders', icon: FileText, adminOnly: true,
        children: [
          { href: '/tenders', label: 'All Tenders' },
          { href: '/tenders/categories', label: 'Categories' },
        ],
      },
    ],
  },
  {
    key: 'system',
    label: 'System',
    icon: Settings,
    adminOnly: true,
    defaultCollapsed: true,
    items: [
      { href: '/users', label: 'Users', icon: Users, adminOnly: true },
      { href: '/roles', label: 'Roles & Permissions', icon: Shield, adminOnly: true },
      { href: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
    ],
  },
];
