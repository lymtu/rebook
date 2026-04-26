import { index, pgEnum, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { USER_ROLES, USER_STATUSES } from '@rebook/shared';
import { generateId, timestamps } from './_shared';

export const userRoleEnum = pgEnum('user_role', USER_ROLES);
export const userStatusEnum = pgEnum('user_status', USER_STATUSES);

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey().$defaultFn(generateId),
    username: text('username'),
    passwordHash: text('password_hash'),
    nickname: text('nickname').notNull(),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    role: userRoleEnum('role').notNull().default('user'),
    status: userStatusEnum('status').notNull().default('active'),
    wxOpenId: text('wx_open_id'),
    wxUnionId: text('wx_union_id'),
    ...timestamps,
  },
  (t) => ({
    usernameIdx: uniqueIndex('users_username_idx').on(t.username),
    wxOpenIdIdx: uniqueIndex('users_wx_open_id_idx').on(t.wxOpenId),
    wxUnionIdIdx: uniqueIndex('users_wx_union_id_idx').on(t.wxUnionId),
    roleIdx: index('users_role_idx').on(t.role),
  }),
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
