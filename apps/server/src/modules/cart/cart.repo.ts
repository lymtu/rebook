import { and, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { books } from '../../db/schema/books';
import { cartItems, type CartItemRow, type NewCartItemRow } from '../../db/schema/cart-items';

export const cartRepo = {
  listWithBooks: (userId: string) =>
    db
      .select({ line: cartItems, book: books })
      .from(cartItems)
      .innerJoin(books, eq(cartItems.bookId, books.id))
      .where(eq(cartItems.userId, userId)),

  findLine: (userId: string, bookId: string): Promise<CartItemRow | undefined> =>
    db.query.cartItems.findFirst({
      where: and(eq(cartItems.userId, userId), eq(cartItems.bookId, bookId)),
    }),

  insert: async (data: NewCartItemRow): Promise<CartItemRow> => {
    const [row] = await db.insert(cartItems).values(data).returning();
    if (!row) throw new Error('Failed to insert cart item');
    return row;
  },

  deleteLine: async (userId: string, bookId: string): Promise<void> => {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.bookId, bookId)));
  },

  clearUser: async (userId: string): Promise<void> => {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  },
};
