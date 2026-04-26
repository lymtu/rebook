import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, text } from 'drizzle-orm/pg-core';
import { DISPUTE_STATUSES } from '@rebook/shared';
import { generateId, timestamps } from './_shared';
import { orders } from './orders';
import { users } from './users';

export const disputeStatusEnum = pgEnum('dispute_status', DISPUTE_STATUSES);

export const disputes = pgTable(
  'disputes',
  {
    id: text('id').primaryKey().$defaultFn(generateId),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),
    openedByUserId: text('opened_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    reason: text('reason').notNull(),
    status: disputeStatusEnum('status').notNull().default('open'),
    handledByUserId: text('handled_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    resolution: text('resolution'),
    evidenceKeys: text('evidence_keys')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    ...timestamps,
  },
  (t) => ({
    orderIdx: index('disputes_order_id_idx').on(t.orderId),
    statusIdx: index('disputes_status_idx').on(t.status),
  }),
);

export type DisputeRow = typeof disputes.$inferSelect;
export type NewDisputeRow = typeof disputes.$inferInsert;
