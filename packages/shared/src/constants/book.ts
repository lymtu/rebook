export const BOOK_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'ACCEPTABLE'] as const;
export type BookCondition = (typeof BOOK_CONDITIONS)[number];

export const BOOK_CONDITION_LABEL: Record<BookCondition, string> = {
  NEW: '全新',
  LIKE_NEW: '九成新',
  GOOD: '七成新',
  ACCEPTABLE: '可接受',
};

/** Listing lifecycle: admin reviews pending items; on_sale is publicly visible. */
export const BOOK_STATUSES = [
  'PENDING_REVIEW',
  'ON_SALE',
  'REJECTED',
  'RESERVED',
  'SOLD',
  'REMOVED',
] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

/** Short labels for seller / admin UI */
export const BOOK_STATUS_LABEL: Record<BookStatus, string> = {
  PENDING_REVIEW: '待审核',
  ON_SALE: '在售',
  REJECTED: '已驳回',
  RESERVED: '已预订',
  SOLD: '已售出',
  REMOVED: '已下架',
};

export const MAX_BOOK_TITLE_LENGTH = 200;
export const MAX_BOOK_DESCRIPTION_LENGTH = 2000;
