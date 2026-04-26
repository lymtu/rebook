import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthResult, LoginInput, RegisterInput, UserDTO } from '@rebook/shared';
import { api } from '@/lib/api';
import { useAuthStore } from './store';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useMe() {
  return useQuery<UserDTO>({
    queryKey: authKeys.me,
    queryFn: () => api.get<UserDTO>('/auth/me'),
    retry: false,
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => api.post<AuthResult>('/auth/login', input),
    onSuccess: ({ user }) => {
      setUser(user);
      qc.setQueryData(authKeys.me, user);
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => api.post<AuthResult>('/auth/register', input),
    onSuccess: ({ user }) => {
      setUser(user);
      qc.setQueryData(authKeys.me, user);
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: true }>('/auth/logout'),
    onSuccess: () => {
      clear();
      qc.removeQueries({ queryKey: authKeys.me });
    },
  });
}
