import { ERROR_CODES, type OpenDisputeInput, type ResolveDisputeInput } from '@rebook/shared';
import { AppError } from '../../lib/errors';
import type { AuthContext } from '../../lib/auth';
import { orderRepo } from '../order/order.repo';
import { disputeRepo } from './dispute.repo';
import { toDisputeDTO } from './dispute.mapper';

export const disputeService = {
  async open(userId: string, input: OpenDisputeInput) {
    const order = await orderRepo.findById(input.orderId);
    if (!order) throw new AppError(ERROR_CODES.ORDER_NOT_FOUND, 404);
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    }
    const existing = await disputeRepo.findOpenByOrder(input.orderId);
    if (existing) throw new AppError(ERROR_CODES.CONFLICT, 409, 'Dispute already open');

    const row = await disputeRepo.insert({
      orderId: input.orderId,
      openedByUserId: userId,
      reason: input.reason,
      evidenceKeys: input.evidenceKeys ?? [],
    });
    return toDisputeDTO(row);
  },

  listOpen(actor: AuthContext) {
    if (actor.role !== 'admin' && actor.role !== 'super_admin') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    }
    return disputeRepo.listOpen().then((rows) => rows.map(toDisputeDTO));
  },

  async resolve(actor: AuthContext, disputeId: string, input: ResolveDisputeInput) {
    if (actor.role !== 'admin' && actor.role !== 'super_admin') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    }
    const d = await disputeRepo.findById(disputeId);
    if (!d) throw new AppError(ERROR_CODES.DISPUTE_NOT_FOUND, 404);
    if (d.status !== 'open') throw new AppError(ERROR_CODES.INVALID_INPUT, 400);
    const row = await disputeRepo.update(disputeId, {
      status: 'resolved',
      handledByUserId: actor.id,
      resolution: input.resolution,
    });
    return toDisputeDTO(row!);
  },
};
