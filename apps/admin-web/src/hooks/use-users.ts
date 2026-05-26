import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createUser,
  deleteUser,
  fetchUser,
  fetchUsers,
  updateUser,
  updateUserStatus,
  type CreateUserInput,
  type UpdateUserInput,
  type UsersQueryParams,
} from '@/lib/users-api';

export const usersQueryKey = ['users'] as const;

export function useUsers(params: UsersQueryParams = {}) {
  return useQuery({
    queryFn: () => fetchUsers(params),
    queryKey: [...usersQueryKey, params],
  });
}

export function useUser(id: string) {
  return useQuery({
    enabled: !!id,
    queryFn: () => fetchUser(id),
    queryKey: [...usersQueryKey, id],
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, id }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}
