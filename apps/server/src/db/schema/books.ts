import { sql } from 'drizzle-orm';
import { index, integer, pgEnum, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { BOOK_CONDITIONS, BOOK_STATUSES } from '@rebook/shared';
import { generateId, timestamps } from './_shared';
import { users } from './users';

export const bookConditionEnum = pgEnum('book_condition', BOOK_CONDITIONS);
export const bookStatusEnum = pgEnum('book_status', BOOK_STATUSES);

export const books = pgTable(
  'books',
  {
    id: text('id').primaryKey().$defaultFn(generateId),
    sellerId: text('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    author: text('author'),
    isbn: text('isbn'),
    description: text('description'),
    priceCents: integer('price_cents').notNull(),
    conditionGrade: bookConditionEnum('condition_grade').notNull(),
    status: bookStatusEnum('status').notNull().default('PENDING_REVIEW'),
    rejectReason: text('reject_reason'),
    coverImageKey: text('cover_image_key'),
    imageKeys: text('image_keys')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    ...timestamps,
  },
  (t) => ({
    sellerIdx: index('books_seller_id_idx').on(t.sellerId),
    statusIdx: index('books_status_idx').on(t.status),
    titleIdx: index('books_title_idx').on(t.title),
  }),
);

export type BookRow = typeof books.$inferSelect;
export type NewBookRow = typeof books.$inferInsert;
