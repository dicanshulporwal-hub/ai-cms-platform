import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ChatbotWidget } from '@/components/chatbot-widget';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI CMS Public Site',
  description: 'Public website renderer for the AI-first CMS MVP.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
