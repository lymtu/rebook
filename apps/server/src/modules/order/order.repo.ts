import { and, desc, eq, lt, or, type SQL } from 'drizzle-orm';
import { db } from '../../db/client';
import { books } from '../../db/schema/books';
import { orderItems, orders, type OrderRow } from '../../db/schema/orders';
import type { ListOrdersQuery } from '@rebook/shared';

export const orderRepo = {
  findById: (id: string): Promise<OrderRow | undefined> =>
    db.query.orders.findFirst({ where: eq(orders.id, id) }),

  listItems: (orderId: string) =>
    db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),

  async listForParticipant(userId: string, query: ListOrdersQuery) {
    const conds: SQL[] = [];
    if (query.as === 'buyer') conds.push(eq(orders.buyerId, userId));
    else if (query.as === 'seller') conds.push(eq(orders.sellerId, userId));
    else conds.push(or(eq(orders.buyerId, userId), eq(orders.sellerId, userId))!);

    if (query.status) conds.push(eq(orders.status, query.status));
    if (query.cursor) conds.push(lt(orders.id, query.cursor));
    const where = and(...conds);
    const limit = query.limit ?? 20;
    const rows = await db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.id))
      .limit(limit + 1);
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]!.id : null;
    return { items, nextCursor };
  },

  update: async (id: string, patch: Partial<OrderRow>): Promise<OrderRow | undefined> => {
    const [row] = await db.update(orders).set(patch).where(eq(orders.id, id)).returning();
    return row;
  },

  setBooksStatusForOrder: async (orderId: string, status: typeof books.$inferSelect.status) => {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const it of items) {
      await db.update(books).set({ status }).where(eq(books.id, it.bookId));
    }
  },
};
