import { useMutation, useQuery } from '@tanstack/react-query';
import {
  generateAltText,
  generateContent,
  generateFaq,
  generateSeo,
  improveSeo,
  listAiUsage,
  rewriteContent,
  summarizeContent,
} from '@/lib/ai-api';

export function useGenerateContent() {
  return useMutation({ mutationFn: generateContent });
}

export function useRewriteContent() {
  return useMutation({ mutationFn: rewriteContent });
}

export function useSummarizeContent() {
  return useMutation({ mutationFn: summarizeContent });
}

export function useGenerateFaq() {
  return useMutation({ mutationFn: generateFaq });
}

export function useGenerateSeo() {
  return useMutation({ mutationFn: generateSeo });
}

export function useImproveSeo() {
  return useMutation({ mutationFn: improveSeo });
}

export function useGenerateAltText() {
  return useMutation({ mutationFn: generateAltText });
}

export function useAiUsage(action?: string) {
  return useQuery({
    queryFn: () => listAiUsage(action),
    queryKey: ['ai-usage', action ?? 'all'],
  });
}
