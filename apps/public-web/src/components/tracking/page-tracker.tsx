'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

interface PageTrackerProps {
  title?: string;
  sourceId?: string;
}

/**
 * Client component that fires a page view event on mount.
 * Non-blocking — fails silently if analytics is unavailable.
 */
export function PageTracker({ title, sourceId }: PageTrackerProps) {
  useEffect(() => {
    trackPageView(title, sourceId);
  }, [title, sourceId]);

  return null; // Renders nothing
}
