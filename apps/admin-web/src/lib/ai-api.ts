import { apiClient } from '@/lib/api-client';
import type {
  AiResponse,
  AiUsageResponse,
  FaqResult,
  GenerateAltTextInput,
  GenerateContentInput,
  GenerateFaqInput,
  GenerateSeoInput,
  ImproveSeoInput,
  RewriteContentInput,
  SeoResult,
  SummarizeContentInput,
} from '@/types/ai';

function postAi<T>(action: string, body: unknown) {
  return apiClient<AiResponse<T>>(`/api/ai/${action}`, {
    body: JSON.stringify(body),
    method: 'POST',
  });
}

export function generateContent(input: GenerateContentInput) {
  return postAi<string>('generate-content', input);
}

export function rewriteContent(input: RewriteContentInput) {
  return postAi<string>('rewrite-content', input);
}

export function summarizeContent(input: SummarizeContentInput) {
  return postAi<string>('summarize-content', input);
}

export function generateFaq(input: GenerateFaqInput) {
  return postAi<FaqResult>('generate-faq', input);
}

export function generateSeo(input: GenerateSeoInput) {
  return postAi<SeoResult>('generate-seo', input);
}

export function improveSeo(input: ImproveSeoInput) {
  return postAi<SeoResult>('improve-seo', input);
}

export function generateAltText(input: GenerateAltTextInput) {
  return postAi<string>('generate-alt-text', input);
}

export function listAiUsage(action?: string) {
  const params = new URLSearchParams();

  if (action?.trim()) {
    params.set('action', action.trim());
  }

  const query = params.toString();

  return apiClient<AiUsageResponse>(`/api/ai/usage${query ? `?${query}` : ''}`);
}
