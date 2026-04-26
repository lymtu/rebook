import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AdminSetUserStatusInput,
  BookDTO,
  BookListResult,
  PromoteUserInput,
  ReviewBookInput,
  UserDTO,
} from '@rebook/shared';
import { bookKeys } from '@/features/book/api';
import { api } from '@/lib/api';

export const adminKeys = {
  pendingBooks: ['admin', 'pending-books'] as const,
  users: ['admin', 'users'] as const,
};

export function usePendingBooks() {
  return useQuery({
    queryKey: adminKeys.pendingBooks,
    queryFn: () => api.get<BookListResult>('/admin/books?limit=50'),
  });
}

export function useReviewBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewBookInput }) =>
      api.post<BookDTO>(`/admin/books/${encodeURIComponent(id)}/review`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.pendingBooks });
      void qc.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: () => api.get<{ items: UserDTO[] }>('/admin/users?limit=120'),
  });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminSetUserStatusInput }) =>
      api.patch<UserDTO>(`/admin/users/${encodeURIComponent(id)}`, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.users }),
  });
}

export function usePromoteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PromoteUserInput) => api.post<UserDTO>('/admin/promote', input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.users }),
  });
}
