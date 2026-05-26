import type { FaqResult, SeoResult } from '@/types/ai';

export function canUseAiTools(role: string) {
  return ['Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher'].includes(
    role,
  );
}

export function resultToText(result: unknown) {
  if (typeof result === 'string') {
    return result;
  }

  return JSON.stringify(result, null, 2);
}

export function faqsToHtml(result: FaqResult) {
  const faqs = result.faqs ?? [];

  if (!faqs.length) {
    return '';
  }

  return [
    '<section>',
    '<h2>Frequently asked questions</h2>',
    ...faqs.map(
      (faq) =>
        `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`,
    ),
    '</section>',
  ].join('');
}

export function readSeoResult(result?: SeoResult) {
  return {
    keywordSuggestions: result?.keywordSuggestions ?? result?.keywords ?? [],
    metaDescription: result?.metaDescription ?? '',
    metaTitle: result?.metaTitle ?? '',
    recommendations: result?.recommendations ?? [],
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
