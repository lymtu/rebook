import { index, integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { generateId, timestamps } from './_shared';
import { books } from './books';
import { users } from './users';

export const cartItems = pgTable(
  'cart_items',
  {
    id: text('id').primaryKey().$defaultFn(generateId),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    ...timestamps,
  },
  (t) => ({
    userBookUq: uniqueIndex('cart_items_user_book_uq').on(t.userId, t.bookId),
    userIdx: index('cart_items_user_id_idx').on(t.userId),
  }),
);

export type CartItemRow = typeof cartItems.$inferSelect;
export type NewCartItemRow = typeof cartItems.$inferInsert;
