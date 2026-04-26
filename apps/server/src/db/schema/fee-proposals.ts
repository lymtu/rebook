import { index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { FEE_PROPOSAL_STATUSES } from '@rebook/shared';
import { generateId, timestamps } from './_shared';
import { users } from './users';

export const feeProposalStatusEnum = pgEnum('fee_proposal_status', FEE_PROPOSAL_STATUSES);

export const feeProposals = pgTable(
  'fee_proposals',
  {
    id: text('id').primaryKey().$defaultFn(generateId),
    rateBps: integer('rate_bps').notNull(),
    status: feeProposalStatusEnum('status').notNull().default('pending'),
    proposedByUserId: text('proposed_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    reviewedByUserId: text('reviewed_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    reviewNote: text('review_note'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    statusIdx: index('fee_proposals_status_idx').on(t.status),
  }),
);

export type FeeProposalRow = typeof feeProposals.$inferSelect;
export type NewFeeProposalRow = typeof feeProposals.$inferInsert;
