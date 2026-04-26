import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListOrdersQuery, OpenDisputeInput, OrderDTO, PatchOrderInput } from '@rebook/shared';
import { bookKeys } from '@/features/book/api';
import { cartKeys } from '@/features/cart/api';
import { api } from '@/lib/api';

export const orderKeys = {
  all: ['orders'] as const,
  list: (q: Partial<ListOrdersQuery>) => ['orders', 'list', q] as const,
  detail: (id: string) => ['orders', id] as const,
};

export interface OrderListResponse {
  items: OrderDTO[];
  nextCursor: string | null;
}

export function useOrders(query: Partial<ListOrdersQuery>) {
  return useQuery({
    queryKey: orderKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.as) params.set('as', query.as);
      if (query.status) params.set('status', query.status);
      if (query.cursor) params.set('cursor', query.cursor);
      params.set('limit', String(query.limit ?? 20));
      return api.get<OrderListResponse>(`/orders?${params.toString()}`);
    },
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: () => api.get<OrderDTO>(`/orders/${id}`),
    enabled: Boolean(id),
  });
}

export function usePatchOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PatchOrderInput) => api.patch<OrderDTO>(`/orders/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.all });
      void qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
    },
  });
}

export function useCancelOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<OrderDTO>(`/orders/${id}/cancel`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.all });
      void qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
      void qc.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}

export interface PaymentPrepareResult {
  channel: 'mock';
  orderId: string;
  mockConfirmToken: string;
}

export function usePreparePayment() {
  return useMutation({
    mutationFn: (orderId: string) =>
      api.post<PaymentPrepareResult>(`/payments/orders/${encodeURIComponent(orderId)}/prepare`),
  });
}

export function useMockConfirmPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { orderId: string; token: string }) =>
      api.post<{ order: OrderDTO; alreadyPaid?: boolean }>('/payments/mock/confirm', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.all });
      void qc.invalidateQueries({ queryKey: bookKeys.all });
      void qc.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useOpenDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OpenDisputeInput) => api.post('/disputes', input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
