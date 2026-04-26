import { and, desc, eq, ilike, lt, type SQL } from 'drizzle-orm';
import { db } from '../../db/client';
import { books, type BookRow, type NewBookRow } from '../../db/schema/books';
import type { ListBooksQuery } from '@rebook/shared';

export const bookRepo = {
  findById: (id: string): Promise<BookRow | undefined> =>
    db.query.books.findFirst({ where: eq(books.id, id) }),

  async list(args: ListBooksQuery & { publicOnly?: boolean }): Promise<{
    items: BookRow[];
    nextCursor: string | null;
  }> {
    const conds: SQL[] = [];
    if (args.q) conds.push(ilike(books.title, `%${args.q}%`));
    if (args.sellerId) conds.push(eq(books.sellerId, args.sellerId));
    if (args.status) conds.push(eq(books.status, args.status));
    else if (args.publicOnly) conds.push(eq(books.status, 'ON_SALE'));
    if (args.cursor) conds.push(lt(books.id, args.cursor));
    const where = conds.length ? and(...conds) : undefined;
    const limit = args.limit ?? 20;
    const rows = await db
      .select()
      .from(books)
      .where(where)
      .orderBy(desc(books.id))
      .limit(limit + 1);
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]!.id : null;
    return { items, nextCursor };
  },

  insert: async (data: NewBookRow): Promise<BookRow> => {
    const [row] = await db.insert(books).values(data).returning();
    if (!row) throw new Error('Failed to insert book');
    return row;
  },

  update: async (id: string, patch: Partial<NewBookRow>): Promise<BookRow | undefined> => {
    const [row] = await db.update(books).set(patch).where(eq(books.id, id)).returning();
    return row;
  },
};
