import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteMedia,
  getMedia,
  listMedia,
  updateMedia,
  uploadMedia,
} from '@/lib/media-api';
import type {
  MediaListQuery,
  MediaUpdateInput,
  MediaUploadInput,
} from '@/types/media';

export function useMedia(query: MediaListQuery) {
  return useQuery({
    queryFn: () => listMedia(query),
    queryKey: ['media', query],
  });
}

export function useMediaAsset(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getMedia(id),
    queryKey: ['media', id],
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MediaUploadInput) => uploadMedia(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });
}

export function useUpdateMedia(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MediaUpdateInput) => updateMedia(id, input),
    onSuccess: (media) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.setQueryData(['media', media.id], media);
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });
}
