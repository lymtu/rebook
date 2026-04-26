import type { OrderStatus, PaymentChannel } from '../constants/order';

export interface OrderItemDTO {
  id: string;
  bookId: string;
  titleSnapshot: string;
  priceCents: number;
  quantity: number;
}

export interface OrderDTO {
  id: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  paymentChannel: PaymentChannel | null;
  feeRateBpsSnapshot: number;
  subtotalCents: number;
  platformFeeCents: number;
  totalCents: number;
  fulfillmentNote: string | null;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  pickupPoiName: string | null;
  pickupAddress: string | null;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
}

export type { ListOrdersQuery, PatchOrderInput } from '../schemas/order';
