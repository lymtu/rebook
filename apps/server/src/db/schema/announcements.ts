import { index, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { generateId, timestamps } from './_shared';
import { users } from './users';

export const announcements = pgTable(
  'announcements',
  {
    id: text('id').primaryKey().$defaultFn(generateId),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    body: text('body').notNull(),
    pinSort: integer('pin_sort').notNull().default(0),
    ...timestamps,
  },
  (t) => ({
    pinIdx: index('announcements_pin_sort_idx').on(t.pinSort),
    createdIdx: index('announcements_created_at_idx').on(t.createdAt),
  }),
);

export type AnnouncementRow = typeof announcements.$inferSelect;
export type NewAnnouncementRow = typeof announcements.$inferInsert;
