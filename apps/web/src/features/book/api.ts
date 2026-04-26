import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BookDTO, BookListResult, CreateBookInput, UpdateBookInput } from '@rebook/shared';
import { api } from '@/lib/api';

export const bookKeys = {
  all: ['books'] as const,
  list: (q: { search?: string }) => ['books', 'list', q] as const,
  detail: (id: string) => ['books', id] as const,
  mine: (q: { search?: string; status?: string }) => ['books', 'mine', q] as const,
};

export function useBooksInfinite(search: string) {
  const q = search.trim() || undefined;
  return useInfiniteQuery({
    queryKey: bookKeys.list({ search: q }),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (pageParam) params.set('cursor', pageParam);
      params.set('limit', '12');
      return api.get<BookListResult>(`/books?${params.toString()}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useBook(id: string | undefined) {
  return useQuery({
    queryKey: bookKeys.detail(id ?? ''),
    queryFn: () => api.get<BookDTO>(`/books/${id}`),
    enabled: Boolean(id),
  });
}

export function useMyBooks(search: string, status?: string) {
  const q = search.trim() || undefined;
  return useInfiniteQuery({
    queryKey: bookKeys.mine({ search: q, status }),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      if (pageParam) params.set('cursor', pageParam);
      params.set('limit', '20');
      return api.get<BookListResult>(`/books/mine?${params.toString()}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookInput) => api.post<BookDTO>('/books', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}

export function useUpdateBook(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBookInput) => api.patch<BookDTO>(`/books/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: bookKeys.all });
      void qc.invalidateQueries({ queryKey: bookKeys.detail(id) });
    },
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<BookDTO>(`/books/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}
