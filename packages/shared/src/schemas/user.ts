import { z } from 'zod';
import { USER_ROLES, USER_STATUSES } from '../constants/user';

export const userRoleSchema = z.enum(USER_ROLES);
export const userStatusSchema = z.enum(USER_STATUSES);

export const updateProfileInput = z.object({
  nickname: z.string().min(1).max(32).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(280).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileInput>;
