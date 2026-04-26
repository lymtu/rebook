import { z } from 'zod';

export const createAnnouncementInput = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(20_000),
  pinSort: z.number().int().default(0),
});
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementInput>;
