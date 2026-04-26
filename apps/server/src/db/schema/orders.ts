import { index, integer, pgEnum, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { ORDER_STATUSES, PAYMENT_CHANNELS } from '@rebook/shared';
import { generateId, timestamps } from './_shared';
import { books } from './books';
import { users } from './users';

export const orderStatusEnum = pgEnum('order_status', ORDER_STATUSES);
export const paymentChannelEnum = pgEnum('payment_channel', PAYMENT_CHANNELS);

export const orders = pgTable(
  'orders',
  {
    id: text('id').primaryKey().$defaultFn(generateId),
    buyerId: text('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    sellerId: text('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    status: orderStatusEnum('status').notNull().default('pending_payment'),
    paymentChannel: paymentChannelEnum('payment_channel'),
    paymentIdempotencyKey: text('payment_idempotency_key'),
    feeRateBpsSnapshot: integer('fee_rate_bps_snapshot').notNull(),
    subtotalCents: integer('subtotal_cents').notNull(),
    platformFeeCents: integer('platform_fee_cents').notNull(),
    totalCents: integer('total_cents').notNull(),
    fulfillmentNote: text('fulfillment_note'),
    pickupLatitude: text('pickup_latitude'),
    pickupLongitude: text('pickup_longitude'),
    pickupPoiName: text('pickup_poi_name'),
    pickupAddress: text('pickup_address'),
    ...timestamps,
  },
  (t) => ({
    buyerIdx: index('orders_buyer_id_idx').on(t.buyerId),
    sellerIdx: index('orders_seller_id_idx').on(t.sellerId),
    statusIdx: index('orders_status_idx').on(t.status),
    payKeyUq: uniqueIndex('orders_payment_idempotency_key_uq').on(t.paymentIdempotencyKey),
  }),
);

export const orderItems = pgTable(
  'order_items',
  {
    id: text('id').primaryKey().$defaultFn(generateId),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'restrict' }),
    titleSnapshot: text('title_snapshot').notNull(),
    priceCents: integer('price_cents').notNull(),
    quantity: integer('quantity').notNull().default(1),
    ...timestamps,
  },
  (t) => ({
    orderIdx: index('order_items_order_id_idx').on(t.orderId),
  }),
);

export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
export type OrderItemRow = typeof orderItems.$inferSelect;
