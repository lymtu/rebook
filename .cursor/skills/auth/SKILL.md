---
name: auth
description: Implements or modifies authentication and authorization across `apps/server`, `apps/web`, and `apps/miniapp`. Use when working on login, registration, JWT issuing/validation, refresh tokens, session middleware, `wx.login`, route guards, role checks, or anything that decides who a request belongs to.
---

# auth

Two login channels share one user table:

- **Username + password** (web primary, mini-program fallback) — bcrypt hash, JWT issued.
- **WeChat `wx.login`** (mini-program primary) — exchange `code` → openid/unionid → upsert user → JWT issued.

The same JWT works on both clients. Storage differs: web uses an httpOnly Cookie, the mini-program stores the token in `Taro.setStorageSync` and sends `Authorization: Bearer ...`.

## Read first

- `apps/server/src/lib/auth.ts` — JWT plugin, `requireAuth` macro, `currentUser` resolver
- `apps/server/src/modules/auth/auth.routes.ts` — login/refresh/wx-login endpoints
- `apps/server/src/db/schema/users.ts` — user fields (incl. `passwordHash`, `wxOpenId`, `wxUnionId`)
- `apps/web/src/lib/auth.ts` and `apps/web/src/features/auth/api.ts`
- `apps/miniapp/src/services/auth.ts`
- `packages/shared/src/schemas/auth.ts` — login DTOs and Zod schemas

## Server: JWT plugin

```ts
// apps/server/src/lib/auth.ts
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { env } from '../env';
import { AppError } from './errors';
import { ERROR_CODES } from '@rebook/shared';
import { userRepo } from '../modules/user/user.repo';

export const authPlugin = new Elysia({ name: 'auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET,
      exp: '7d',
    }),
  );

export const requireAuth = new Elysia({ name: 'requireAuth' })
  .use(authPlugin)
  .derive(async ({ jwt, cookie, headers }) => {
    const token =
      cookie.token?.value ??
      headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
    const payload = await jwt.verify(token);
    if (!payload || typeof payload === 'boolean') throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
    const user = await userRepo.findById(payload.sub as string);
    if (!user) throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
    return { user };
  });
```

Routes opt-in: `.use(requireAuth)` exposes `user` in the handler context.

## Server: login routes

```ts
// apps/server/src/modules/auth/auth.routes.ts
import { Elysia } from 'elysia';
import { loginInput, wxLoginInput } from '@rebook/shared';
import { authService } from './auth.service';
import { authPlugin } from '../../lib/auth';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(authPlugin)
  .post('/login', async ({ body, jwt, cookie }) => {
    const input = loginInput.parse(body);
    const user = await authService.login(input);
    const token = await jwt.sign({ sub: user.id, role: user.role });
    cookie.token.set({
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return { token, user }; // miniapp uses `token`; web uses cookie
  })
  .post('/wx-login', async ({ body, jwt }) => {
    const input = wxLoginInput.parse(body);
    const user = await authService.wxLogin(input.code);
    const token = await jwt.sign({ sub: user.id, role: user.role });
    return { token, user };
  })
  .post('/logout', ({ cookie }) => {
    cookie.token.remove();
    return { ok: true };
  });
```

## Server: password hashing

```ts
// apps/server/src/modules/auth/auth.service.ts
import { hash, verify } from '@node-rs/bcrypt'; // fast on Bun & Node
```

Use `@node-rs/bcrypt` (or Bun's `Bun.password.hash` if Bun-only). Cost ≥ 10.

## Server: WeChat code exchange

```ts
async function exchangeWxCode(code: string) {
  const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
  url.searchParams.set('appid', env.WX_APPID);
  url.searchParams.set('secret', env.WX_SECRET);
  url.searchParams.set('js_code', code);
  url.searchParams.set('grant_type', 'authorization_code');
  const res = await fetch(url);
  const data = (await res.json()) as { openid?: string; unionid?: string; errcode?: number };
  if (data.errcode) throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
  return data;
}
```

Then upsert by `wxUnionId` (preferred) or `wxOpenId`.

## Web client

```ts
// apps/web/src/features/auth/api.ts
export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => api.post<{ user: UserDTO }>('/auth/login', input),
    onSuccess: ({ user }) => useAuthStore.getState().setUser(user),
  });
}
```

Always set `credentials: 'include'` on the fetch wrapper so the cookie flows.

## Mini-program client

```ts
// apps/miniapp/src/services/auth.ts
import Taro from '@tarojs/taro';
import type { UserDTO } from '@rebook/shared';
import { api } from './request';

export async function loginWithWechat(): Promise<UserDTO> {
  const { code } = await Taro.login();
  const { token, user } = await api.post<{ token: string; user: UserDTO }>(
    '/auth/wx-login',
    { code },
  );
  Taro.setStorageSync('token', token);
  return user;
}
```

The shared `request.ts` automatically attaches `Authorization: Bearer <token>` when `token` is in storage (see `taro-page` skill).

## Authorization (roles)

Roles live on `users.role` (`'user' | 'admin'`). Check inside services or with a small helper:

```ts
function ensureRole(user: { role: string }, allowed: string[]) {
  if (!allowed.includes(user.role)) throw new AppError(ERROR_CODES.FORBIDDEN, 403);
}
```

## Token refresh

JWT exp is 7 days. On 401 with `code: UNAUTHORIZED`:

- **Web**: redirect to `/login` (cookie has expired).
- **Mini-program**: silently call `loginWithWechat()` once, retry the original request, otherwise navigate to login page.

## Workflow for a new protected endpoint

```
- [ ] 1. shared: define DTO + Zod schema (use shared-types)
- [ ] 2. server: route uses `.use(requireAuth)` for user context
- [ ] 3. service: call `ensureRole(user, ['admin'])` if needed
- [ ] 4. web: hook makes request with credentials; redirect on 401
- [ ] 5. miniapp: hook uses `api.*` (token attached automatically)
- [ ] 6. Test: at least one unauthenticated 401 case + one happy-path test
```

## Anti-patterns

- Issuing tokens with no expiration or storing them in `localStorage` on web (XSS risk). Use httpOnly Cookie on web.
- Doing `req.headers.authorization.split(' ')[1]` ad-hoc in a route. Always go through `requireAuth`.
- Storing plaintext passwords or weak hashes (md5/sha1). Use bcrypt/argon2.
- Creating a separate user record for the same person on web vs miniapp. Use `wxUnionId` for cross-app identity, link existing accounts at `wx-login` time.
- Putting role checks in the route file. Put them in services so they're testable.
