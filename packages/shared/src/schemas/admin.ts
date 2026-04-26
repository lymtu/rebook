import { z } from 'zod';
import { USER_STATUSES } from '../constants/user';

export const adminSetUserStatusInput = z.object({
  status: z.enum(USER_STATUSES),
});
export type AdminSetUserStatusInput = z.infer<typeof adminSetUserStatusInput>;

export const promoteUserInput = z.object({
  userId: z.string().min(1),
  role: z.enum(['admin', 'user']),
});
export type PromoteUserInput = z.infer<typeof promoteUserInput>;
