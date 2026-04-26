import { desc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { feeProposals, type FeeProposalRow, type NewFeeProposalRow } from '../../db/schema/fee-proposals';

export const feeRepo = {
  async latestApproved(): Promise<FeeProposalRow | undefined> {
    const [row] = await db
      .select()
      .from(feeProposals)
      .where(eq(feeProposals.status, 'approved'))
      .orderBy(desc(feeProposals.reviewedAt))
      .limit(1);
    return row;
  },

  insert: async (data: NewFeeProposalRow): Promise<FeeProposalRow> => {
    const [row] = await db.insert(feeProposals).values(data).returning();
    if (!row) throw new Error('Failed to insert fee proposal');
    return row;
  },

  findById: (id: string): Promise<FeeProposalRow | undefined> =>
    db.query.feeProposals.findFirst({ where: eq(feeProposals.id, id) }),

  update: async (
    id: string,
    patch: Partial<NewFeeProposalRow>,
  ): Promise<FeeProposalRow | undefined> => {
    const [row] = await db.update(feeProposals).set(patch).where(eq(feeProposals.id, id)).returning();
    return row;
  },

  listRecent: (limit = 50): Promise<FeeProposalRow[]> =>
    db.select().from(feeProposals).orderBy(desc(feeProposals.createdAt)).limit(limit),
};
