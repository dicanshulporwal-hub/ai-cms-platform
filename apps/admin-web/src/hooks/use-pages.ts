import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approvePage,
  createPage,
  deletePage,
  getPage,
  listPages,
  publishPage,
  submitPage,
  updatePage,
} from '@/lib/pages-api';
import type { PageFormInput, PageListQuery } from '@/types/page';

export function usePages(query: PageListQuery) {
  return useQuery({
    queryFn: () => listPages(query),
    queryKey: ['pages', query],
  });
}

export function usePage(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getPage(id),
    queryKey: ['pages', id],
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useUpdatePage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PageFormInput) => updatePage(id, input),
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.setQueryData(['pages', page.id], page);
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

function usePageAction(action: (id: string) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useSubmitPage() {
  return usePageAction(submitPage);
}

export function useApprovePage() {
  return usePageAction(approvePage);
}

export function usePublishPage() {
  return usePageAction(publishPage);
}
