import { ERROR_CODES, type ProposeFeeInput, type ReviewFeeInput } from '@rebook/shared';
import { AppError } from '../../lib/errors';
import type { AuthContext } from '../../lib/auth';
import { feeRepo } from './fee.repo';
import { toFeeProposalDTO } from './fee.mapper';

const DEFAULT_BPS = 500;

export const feeService = {
  async effectiveRate(): Promise<{ rateBps: number; sourceProposalId: string | null }> {
    const row = await feeRepo.latestApproved();
    if (!row) return { rateBps: DEFAULT_BPS, sourceProposalId: null };
    return { rateBps: row.rateBps, sourceProposalId: row.id };
  },

  async listHistory() {
    const rows = await feeRepo.listRecent(80);
    return rows.map(toFeeProposalDTO);
  },

  async propose(actor: AuthContext, input: ProposeFeeInput) {
    if (actor.role !== 'admin' && actor.role !== 'super_admin') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    }
    const row = await feeRepo.insert({
      rateBps: input.rateBps,
      status: 'pending',
      proposedByUserId: actor.id,
    });
    return toFeeProposalDTO(row);
  },

  async review(actor: AuthContext, proposalId: string, input: ReviewFeeInput) {
    if (actor.role !== 'super_admin') throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    const proposal = await feeRepo.findById(proposalId);
    if (!proposal) throw new AppError(ERROR_CODES.FEE_PROPOSAL_NOT_FOUND, 404);
    if (proposal.status !== 'pending') {
      throw new AppError(ERROR_CODES.INVALID_INPUT, 400, 'Proposal is not pending');
    }
    const now = new Date();
    if (input.action === 'approve') {
      const row = await feeRepo.update(proposalId, {
        status: 'approved',
        reviewedByUserId: actor.id,
        reviewNote: input.note ?? null,
        reviewedAt: now,
      });
      return toFeeProposalDTO(row!);
    }
    const row = await feeRepo.update(proposalId, {
      status: 'rejected',
      reviewedByUserId: actor.id,
      reviewNote: input.note ?? null,
      reviewedAt: now,
    });
    return toFeeProposalDTO(row!);
  },
};
