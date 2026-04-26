import { hash, verify } from '@node-rs/bcrypt';
import {
  ERROR_CODES,
  type LoginInput,
  type RegisterInput,
  type WxLoginInput,
  type UserDTO,
} from '@rebook/shared';
import { AppError } from '../../lib/errors';
import { userRepo } from '../user/user.repo';
import { toUserDTO } from '../user/user.mapper';
import { exchangeWxCode } from './wx';

export const authService = {
  async register(input: RegisterInput): Promise<UserDTO> {
    const existing = await userRepo.findByUsername(input.username);
    if (existing) throw new AppError(ERROR_CODES.CONFLICT, 409, 'Username taken');
    const passwordHash = await hash(input.password, 10);
    const row = await userRepo.insert({
      username: input.username,
      passwordHash,
      nickname: input.nickname ?? input.username,
    });
    return toUserDTO(row);
  },

  async login(input: LoginInput): Promise<UserDTO> {
    const row = await userRepo.findByUsername(input.username);
    if (!row || !row.passwordHash) throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
    const ok = await verify(input.password, row.passwordHash);
    if (!ok) throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
    if (row.status === 'banned') throw new AppError(ERROR_CODES.BANNED, 403, 'Account suspended');
    return toUserDTO(row);
  },

  async wxLogin(input: WxLoginInput): Promise<UserDTO> {
    const session = await exchangeWxCode(input.code);

    const existing = session.unionid
      ? (await userRepo.findByWxUnionId(session.unionid)) ??
        (await userRepo.findByWxOpenId(session.openid))
      : await userRepo.findByWxOpenId(session.openid);

    if (existing) {
      if (existing.status === 'banned') throw new AppError(ERROR_CODES.BANNED, 403, 'Account suspended');
      const patch: Record<string, string | null> = {};
      if (session.unionid && existing.wxUnionId !== session.unionid) {
        patch.wxUnionId = session.unionid;
      }
      if (input.nickname && existing.nickname !== input.nickname) patch.nickname = input.nickname;
      if (input.avatarUrl && existing.avatarUrl !== input.avatarUrl) {
        patch.avatarUrl = input.avatarUrl;
      }
      const updated = Object.keys(patch).length
        ? await userRepo.update(existing.id, patch)
        : existing;
      return toUserDTO(updated ?? existing);
    }

    const row = await userRepo.insert({
      nickname: input.nickname ?? '微信用户',
      avatarUrl: input.avatarUrl ?? null,
      wxOpenId: session.openid,
      wxUnionId: session.unionid ?? null,
    });
    return toUserDTO(row);
  },
};
