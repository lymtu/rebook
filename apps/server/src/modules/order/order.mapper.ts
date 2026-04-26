import type { OrderDTO, OrderItemDTO } from '@rebook/shared';
import type { OrderItemRow, OrderRow } from '../../db/schema/orders';

function numOrNull(v: string | null): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function toOrderItemDTO(row: OrderItemRow): OrderItemDTO {
  return {
    id: row.id,
    bookId: row.bookId,
    titleSnapshot: row.titleSnapshot,
    priceCents: row.priceCents,
    quantity: row.quantity,
  };
}

export function toOrderDTO(row: OrderRow, items: OrderItemRow[]): OrderDTO {
  return {
    id: row.id,
    buyerId: row.buyerId,
    sellerId: row.sellerId,
    status: row.status,
    paymentChannel: row.paymentChannel,
    feeRateBpsSnapshot: row.feeRateBpsSnapshot,
    subtotalCents: row.subtotalCents,
    platformFeeCents: row.platformFeeCents,
    totalCents: row.totalCents,
    fulfillmentNote: row.fulfillmentNote,
    pickupLatitude: numOrNull(row.pickupLatitude),
    pickupLongitude: numOrNull(row.pickupLongitude),
    pickupPoiName: row.pickupPoiName,
    pickupAddress: row.pickupAddress,
    items: items.map(toOrderItemDTO),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
