import { Elysia, t } from 'elysia';
import { ERROR_CODES, loginInput, registerInput, wxLoginInput, type AuthResult, type UserDTO } from '@rebook/shared';
import { env } from '../../env';
import { AppError } from '../../lib/errors';
import { authPlugin, requireAuth } from '../../lib/auth';
import { authService } from './auth.service';
import { userRepo } from '../user/user.repo';
import { toUserDTO } from '../user/user.mapper';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** 显式声明 cookie，保证 AOT 路由会 parseCookie；否则部分构建下 `cookie` 可能为 undefined，访问 `cookie.token` 会 500。 */
const authSessionCookie = t.Cookie({
  token: t.Optional(t.String()),
});

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(authPlugin)
  .post(
    '/register',
    async ({ body, jwt, cookie }): Promise<AuthResult> => {
      const input = registerInput.parse(body);
      const user = await authService.register(input);
      const token = await jwt.sign({ sub: user.id, role: user.role });
      cookie.token.set({
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });
      return { token, user };
    },
    { body: t.Any(), cookie: authSessionCookie },
  )
  .post(
    '/login',
    async ({ body, jwt, cookie }): Promise<AuthResult> => {
      const input = loginInput.parse(body);
      const user = await authService.login(input);
      const token = await jwt.sign({ sub: user.id, role: user.role });
      cookie.token.set({
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });
      return { token, user };
    },
    { body: t.Any(), cookie: authSessionCookie },
  )
  .post(
    '/wx-login',
    async ({ body, jwt }): Promise<AuthResult> => {
      const input = wxLoginInput.parse(body);
      const user = await authService.wxLogin(input);
      const token = await jwt.sign({ sub: user.id, role: user.role });
      return { token, user };
    },
    { body: t.Any() },
  )
  .post(
    '/logout',
    ({ cookie }) => {
      cookie.token.remove();
      return { ok: true };
    },
    { cookie: authSessionCookie },
  )
  .use(requireAuth)
  .get(
    '/me',
    async ({ user }): Promise<UserDTO> => {
      const row = await userRepo.findById(user.id);
      if (!row) throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
      return toUserDTO(row);
    },
    { cookie: authSessionCookie },
  );
