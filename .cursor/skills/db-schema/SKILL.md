---
name: db-schema
description: Defines or alters Drizzle ORM tables, generates SQL migrations, and writes seed data for the PostgreSQL database in `apps/server`. Use when adding or modifying database tables, columns, indexes, foreign keys, or running migrations.
---

# db-schema

The database is PostgreSQL, accessed via Drizzle ORM. Schema files are the source of truth; SQL migrations are generated from them and committed to the repo.

## Read first

- `apps/server/drizzle.config.ts` — Drizzle config (schema path, migrations dir, connection)
- `apps/server/src/db/schema/index.ts` — barrel that re-exports every table
- `apps/server/src/db/client.ts` — Drizzle client singleton
- `apps/server/drizzle/` — existing generated migrations (look here before adding columns)

## Schema layout

```
apps/server/src/db/
├── client.ts                     # postgres + drizzle() instance
├── schema/
│   ├── index.ts                  # barrel: export * from './users', etc.
│   ├── users.ts
│   ├── books.ts
│   ├── orders.ts
│   └── _shared.ts                # shared column helpers (id, timestamps)
├── migrate.ts                    # CLI script that runs migrations
└── seed.ts                       # idempotent seed
apps/server/drizzle/              # generated SQL — committed
```

## Table conventions

- **Plural snake_case table name** (`books`, `order_items`).
- **`id`** is `text` UUID v7 (sortable). Use the shared helper.
- Always include `createdAt` and `updatedAt`.
- **Foreign keys** named `<table>_id`, with `references()` and explicit `onDelete`.
- **Indexes** for any column used in `where`/`orderBy` outside the primary key.
- **Enums**: define in PostgreSQL via `pgEnum`; mirror values in `packages/shared/src/constants` so clients see the same set.

## Shared helpers

```ts
// apps/server/src/db/schema/_shared.ts
import { text, timestamp } from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';

export const idColumn = () =>
  text('id').primaryKey().$defaultFn(() => uuidv7());

export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
```

## Table template

```ts
// apps/server/src/db/schema/books.ts
import { index, integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core';
import { idColumn, timestamps } from './_shared';
import { users } from './users';

export const bookConditionEnum = pgEnum('book_condition', [
  'NEW',
  'LIKE_NEW',
  'GOOD',
  'ACCEPTABLE',
]);

export const books = pgTable(
  'books',
  {
    id: idColumn(),
    sellerId: text('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    author: text('author'),
    priceCents: integer('price_cents').notNull(),
    conditionGrade: bookConditionEnum('condition_grade').notNull(),
    coverImageKey: text('cover_image_key'),
    ...timestamps,
  },
  (t) => ({
    sellerIdx: index('books_seller_id_idx').on(t.sellerId),
    titleIdx: index('books_title_idx').on(t.title),
  }),
);
```

Then add to the barrel:

```ts
// apps/server/src/db/schema/index.ts
export * from './books';
```

## Migration workflow

```
- [ ] 1. Edit/create the table file under src/db/schema/
- [ ] 2. Re-export from src/db/schema/index.ts
- [ ] 3. pnpm db:generate           # creates a new SQL file under apps/server/drizzle/
- [ ] 4. Review the generated SQL — check destructive ops, defaults for non-null adds
- [ ] 5. pnpm db:migrate            # apply locally
- [ ] 6. Update seed if needed; run pnpm db:seed
- [ ] 7. Commit BOTH the schema change and the generated migration
```

`pnpm db:generate` runs `drizzle-kit generate` per `drizzle.config.ts`.
`pnpm db:migrate` runs `apps/server/src/db/migrate.ts` which uses `drizzle-orm/postgres-js/migrator`.

## Adding a non-null column to an existing table

A non-null column without a default fails on existing rows. Pick one:

1. Add as nullable → backfill with a data migration → tighten to `notNull` in a follow-up migration.
2. Add with `.default(...)` so existing rows get the default; drop the default later if not desired.

Never edit a migration that has been merged. Add a new one.

## Seeding

```ts
// apps/server/src/db/seed.ts
import { db } from './client';
import { users, books } from './schema';

export async function seed() {
  // idempotent: use onConflictDoNothing or upserts
  await db.insert(users).values([{ id: 'seed-user-1', /* ... */ }])
    .onConflictDoNothing();
  await db.insert(books).values([/* ... */ ]).onConflictDoNothing();
}

if (import.meta.main) {
  await seed();
  process.exit(0);
}
```

Run with `pnpm db:seed`.

## Pairing with shared schemas

After table changes, regenerate the Zod schema for inputs you expose to clients:

```ts
import { createInsertSchema } from 'drizzle-zod';
import { books } from './schema/books';

export const insertBookSchema = createInsertSchema(books, {
  // override fields the client should not provide directly
  id: undefined,
  sellerId: undefined,
});
```

Then re-publish the relevant subset through `packages/shared` (see the `shared-types` skill).

## Anti-patterns

- Editing an already-merged migration. Always create a new one.
- Defining a TS-side enum that drifts from `pgEnum`. Use one source.
- Forgetting `onDelete` behavior on foreign keys.
- Putting query helpers inside schema files. Keep schema declarative; queries belong in repos.
- Storing money as floats. Use `integer` cents (or `numeric(20, 4)` for fractional).
