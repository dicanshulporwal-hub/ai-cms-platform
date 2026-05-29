import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { TemplateRenderer } from '@/components/template/template-renderer';
import { SkipLink } from '@/components/ui/skip-link';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI CMS Public Site',
  description: 'Public website renderer for the AI-first CMS MVP.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <TemplateRenderer>{children}</TemplateRenderer>
      </body>
    </html>
  );
}
