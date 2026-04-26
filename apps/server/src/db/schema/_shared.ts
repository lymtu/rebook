import { timestamp } from 'drizzle-orm/pg-core';
import { ulid } from 'ulid';

export const generateId = () => ulid();

export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
