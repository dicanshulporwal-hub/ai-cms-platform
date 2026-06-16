'use client';

import { useState, type FormEvent } from 'react';
import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicButton } from '@/design-system/components/PublicButton';
import { PublicAlert } from '@/design-system/components/PublicAlert';
import type { ModuleComponentProps } from '@/types/template';

/** NewsletterSubscribeModule — email subscription form. */
export function NewsletterSubscribeModule({ config, moduleKey }: ModuleComponentProps) {
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Stay Updated';
  const displayMode = (config?.displayMode as string) || 'compact';
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    // Stub — integrate with your newsletter API endpoint
    await new Promise((r) => setTimeout(r, 800));
    setStatus('success');
    setEmail('');
  }

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      backgroundVariant="surface"
      spacingVariant="sm"
      id={`module-${moduleKey}`}
    >
      <div
        data-module={moduleKey}
        data-module-type="NEWSLETTER_SUBSCRIBE"
        className={displayMode === 'compact' ? 'max-w-md' : 'max-w-lg'}
      >
        {status === 'success' ? (
          <PublicAlert variant="success" title="Subscribed!">
            Thank you for subscribing. You will receive updates to your inbox.
          </PublicAlert>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2" noValidate>
            <label htmlFor={`newsletter-email-${moduleKey}`} className="sr-only">
              Email address
            </label>
            <input
              id={`newsletter-email-${moduleKey}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              autoComplete="email"
              className="min-w-0 flex-1 rounded-l-[var(--public-radius)] border border-[var(--public-border)] bg-[var(--public-background)] px-3 py-2 text-sm text-[var(--public-text)] placeholder:text-[var(--public-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--public-accent)]"
            />
            <PublicButton
              type="submit"
              variant="primary"
              size="md"
              loading={status === 'loading'}
              className="rounded-l-none"
            >
              Subscribe
            </PublicButton>
          </form>
        )}
        {status === 'error' && (
          <p className="mt-2 text-xs text-[var(--public-error)]">
            Something went wrong. Please try again.
          </p>
        )}
        <p className="mt-2 text-xs text-[var(--public-text-muted)]">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </PublicSection>
  );
}
