import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveBlog,
  createBlog,
  deleteBlog,
  getBlog,
  listBlogs,
  publishBlog,
  submitBlog,
  updateBlog,
} from '@/lib/blogs-api';
import type { BlogFormInput, BlogListQuery } from '@/types/blog';

export function useBlogs(query: BlogListQuery) {
  return useQuery({
    queryFn: () => listBlogs(query),
    queryKey: ['blogs', query],
  });
}

export function useBlog(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getBlog(id),
    queryKey: ['blogs', id],
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  });
}

export function useUpdateBlog(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BlogFormInput) => updateBlog(id, input),
    onSuccess: (blog) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.setQueryData(['blogs', blog.id], blog);
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  });
}

function useBlogAction(action: (id: string) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  });
}

export function useSubmitBlog() {
  return useBlogAction(submitBlog);
}

export function useApproveBlog() {
  return useBlogAction(approveBlog);
}

export function usePublishBlog() {
  return useBlogAction(publishBlog);
}
