import type { BookDTO } from '@rebook/shared';
import type { BookRow } from '../../db/schema/books';

export function toBookDTO(row: BookRow): BookDTO {
  return {
    id: row.id,
    sellerId: row.sellerId,
    title: row.title,
    author: row.author,
    isbn: row.isbn,
    description: row.description,
    priceCents: row.priceCents,
    conditionGrade: row.conditionGrade,
    status: row.status,
    rejectReason: row.rejectReason,
    coverImageKey: row.coverImageKey,
    imageKeys: row.imageKeys ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
