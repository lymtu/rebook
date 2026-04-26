import { z } from 'zod';

export const addCartItemInput = z.object({
  bookId: z.string().min(1),
});
export type AddCartItemInput = z.infer<typeof addCartItemInput>;
