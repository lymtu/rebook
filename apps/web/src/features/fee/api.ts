import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EffectiveFeeDTO, FeeProposalDTO, ProposeFeeInput, ReviewFeeInput } from '@rebook/shared';
import { api } from '@/lib/api';

export const feeKeys = {
  effective: ['fee', 'effective'] as const,
  proposals: ['fee', 'proposals'] as const,
};

export function useEffectiveFee() {
  return useQuery({
    queryKey: feeKeys.effective,
    queryFn: () => api.get<EffectiveFeeDTO>('/fee/effective'),
    staleTime: 60_000,
  });
}

export function useFeeProposals() {
  return useQuery({
    queryKey: feeKeys.proposals,
    queryFn: () => api.get<FeeProposalDTO[]>('/fee/proposals'),
  });
}

export function useProposeFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProposeFeeInput) => api.post<FeeProposalDTO>('/fee/proposals', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: feeKeys.proposals });
      void qc.invalidateQueries({ queryKey: feeKeys.effective });
    },
  });
}

export function useReviewFeeProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewFeeInput }) =>
      api.post<FeeProposalDTO>(`/fee/proposals/${encodeURIComponent(id)}/review`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: feeKeys.proposals });
      void qc.invalidateQueries({ queryKey: feeKeys.effective });
    },
  });
}

