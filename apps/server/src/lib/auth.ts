import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { ERROR_CODES, type UserRole } from '@rebook/shared';
import { env } from '../env';
import { AppError } from './errors';
import { userRepo } from '../modules/user/user.repo';

export interface AuthContext {
  id: string;
  role: UserRole;
}

export const authPlugin = new Elysia({ name: 'auth' }).use(
  jwt({
    name: 'jwt',
    secret: env.JWT_SECRET,
    exp: env.JWT_EXPIRES_IN,
  }),
);

export const requireAuth = new Elysia({ name: 'requireAuth' })
  .use(authPlugin)
  .derive({ as: 'scoped' }, async ({ jwt, cookie, headers }) => {
    const bearer = headers.authorization?.replace(/^Bearer\s+/i, '');
    const raw = cookie.token?.value ?? bearer;
    if (typeof raw !== 'string' || raw.length === 0) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
    }
    const token: string = raw;

    const payload = (await jwt.verify(token)) as { sub?: string; role?: UserRole } | false;
    if (!payload || typeof payload === 'boolean' || !payload.sub) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
    }

    const user = await userRepo.findById(payload.sub);
    if (!user) throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
    if (user.status === 'banned') throw new AppError(ERROR_CODES.BANNED, 403, 'Account suspended');

    return { user: { id: user.id, role: user.role } satisfies AuthContext };
  });

export function ensureRole(user: AuthContext, allowed: UserRole[]) {
  if (!allowed.includes(user.role)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 403);
  }
}
