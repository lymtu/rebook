import type { CartLineDTO } from '@rebook/shared';
import type { BookRow } from '../../db/schema/books';
import type { CartItemRow } from '../../db/schema/cart-items';
import { toBookDTO } from '../book/book.mapper';

export function toCartLineDTO(line: CartItemRow, book: BookRow): CartLineDTO {
  return {
    id: line.id,
    bookId: line.bookId,
    quantity: line.quantity,
    book: toBookDTO(book),
    createdAt: line.createdAt.toISOString(),
  };
}
