'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { SkipLink } from '@/components/ui/skip-link';
import type { ModuleComponentProps } from '@/types/template';

interface NavLink {
  label: string;
  href: string;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Documents', href: '/documents' },
  { label: 'FAQs', href: '/faqs' },
];

export function NavigationModule({ config, moduleKey }: ModuleComponentProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI CMS';

  const links: NavLink[] = Array.isArray(config?.links)
    ? (config.links as NavLink[])
    : DEFAULT_LINKS;

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <SkipLink />
      <nav
        aria-label="Main navigation"
        data-module={moduleKey}
        data-module-type="NAVIGATION"
        className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Site name / logo */}
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
            >
              {siteName}
            </Link>

            {/* Desktop navigation */}
            <ul className="hidden md:flex md:items-center md:gap-1" role="list">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={`
                      relative inline-block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                      ${
                        isActive(link.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                      }
                    `}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile menu toggle button */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/70 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation menu */}
        <div
          id="mobile-navigation-menu"
          className={`border-t border-border bg-background md:hidden transition-all duration-200 ${
            mobileMenuOpen ? 'block animate-fade-in' : 'hidden'
          }`}
          role="region"
          aria-label="Mobile navigation"
        >
          <ul className="space-y-1 px-4 pb-4 pt-2" role="list">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block rounded-lg px-3 py-2.5 text-base font-medium transition-all duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    ${
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                    }
                  `}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
