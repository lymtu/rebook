import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DisputeDTO, ResolveDisputeInput } from '@rebook/shared';
import { api } from '@/lib/api';

export const disputeKeys = {
  open: ['disputes', 'open'] as const,
};

export function useOpenDisputes() {
  return useQuery({
    queryKey: disputeKeys.open,
    queryFn: () => api.get<DisputeDTO[]>('/disputes/open'),
  });
}

export function useResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ResolveDisputeInput }) =>
      api.post<DisputeDTO>(`/disputes/${encodeURIComponent(id)}/resolve`, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: disputeKeys.open }),
  });
}
