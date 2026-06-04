import Link from 'next/link';
import { SkipLink } from '@/components/ui/skip-link';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { fetchRenderData, fetchMenuByLocation } from '@/lib/api-client';

interface FallbackLayoutProps {
  children: React.ReactNode;
}

const DEFAULT_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Documents', href: '/documents' },
  { label: 'FAQs', href: '/faqs' },
];

export async function FallbackLayout({ children }: FallbackLayoutProps) {
  const [renderData, headerMenu] = await Promise.all([
    fetchRenderData(),
    fetchMenuByLocation('HEADER'),
  ]);
  const siteName = renderData?.settings?.siteName || process.env.NEXT_PUBLIC_SITE_NAME || 'AI CMS';

  const navLinks = headerMenu?.items?.length
    ? headerMenu.items.map((item) => ({ label: item.label, href: item.url }))
    : DEFAULT_LINKS;

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <AccessibilityToolbar />
      <header
        data-region="header"
        className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity">
            {siteName}
          </Link>
          <nav data-region="navigation" aria-label="Main navigation">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" data-region="main" className="flex-1">
        {children}
      </main>

      <footer
        data-region="footer"
        className="border-t border-border bg-muted/50"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
