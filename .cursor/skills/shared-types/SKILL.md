---
name: shared-types
description: Defines and updates cross-app TypeScript types, Zod schemas, API DTOs, and constants in `packages/shared`. Use when adding or modifying anything imported by both `apps/server` and any client (`apps/web`, `apps/miniapp`), including request/response shapes, enums, error codes, or validation rules.
---

# shared-types

`packages/shared` is the single source of truth for any data shape that crosses the server/client boundary. Server validates with the Zod schemas defined here; clients import the inferred TypeScript types from here.

## Read first

- `packages/shared/src/index.ts` — current public barrel
- `packages/shared/package.json` — name is `@rebook/shared`, exports map controls public surface
- Existing examples in `packages/shared/src/api/` and `packages/shared/src/schemas/`

## Folder layout

```
packages/shared/src/
├── api/                    # Pure type DTOs (request/response shapes)
│   └── <domain>.ts
├── schemas/                # Zod schemas (runtime validators)
│   └── <domain>.ts
├── constants/              # Enums, error codes, regexes, tunables
│   └── <domain>.ts
└── index.ts                # Public barrel — only export from here
```

## Authoring rules

1. **Schema first, type derived**. Define Zod once and infer TS:
   ```ts
   // packages/shared/src/schemas/book.ts
   import { z } from 'zod';

   export const createBookInput = z.object({
     title: z.string().min(1).max(200),
     author: z.string().max(100).optional(),
     priceCents: z.number().int().nonnegative(),
     conditionGrade: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'ACCEPTABLE']),
     coverImageKey: z.string().optional(),
   });

   export type CreateBookInput = z.infer<typeof createBookInput>;
   ```

2. **DTO files re-export the inferred type plus a response shape**:
   ```ts
   // packages/shared/src/api/book.ts
   export type { CreateBookInput } from '../schemas/book';

   export interface BookDTO {
     id: string;
     title: string;
     author: string | null;
     priceCents: number;
     conditionGrade: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'ACCEPTABLE';
     coverImageKey: string | null;
     sellerId: string;
     createdAt: string; // ISO
   }
   ```

3. **Enums as `as const` + Zod**, never TS `enum`:
   ```ts
   // packages/shared/src/constants/book.ts
   export const BOOK_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'ACCEPTABLE'] as const;
   export type BookCondition = (typeof BOOK_CONDITIONS)[number];
   ```

4. **Error codes are constants here** (not strings inlined elsewhere):
   ```ts
   // packages/shared/src/constants/errors.ts
   export const ERROR_CODES = {
     UNAUTHORIZED: 'UNAUTHORIZED',
     BOOK_NOT_FOUND: 'BOOK_NOT_FOUND',
     INVALID_INPUT: 'INVALID_INPUT',
   } as const;
   export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
   ```

5. **Always export from `index.ts`**. Do not let consumers reach into deep paths.
   ```ts
   // packages/shared/src/index.ts
   export * from './api/book';
   export * from './schemas/book';
   export * from './constants/book';
   export * from './constants/errors';
   ```

## Pairing with `drizzle-zod`

When the table already exists in `apps/server/src/db/schema/`, derive a Zod insert schema and re-export through `packages/shared` so the client gets the same shape:

```ts
// In apps/server (NOT shared, server-side only)
import { createInsertSchema } from 'drizzle-zod';
import { books } from '../db/schema/books';
export const insertBookSchema = createInsertSchema(books);
```

Pick fields the client should send and re-publish them as a Zod schema in `packages/shared` (do not import Drizzle from `shared`).

## Workflow

```
- [ ] 1. Add/modify Zod schema in packages/shared/src/schemas/<domain>.ts
- [ ] 2. Add/modify DTO type in packages/shared/src/api/<domain>.ts
- [ ] 3. Add new constants (enums, error codes) if needed
- [ ] 4. Re-export everything from packages/shared/src/index.ts
- [ ] 5. Run `pnpm typecheck` from the repo root — fix any breakage in apps/server / apps/web / apps/miniapp
```

## Anti-patterns

- Defining the same type in two places (e.g. once in shared and once in `apps/web`).
- Using TS `enum` (causes runtime + bundle issues across Bun/Vite/Taro).
- Importing from `apps/server` or any UI library inside `packages/shared`. **Shared must stay framework-free.**
- Exporting via deep relative paths from consumers — always go through `@rebook/shared`.
