import {
  ERROR_CODES,
  type CreateBookInput,
  type ListBooksQuery,
  type ReviewBookInput,
  type UpdateBookInput,
} from '@rebook/shared';
import { AppError } from '../../lib/errors';
import type { AuthContext } from '../../lib/auth';
import { bookRepo } from './book.repo';
import { toBookDTO } from './book.mapper';

export const bookService = {
  async listPublic(query: ListBooksQuery) {
    const { items, nextCursor } = await bookRepo.list({ ...query, publicOnly: true });
    return { items: items.map(toBookDTO), nextCursor };
  },

  /** Another user's storefront: only on-sale listings. */
  async listSellerStore(sellerId: string, query: ListBooksQuery) {
    const { items, nextCursor } = await bookRepo.list({
      ...query,
      sellerId,
      status: 'ON_SALE',
      publicOnly: false,
    });
    return { items: items.map(toBookDTO), nextCursor };
  },

  async listMine(sellerId: string, query: ListBooksQuery) {
    const { items, nextCursor } = await bookRepo.list({
      ...query,
      sellerId,
      publicOnly: false,
    });
    return { items: items.map(toBookDTO), nextCursor };
  },

  async listPendingReview(query: ListBooksQuery) {
    const { items, nextCursor } = await bookRepo.list({
      ...query,
      status: 'PENDING_REVIEW',
      publicOnly: false,
    });
    return { items: items.map(toBookDTO), nextCursor };
  },

  async getById(id: string, viewer: AuthContext | null) {
    const book = await bookRepo.findById(id);
    if (!book) throw new AppError(ERROR_CODES.BOOK_NOT_FOUND, 404);
    const isOwner = viewer?.id === book.sellerId;
    const isStaff = viewer?.role === 'admin' || viewer?.role === 'super_admin';
    if (book.status !== 'ON_SALE' && !isOwner && !isStaff) {
      throw new AppError(ERROR_CODES.BOOK_NOT_FOUND, 404);
    }
    return toBookDTO(book);
  },

  async create(sellerId: string, input: CreateBookInput) {
    const row = await bookRepo.insert({
      sellerId,
      title: input.title,
      author: input.author ?? null,
      isbn: input.isbn ?? null,
      description: input.description ?? null,
      priceCents: input.priceCents,
      conditionGrade: input.conditionGrade,
      status: 'PENDING_REVIEW',
      coverImageKey: input.coverImageKey ?? null,
      imageKeys: input.imageKeys ?? [],
    });
    return toBookDTO(row);
  },

  async update(sellerId: string, id: string, input: UpdateBookInput) {
    const book = await bookRepo.findById(id);
    if (!book) throw new AppError(ERROR_CODES.BOOK_NOT_FOUND, 404);
    if (book.sellerId !== sellerId) throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    if (book.status === 'SOLD' || book.status === 'REMOVED') {
      throw new AppError(ERROR_CODES.INVALID_BOOK_STATE, 400, 'Cannot edit this listing');
    }

    const nextStatus =
      book.status === 'REJECTED' || book.status === 'ON_SALE' ? 'PENDING_REVIEW' : book.status;

    const patch = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined),
    ) as Partial<typeof book>;
    const row = await bookRepo.update(id, {
      ...patch,
      status: nextStatus,
      rejectReason: nextStatus === 'PENDING_REVIEW' ? null : book.rejectReason,
    });
    return toBookDTO(row!);
  },

  async remove(sellerId: string, id: string) {
    const book = await bookRepo.findById(id);
    if (!book) throw new AppError(ERROR_CODES.BOOK_NOT_FOUND, 404);
    if (book.sellerId !== sellerId) throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    if (book.status === 'SOLD') throw new AppError(ERROR_CODES.INVALID_BOOK_STATE, 400);
    const row = await bookRepo.update(id, { status: 'REMOVED' });
    return toBookDTO(row!);
  },

  async review(_adminId: string, id: string, input: ReviewBookInput) {
    const book = await bookRepo.findById(id);
    if (!book) throw new AppError(ERROR_CODES.BOOK_NOT_FOUND, 404);
    if (book.status !== 'PENDING_REVIEW') {
      throw new AppError(ERROR_CODES.INVALID_BOOK_STATE, 400, 'Book is not pending review');
    }
    if (input.action === 'approve') {
      const row = await bookRepo.update(id, {
        status: 'ON_SALE',
        rejectReason: null,
      });
      return toBookDTO(row!);
    }
    const row = await bookRepo.update(id, {
      status: 'REJECTED',
      rejectReason: input.rejectReason ?? null,
    });
    return toBookDTO(row!);
  },
};
