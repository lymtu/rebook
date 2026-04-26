import { desc } from 'drizzle-orm';
import { db } from '../../db/client';
import { announcements, type AnnouncementRow, type NewAnnouncementRow } from '../../db/schema/announcements';

export const announcementRepo = {
  listPublished: (limit = 50): Promise<AnnouncementRow[]> =>
    db.select().from(announcements).orderBy(desc(announcements.pinSort), desc(announcements.createdAt)).limit(limit),

  insert: async (data: NewAnnouncementRow): Promise<AnnouncementRow> => {
    const [row] = await db.insert(announcements).values(data).returning();
    if (!row) throw new Error('Failed to insert announcement');
    return row;
  },
};
