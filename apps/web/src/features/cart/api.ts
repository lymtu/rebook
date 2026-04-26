import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddCartItemInput, CartLineDTO } from '@rebook/shared';
import { bookKeys } from '@/features/book/api';
import { api } from '@/lib/api';

export const cartKeys = {
  all: ['cart'] as const,
};

export interface CheckoutResult {
  orderIds: string[];
  feeRateSourceProposalId: string | null;
}

export function useCart(enabled = true) {
  return useQuery({
    queryKey: cartKeys.all,
    queryFn: () => api.get<CartLineDTO[]>('/cart'),
    enabled,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddCartItemInput) => api.post<CartLineDTO>('/cart/items', input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: cartKeys.all }),
  });
}

export function useRemoveCartLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => api.del(`/cart/items/${encodeURIComponent(bookId)}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: cartKeys.all }),
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<CheckoutResult>('/cart/checkout'),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: cartKeys.all });
      void qc.invalidateQueries({ queryKey: ['orders'] });
      void qc.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}
