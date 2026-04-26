import {
  ERROR_CODES,
  type ListOrdersQuery,
  type PatchOrderInput,
} from '@rebook/shared';
import { AppError } from '../../lib/errors';
import type { AuthContext } from '../../lib/auth';
import { orderRepo } from './order.repo';
import { toOrderDTO } from './order.mapper';

export const orderService = {
  async list(userId: string, query: ListOrdersQuery) {
    const { items, nextCursor } = await orderRepo.listForParticipant(userId, query);
    const out = [];
    for (const o of items) {
      const lines = await orderRepo.listItems(o.id);
      out.push(toOrderDTO(o, lines));
    }
    return { items: out, nextCursor };
  },

  async getById(userId: string, id: string) {
    const order = await orderRepo.findById(id);
    if (!order) throw new AppError(ERROR_CODES.ORDER_NOT_FOUND, 404);
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    }
    const lines = await orderRepo.listItems(id);
    return toOrderDTO(order, lines);
  },

  async patch(user: AuthContext, id: string, input: PatchOrderInput) {
    const order = await orderRepo.findById(id);
    if (!order) throw new AppError(ERROR_CODES.ORDER_NOT_FOUND, 404);
    const isBuyer = order.buyerId === user.id;
    const isSeller = order.sellerId === user.id;
    if (!isBuyer && !isSeller) throw new AppError(ERROR_CODES.FORBIDDEN, 403);

    if (input.status === 'awaiting_handover') {
      if (!isSeller) throw new AppError(ERROR_CODES.FORBIDDEN, 403);
      if (order.status !== 'paid') {
        throw new AppError(ERROR_CODES.INVALID_INPUT, 400, 'Order must be paid first');
      }
      const row = await orderRepo.update(id, {
        status: 'awaiting_handover',
        fulfillmentNote: input.fulfillmentNote ?? order.fulfillmentNote,
        pickupLatitude:
          input.pickupLatitude != null ? String(input.pickupLatitude) : order.pickupLatitude,
        pickupLongitude:
          input.pickupLongitude != null ? String(input.pickupLongitude) : order.pickupLongitude,
        pickupPoiName: input.pickupPoiName ?? order.pickupPoiName,
        pickupAddress: input.pickupAddress ?? order.pickupAddress,
      });
      const lines = await orderRepo.listItems(id);
      return toOrderDTO(row!, lines);
    }

    if (input.status === 'completed') {
      if (order.status !== 'awaiting_handover' && order.status !== 'paid') {
        throw new AppError(ERROR_CODES.INVALID_INPUT, 400, 'Invalid state for completion');
      }
      await orderRepo.update(id, { status: 'completed' });
      await orderRepo.setBooksStatusForOrder(id, 'SOLD');
      const row = await orderRepo.findById(id);
      const lines = await orderRepo.listItems(id);
      return toOrderDTO(row!, lines);
    }

    if (
      input.fulfillmentNote !== undefined ||
      input.pickupAddress !== undefined ||
      input.pickupPoiName !== undefined ||
      input.pickupLatitude !== undefined ||
      input.pickupLongitude !== undefined
    ) {
      if (!isSeller) throw new AppError(ERROR_CODES.FORBIDDEN, 403);
      if (order.status !== 'paid' && order.status !== 'awaiting_handover') {
        throw new AppError(ERROR_CODES.INVALID_INPUT, 400);
      }
      const row = await orderRepo.update(id, {
        fulfillmentNote: input.fulfillmentNote ?? order.fulfillmentNote,
        pickupLatitude:
          input.pickupLatitude != null ? String(input.pickupLatitude) : order.pickupLatitude,
        pickupLongitude:
          input.pickupLongitude != null ? String(input.pickupLongitude) : order.pickupLongitude,
        pickupPoiName: input.pickupPoiName ?? order.pickupPoiName,
        pickupAddress: input.pickupAddress ?? order.pickupAddress,
      });
      const lines = await orderRepo.listItems(id);
      return toOrderDTO(row!, lines);
    }

    const lines = await orderRepo.listItems(id);
    return toOrderDTO(order, lines);
  },

  async cancel(userId: string, id: string) {
    const order = await orderRepo.findById(id);
    if (!order) throw new AppError(ERROR_CODES.ORDER_NOT_FOUND, 404);
    if (order.buyerId !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    if (order.status !== 'pending_payment') {
      throw new AppError(ERROR_CODES.INVALID_INPUT, 400, 'Only unpaid orders can be cancelled');
    }
    await orderRepo.update(id, { status: 'cancelled' });
    await orderRepo.setBooksStatusForOrder(id, 'ON_SALE');
    const row = await orderRepo.findById(id);
    const lines = await orderRepo.listItems(id);
    return toOrderDTO(row!, lines);
  },

  async markPaidMock(orderId: string, idempotencyKey: string) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new AppError(ERROR_CODES.ORDER_NOT_FOUND, 404);
    if (order.status !== 'pending_payment') {
      return orderRepo.findById(orderId).then(async (o) => ({
        order: toOrderDTO(o!, await orderRepo.listItems(orderId)),
        alreadyPaid: true as const,
      }));
    }
    const row = await orderRepo.update(orderId, {
      status: 'paid',
      paymentChannel: 'mock',
      paymentIdempotencyKey: idempotencyKey,
    });
    const lines = await orderRepo.listItems(orderId);
    return { order: toOrderDTO(row!, lines), alreadyPaid: false as const };
  },
};
