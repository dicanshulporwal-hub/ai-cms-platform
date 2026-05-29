'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import {
  getPublicChatbotSettings,
  sendChatbotMessage,
  submitChatbotLead,
} from '@/lib/chatbot-api';
import type { PublicChatbotSettings } from '@/types/chatbot';

interface UiMessage {
  id: string;
  sender: 'bot' | 'visitor';
  text: string;
}

export function ChatbotWidget() {
  const [settings, setSettings] = useState<PublicChatbotSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [leadSuggested, setLeadSuggested] = useState(false);
  const [leadForm, setLeadForm] = useState({
    email: '',
    message: '',
    name: '',
    phone: '',
  });
  const [leadMessage, setLeadMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void getPublicChatbotSettings()
      .then((nextSettings) => {
        setSettings(nextSettings);

        if (nextSettings.isEnabled) {
          setMessages([
            {
              id: 'greeting',
              sender: 'bot',
              text: nextSettings.greetingMessage,
            },
          ]);
        }
      })
      .catch(() => {
        setSettings({
          fallbackMessage: 'Chat is unavailable right now.',
          greetingMessage: 'Hi! How can I help you today?',
          isEnabled: false,
          leadCaptureEnabled: false,
        });
      });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!settings?.isEnabled) {
    return null;
  }

  const activeSettings = settings;

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = input.trim();

    if (!question) {
      return;
    }

    setInput('');
    setErrorMessage(null);
    setIsSending(true);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), sender: 'visitor', text: question },
    ]);

    try {
      const response = await sendChatbotMessage({
        conversationId,
        message: question,
        sourcePage: window.location.href,
      });

      setConversationId(response.conversationId);
      setLeadSuggested(response.leadCaptureSuggested);
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), sender: 'bot', text: response.answer },
      ]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : activeSettings.fallbackMessage,
      );
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          sender: 'bot',
          text: activeSettings.fallbackMessage,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadMessage(null);
    setErrorMessage(null);

    try {
      await submitChatbotLead({
        conversationId,
        email: leadForm.email,
        message: leadForm.message || undefined,
        name: leadForm.name,
        phone: leadForm.phone || undefined,
        sourcePage: window.location.href,
      });
      setLeadMessage('Thanks. We received your details.');
      setLeadSuggested(false);
      setLeadForm({ email: '', message: '', name: '', phone: '' });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Lead capture failed.');
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {isOpen ? (
        <section className="fixed bottom-24 right-4 z-50 flex h-[min(620px,calc(100vh-120px))] w-[calc(100vw-32px)] max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:right-5 animate-fade-in">
          {/* Header */}
          <header className="flex items-center gap-3 border-b border-border bg-muted/50 px-5 py-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Site Assistant</h2>
              <p className="text-xs text-muted-foreground">Answers from published content</p>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                className={[
                  'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                  message.sender === 'visitor'
                    ? 'ml-auto bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm',
                ].join(' ')}
                key={message.id}
              >
                {message.text}
              </div>
            ))}
            {isSending ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            ) : null}
            {errorMessage ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}
            {leadMessage ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
                {leadMessage}
              </p>
            ) : null}
            <div ref={scrollRef} />
          </div>

          {/* Lead capture form */}
          {leadSuggested && activeSettings.leadCaptureEnabled ? (
            <form className="space-y-2.5 border-t border-border bg-muted/30 p-4" onSubmit={submitLead}>
              <p className="text-sm font-medium text-foreground">Want us to follow up?</p>
              <input
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                onChange={(event) =>
                  setLeadForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Name"
                required
                value={leadForm.name}
              />
              <input
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                onChange={(event) =>
                  setLeadForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="Email"
                required
                type="email"
                value={leadForm.email}
              />
              <input
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                onChange={(event) =>
                  setLeadForm((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="Phone (optional)"
                value={leadForm.phone}
              />
              <textarea
                className="min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y"
                onChange={(event) =>
                  setLeadForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                placeholder="Message (optional)"
                value={leadForm.message}
              />
              <button
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
                type="submit"
              >
                Submit details
              </button>
            </form>
          ) : null}

          {/* Message input */}
          <form className="flex gap-2 border-t border-border p-4" onSubmit={sendMessage}>
            <input
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
              disabled={isSending}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question..."
              value={input}
            />
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSending}
              type="submit"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
