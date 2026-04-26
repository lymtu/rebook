import { Elysia, t } from 'elysia';
import { updateProfileInput } from '@rebook/shared';
import { requireAuth } from '../../lib/auth';
import { AppError } from '../../lib/errors';
import { ERROR_CODES } from '@rebook/shared';
import { userRepo } from './user.repo';
import { toUserDTO } from './user.mapper';

export const userRoutes = new Elysia({ prefix: '/users', tags: ['users'] })
  .use(requireAuth)
  .patch(
    '/me',
    async ({ body, user }) => {
      const input = updateProfileInput.parse(body);
      const patch: Parameters<typeof userRepo.update>[1] = {};
      if (input.nickname !== undefined) patch.nickname = input.nickname;
      if (input.avatarUrl !== undefined) patch.avatarUrl = input.avatarUrl;
      if (input.bio !== undefined) patch.bio = input.bio;
      const row = await userRepo.update(user.id, patch);
      if (!row) throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
      return toUserDTO(row);
    },
    { body: t.Any() },
  );
