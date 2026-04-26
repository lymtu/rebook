import { desc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { users, type NewUserRow, type UserRow } from '../../db/schema/users';

export const userRepo = {
  listRecentForAdmin: (limit: number): Promise<UserRow[]> =>
    db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(Math.min(Math.max(limit, 1), 200)),

  findById: (id: string): Promise<UserRow | undefined> =>
    db.query.users.findFirst({ where: eq(users.id, id) }),

  findByUsername: (username: string): Promise<UserRow | undefined> =>
    db.query.users.findFirst({ where: eq(users.username, username) }),

  findByWxOpenId: (openId: string): Promise<UserRow | undefined> =>
    db.query.users.findFirst({ where: eq(users.wxOpenId, openId) }),

  findByWxUnionId: (unionId: string): Promise<UserRow | undefined> =>
    db.query.users.findFirst({ where: eq(users.wxUnionId, unionId) }),

  insert: async (data: NewUserRow): Promise<UserRow> => {
    const [row] = await db.insert(users).values(data).returning();
    if (!row) throw new Error('Failed to insert user');
    return row;
  },

  update: async (id: string, patch: Partial<NewUserRow>): Promise<UserRow | undefined> => {
    const [row] = await db.update(users).set(patch).where(eq(users.id, id)).returning();
    return row;
  },
};
