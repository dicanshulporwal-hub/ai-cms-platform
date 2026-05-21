'use client';

import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface SafeHtmlProps {
  html: string;
}

export function SafeHtml({ html }: SafeHtmlProps) {
  const sanitizedHtml = useMemo(() => DOMPurify.sanitize(html), [html]);

  return (
    <div
      className="cms-rendered-html"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
