import type { FeeProposalStatus } from '../constants/fee';

export interface FeeProposalDTO {
  id: string;
  rateBps: number;
  status: FeeProposalStatus;
  proposedByUserId: string;
  reviewedByUserId: string | null;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface EffectiveFeeDTO {
  rateBps: number;
  sourceProposalId: string | null;
}

export type { ProposeFeeInput, ReviewFeeInput } from '../schemas/fee';
