import type { BookCondition, BookStatus } from '../constants/book';

export interface BookDTO {
  id: string;
  sellerId: string;
  title: string;
  author: string | null;
  isbn: string | null;
  description: string | null;
  priceCents: number;
  conditionGrade: BookCondition;
  status: BookStatus;
  rejectReason: string | null;
  coverImageKey: string | null;
  imageKeys: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BookListResult {
  items: BookDTO[];
  nextCursor: string | null;
}

export type {
  CreateBookInput,
  UpdateBookInput,
  ListBooksQuery,
  ReviewBookInput,
} from '../schemas/book';
