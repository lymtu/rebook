import { z } from 'zod';
import { ORDER_STATUSES } from '../constants/order';

export const listOrdersQuery = z.object({
  as: z.enum(['buyer', 'seller']).optional(),
  status: z.enum(ORDER_STATUSES).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListOrdersQuery = z.infer<typeof listOrdersQuery>;

export const patchOrderInput = z.object({
  status: z.enum(['awaiting_handover', 'completed']).optional(),
  fulfillmentNote: z.string().max(1000).optional(),
  pickupLatitude: z.number().optional(),
  pickupLongitude: z.number().optional(),
  pickupPoiName: z.string().max(200).optional(),
  pickupAddress: z.string().max(500).optional(),
});
export type PatchOrderInput = z.infer<typeof patchOrderInput>;
