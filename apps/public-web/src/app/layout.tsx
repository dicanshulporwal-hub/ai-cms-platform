import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { TemplateRenderer } from '@/components/template/template-renderer';
import { StructuredDataInjector } from '@/components/seo/structured-data-injector';
import { SkipLink } from '@/components/ui/skip-link';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Public Website',
    template: '%s',
  },
  description: 'Public website powered by AI CMS.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* @ts-expect-error Async Server Component */}
        <StructuredDataInjector />
      </head>
      <body>
        <SkipLink />
        <TemplateRenderer>{children}</TemplateRenderer>
      </body>
    </html>
  );
}
