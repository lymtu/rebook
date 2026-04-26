import { z } from 'zod';

export const proposeFeeInput = z.object({
  rateBps: z.number().int().min(0).max(50_00),
});
export type ProposeFeeInput = z.infer<typeof proposeFeeInput>;

export const reviewFeeInput = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().max(500).optional(),
});
export type ReviewFeeInput = z.infer<typeof reviewFeeInput>;
