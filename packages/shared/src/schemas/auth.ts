import { z } from 'zod';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, USERNAME_REGEX } from '../constants/user';

export const loginInput = z.object({
  username: z.string().regex(USERNAME_REGEX, 'Invalid username'),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});
export type LoginInput = z.infer<typeof loginInput>;

export const registerInput = z.object({
  username: z.string().regex(USERNAME_REGEX),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
  /** 表单常提交空串；空串视为未填昵称 */
  nickname: z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return undefined;
      if (typeof v === 'string') {
        const t = v.trim();
        return t === '' ? undefined : t;
      }
      return v;
    },
    z.string().min(1).max(32).optional(),
  ),
});
export type RegisterInput = z.infer<typeof registerInput>;

export const wxLoginInput = z.object({
  code: z.string().min(1),
  nickname: z.string().max(32).optional(),
  avatarUrl: z.string().url().optional(),
});
export type WxLoginInput = z.infer<typeof wxLoginInput>;
