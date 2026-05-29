'use client';

import dynamic from 'next/dynamic';
import { MessageCircle } from 'lucide-react';
import type { ModuleComponentProps } from '@/types/template';

const ChatbotWidget = dynamic(
  () =>
    import('@/components/chatbot-widget').then((mod) => ({
      default: mod.ChatbotWidget,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-lg"
        aria-label="Loading chat..."
      >
        <MessageCircle className="h-6 w-6 animate-pulse" />
      </div>
    ),
  }
);

export function ChatbotModule({ moduleKey }: ModuleComponentProps) {
  return (
    <div data-module={moduleKey} data-module-type="CHATBOT">
      <ChatbotWidget />
    </div>
  );
}
