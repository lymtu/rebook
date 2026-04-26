import { ERROR_CODES, type AddCartItemInput } from '@rebook/shared';
import { AppError } from '../../lib/errors';
import { bookRepo } from '../book/book.repo';
import { cartRepo } from './cart.repo';
import { toCartLineDTO } from './cart.mapper';
import { feeService } from '../fee/fee.service';
import { db } from '../../db/client';
import { books } from '../../db/schema/books';
import { cartItems } from '../../db/schema/cart-items';
import { orderItems, orders } from '../../db/schema/orders';
import { eq } from 'drizzle-orm';

export const cartService = {
  async list(userId: string) {
    const rows = await cartRepo.listWithBooks(userId);
    return rows.map(({ line, book }) => toCartLineDTO(line, book));
  },

  async add(userId: string, input: AddCartItemInput) {
    const book = await bookRepo.findById(input.bookId);
    if (!book) throw new AppError(ERROR_CODES.BOOK_NOT_FOUND, 404);
    if (book.sellerId === userId) throw new AppError(ERROR_CODES.INVALID_INPUT, 400, 'Cannot buy own book');
    if (book.status !== 'ON_SALE') throw new AppError(ERROR_CODES.INVALID_BOOK_STATE, 400);
    const existing = await cartRepo.findLine(userId, input.bookId);
    if (existing) return toCartLineDTO(existing, book);
    const line = await cartRepo.insert({ userId, bookId: input.bookId, quantity: 1 });
    return toCartLineDTO(line, book);
  },

  async remove(userId: string, bookId: string) {
    await cartRepo.deleteLine(userId, bookId);
    return { ok: true as const };
  },

  async checkout(userId: string) {
    const lines = await cartRepo.listWithBooks(userId);
    if (lines.length === 0) throw new AppError(ERROR_CODES.CHECKOUT_EMPTY, 400);

    for (const { book } of lines) {
      if (book.sellerId === userId) {
        throw new AppError(ERROR_CODES.INVALID_INPUT, 400, 'Cannot checkout own listing');
      }
      if (book.status !== 'ON_SALE') {
        throw new AppError(ERROR_CODES.INVALID_BOOK_STATE, 400, `Book ${book.id} is not available`);
      }
    }

    const { rateBps, sourceProposalId } = await feeService.effectiveRate();

    const bySeller = new Map<string, typeof lines>();
    for (const row of lines) {
      const sid = row.book.sellerId;
      const arr = bySeller.get(sid) ?? [];
      arr.push(row);
      bySeller.set(sid, arr);
    }

    const orderIds = await db.transaction(async (tx) => {
      const ids: string[] = [];
      for (const [, group] of bySeller) {
        let subtotal = 0;
        for (const { book } of group) {
          subtotal += book.priceCents * 1;
        }
        const platformFeeCents = Math.ceil((subtotal * rateBps) / 10_000);
        const totalCents = subtotal;

        const [order] = await tx
          .insert(orders)
          .values({
            buyerId: userId,
            sellerId: group[0]!.book.sellerId,
            status: 'pending_payment',
            feeRateBpsSnapshot: rateBps,
            subtotalCents: subtotal,
            platformFeeCents,
            totalCents,
            paymentChannel: null,
            paymentIdempotencyKey: null,
          })
          .returning();
        if (!order) throw new Error('order insert failed');

        for (const { line, book } of group) {
          await tx.insert(orderItems).values({
            orderId: order.id,
            bookId: book.id,
            titleSnapshot: book.title,
            priceCents: book.priceCents,
            quantity: line.quantity,
          });
          await tx
            .update(books)
            .set({ status: 'RESERVED' })
            .where(eq(books.id, book.id));
        }
        ids.push(order.id);
      }

      await tx.delete(cartItems).where(eq(cartItems.userId, userId));
      return ids;
    });

    return { orderIds, feeRateSourceProposalId: sourceProposalId };
  },
};
