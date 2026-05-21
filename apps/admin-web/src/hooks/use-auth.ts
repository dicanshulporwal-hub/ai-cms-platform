import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCurrentUser, login, logout } from '@/lib/client-auth-api';

export const currentUserQueryKey = ['current-user'] as const;

export function useCurrentUser() {
  return useQuery({
    queryFn: fetchCurrentUser,
    queryKey: currentUserQueryKey,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      queryClient.setQueryData(currentUserQueryKey, response.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: currentUserQueryKey });
    },
  });
}
