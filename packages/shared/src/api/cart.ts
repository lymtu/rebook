import type { BookDTO } from './book';

export interface CartLineDTO {
  id: string;
  bookId: string;
  quantity: number;
  book: BookDTO;
  createdAt: string;
}
