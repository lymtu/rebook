export const FEE_PROPOSAL_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type FeeProposalStatus = (typeof FEE_PROPOSAL_STATUSES)[number];
