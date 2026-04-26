import { z } from 'zod';

export const openDisputeInput = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(1).max(4000),
  evidenceKeys: z.array(z.string()).max(12).optional(),
});
export type OpenDisputeInput = z.infer<typeof openDisputeInput>;

export const resolveDisputeInput = z.object({
  resolution: z.string().min(1).max(4000),
});
export type ResolveDisputeInput = z.infer<typeof resolveDisputeInput>;
