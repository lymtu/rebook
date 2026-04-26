import { z } from 'zod';
import {
  BOOK_CONDITIONS,
  BOOK_STATUSES,
  MAX_BOOK_DESCRIPTION_LENGTH,
  MAX_BOOK_TITLE_LENGTH,
} from '../constants/book';

export const bookConditionSchema = z.enum(BOOK_CONDITIONS);
export const bookStatusSchema = z.enum(BOOK_STATUSES);

export const createBookInput = z.object({
  title: z.string().min(1).max(MAX_BOOK_TITLE_LENGTH),
  author: z.string().max(100).optional(),
  isbn: z
    .string()
    .regex(/^[0-9Xx-]{10,17}$/, 'Invalid ISBN')
    .optional(),
  description: z.string().max(MAX_BOOK_DESCRIPTION_LENGTH).optional(),
  priceCents: z.number().int().nonnegative().max(10_000_00),
  conditionGrade: bookConditionSchema,
  coverImageKey: z.string().optional(),
  imageKeys: z.array(z.string()).max(8).optional(),
});
export type CreateBookInput = z.infer<typeof createBookInput>;

/** Seller-editable fields only; status changes go through admin review or system rules. */
export const updateBookInput = createBookInput.partial();
export type UpdateBookInput = z.infer<typeof updateBookInput>;

export const reviewBookInput = z
  .object({
    action: z.enum(['approve', 'reject']),
    rejectReason: z.string().max(500).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.action === 'reject' && (!v.rejectReason || v.rejectReason.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'rejectReason is required when rejecting',
        path: ['rejectReason'],
      });
    }
  });
export type ReviewBookInput = z.infer<typeof reviewBookInput>;

export const listBooksQuery = z.object({
  q: z.string().max(100).optional(),
  sellerId: z.string().optional(),
  status: bookStatusSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListBooksQuery = z.infer<typeof listBooksQuery>;
