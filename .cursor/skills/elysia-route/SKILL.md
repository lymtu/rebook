---
name: elysia-route
description: Adds or modifies a backend HTTP route in `apps/server` (Elysia + Bun). Use when creating REST endpoints, request handlers, controllers, route groups, middleware, or modifying API surface in the Elysia server.
---

# elysia-route

Backend routes live in `apps/server/src/modules/<domain>/`. Each domain owns its routes, services, repositories, and tests. Routes only orchestrate; business logic lives in services; data access lives in repositories.

## Read first

- `apps/server/src/app.ts` — Elysia root, plugin order, global error handler
- `apps/server/src/lib/errors.ts` — `AppError` class and error mapping
- `apps/server/src/lib/auth.ts` — auth plugin / `requireAuth` macro
- `packages/shared/src/api/<domain>.ts` and `packages/shared/src/schemas/<domain>.ts` — DTOs and Zod schemas you must reuse

## Module layout

```
apps/server/src/modules/<domain>/
├── <domain>.routes.ts      # Elysia route group, only validation + delegation
├── <domain>.service.ts     # business logic, transactions, side effects
├── <domain>.repo.ts        # Drizzle queries, no Elysia imports
└── <domain>.test.ts        # Bun test for service (and route via Elysia.handle)
```

## Route template

```ts
// apps/server/src/modules/book/book.routes.ts
import { Elysia, t } from 'elysia';
import { createBookInput } from '@rebook/shared';
import { requireAuth } from '../../lib/auth';
import { bookService } from './book.service';

export const bookRoutes = new Elysia({ prefix: '/books', tags: ['books'] })
  .use(requireAuth)
  .get(
    '/',
    ({ query }) => bookService.list({ q: query.q, limit: query.limit ?? 20 }),
    {
      query: t.Object({
        q: t.Optional(t.String()),
        limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
      }),
    },
  )
  .get(
    '/:id',
    ({ params }) => bookService.getById(params.id),
    { params: t.Object({ id: t.String() }) },
  )
  .post(
    '/',
    async ({ body, user }) => {
      const input = createBookInput.parse(body); // Zod from @rebook/shared
      return bookService.create({ ...input, sellerId: user.id });
    },
    { body: t.Any() }, // body validated by Zod above
  );
```

Mount it in `apps/server/src/app.ts`:

```ts
import { bookRoutes } from './modules/book/book.routes';
app.use(bookRoutes);
```

## Service template

```ts
// apps/server/src/modules/book/book.service.ts
import { AppError } from '../../lib/errors';
import { ERROR_CODES } from '@rebook/shared';
import { bookRepo } from './book.repo';

export const bookService = {
  async list(args: { q?: string; limit: number }) {
    return bookRepo.search(args);
  },
  async getById(id: string) {
    const book = await bookRepo.findById(id);
    if (!book) throw new AppError(ERROR_CODES.BOOK_NOT_FOUND, 404);
    return book;
  },
  async create(input: { title: string; sellerId: string; /* ... */ }) {
    return bookRepo.insert(input);
  },
};
```

## Repository template

```ts
// apps/server/src/modules/book/book.repo.ts
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { books } from '../../db/schema/books';

export const bookRepo = {
  findById: (id: string) => db.query.books.findFirst({ where: eq(books.id, id) }),
  insert: (data: typeof books.$inferInsert) =>
    db.insert(books).values(data).returning().then((r) => r[0]),
  // ...
};
```

## Validation

- **Body / complex shapes**: validate with Zod from `@rebook/shared` (`schema.parse(body)`). Single source of truth.
- **Path params / query**: use Elysia's built-in `t.Object` (cheap, runtime-typed).
- Throw `AppError` on validation failure inside services; let the global error handler convert to JSON.

## Error responses

The global handler (in `apps/server/src/app.ts`) maps `AppError` to:

```json
{ "error": { "code": "BOOK_NOT_FOUND", "message": "..." } }
```

Always use codes from `ERROR_CODES` in `@rebook/shared/constants/errors`. Never invent ad-hoc strings.

## Auth

- Public route: do not `.use(requireAuth)`.
- Protected route: chain `.use(requireAuth)` on the group; the handler context gains `user: { id, role }`.
- Role check: `if (user.role !== 'admin') throw new AppError(ERROR_CODES.FORBIDDEN, 403);`

See the `auth` skill for the auth plugin internals.

## Tests

```ts
// apps/server/src/modules/book/book.test.ts
import { describe, it, expect } from 'bun:test';
import { app } from '../../app';

describe('GET /books/:id', () => {
  it('returns 404 for unknown id', async () => {
    const res = await app.handle(new Request('http://x/books/unknown'));
    expect(res.status).toBe(404);
  });
});
```

Run with `pnpm --filter @rebook/server test` or `bun test` inside `apps/server`.

## Workflow

```
- [ ] 1. shared: ensure DTO + Zod schema exist (use shared-types skill)
- [ ] 2. modules/<domain>/<domain>.repo.ts — Drizzle queries
- [ ] 3. modules/<domain>/<domain>.service.ts — business logic + AppError
- [ ] 4. modules/<domain>/<domain>.routes.ts — Elysia routes, validation, auth
- [ ] 5. Mount in app.ts
- [ ] 6. Write at least one test per public route
- [ ] 7. pnpm --filter @rebook/server typecheck && test
```

## Anti-patterns

- Doing `db.select()...` inside a route handler. Always go through repo → service → route.
- Inlining Zod schemas in route files instead of importing from `@rebook/shared`.
- Returning raw Drizzle rows that include sensitive columns (e.g. `passwordHash`). Map to a DTO.
- Catching errors inside the route just to re-throw — let the global handler do it.
- Using `console.log` for diagnostics. Use the shared logger.
