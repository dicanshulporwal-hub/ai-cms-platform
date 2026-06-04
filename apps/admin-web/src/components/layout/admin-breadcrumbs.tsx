'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  pages: 'Pages',
  blogs: 'Blogs',
  categories: 'Categories',
  tags: 'Tags',
  documents: 'Documents',
  media: 'Media',
  galleries: 'Photo Gallery',
  events: 'Events',
  forms: 'Forms',
  faqs: 'FAQs',
  announcements: 'Announcements',
  menus: 'Navigation',
  templates: 'Templates',
  workflow: 'Workflow',
  notifications: 'Notifications',
  'content-calendar': 'Content Calendar',
  ai: 'AI',
  chatbot: 'Chatbot',
  accessibility: 'Accessibility',
  seo: 'SEO',
  analytics: 'Analytics',
  modules: 'Modules',
  integrations: 'Integrations',
  'backup-manager': 'Backup',
  deployment: 'Deployment',
  'api-access': 'API Access',
  tenders: 'Tenders',
  rti: 'RTI',
  users: 'Users',
  roles: 'Roles',
  settings: 'Settings',
  'broken-links': 'Broken Links',
  new: 'New',
  edit: 'Edit',
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = SEGMENT_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {crumb.isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
