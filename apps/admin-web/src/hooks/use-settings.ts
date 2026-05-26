import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchSettings,
  updateSettings,
  type UpdateSettingsInput,
} from '@/lib/settings-api';

export const settingsQueryKey = ['settings'] as const;

export function useSettings() {
  return useQuery({
    queryFn: fetchSettings,
    queryKey: settingsQueryKey,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsInput) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKey });
    },
  });
}
