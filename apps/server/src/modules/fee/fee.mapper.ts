import type { FeeProposalDTO } from '@rebook/shared';
import type { FeeProposalRow } from '../../db/schema/fee-proposals';

export function toFeeProposalDTO(row: FeeProposalRow): FeeProposalDTO {
  return {
    id: row.id,
    rateBps: row.rateBps,
    status: row.status,
    proposedByUserId: row.proposedByUserId,
    reviewedByUserId: row.reviewedByUserId,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
  };
}
