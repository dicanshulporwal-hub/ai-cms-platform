import { SkipLink } from '@/components/ui/skip-link';

interface FallbackLayoutProps {
  children: React.ReactNode;
}

export function FallbackLayout({ children }: FallbackLayoutProps) {
  return (
    <>
      <SkipLink />
      <header data-region="header">
        <h1>{process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI CMS'}</h1>
      </header>
      <nav data-region="navigation" aria-label="Main navigation">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/documents">Documents</a></li>
          <li><a href="/faqs">FAQs</a></li>
        </ul>
      </nav>
      <main id="main-content" data-region="main">
        {children}
      </main>
      <footer data-region="footer">
        <p>&copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI CMS'}</p>
      </footer>
    </>
  );
}
