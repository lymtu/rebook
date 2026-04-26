import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { disputes, type DisputeRow, type NewDisputeRow } from '../../db/schema/disputes';

export const disputeRepo = {
  findById: (id: string): Promise<DisputeRow | undefined> =>
    db.query.disputes.findFirst({ where: eq(disputes.id, id) }),

  findOpenByOrder: (orderId: string): Promise<DisputeRow | undefined> =>
    db.query.disputes.findFirst({
      where: and(eq(disputes.orderId, orderId), eq(disputes.status, 'open')),
    }),

  insert: async (data: NewDisputeRow): Promise<DisputeRow> => {
    const [row] = await db.insert(disputes).values(data).returning();
    if (!row) throw new Error('Failed to insert dispute');
    return row;
  },

  update: async (id: string, patch: Partial<NewDisputeRow>): Promise<DisputeRow | undefined> => {
    const [row] = await db.update(disputes).set(patch).where(eq(disputes.id, id)).returning();
    return row;
  },

  listOpen: (): Promise<DisputeRow[]> =>
    db.select().from(disputes).where(eq(disputes.status, 'open')).orderBy(desc(disputes.createdAt)),
};
