import { Elysia, t } from 'elysia';
import { z } from 'zod';
import { ERROR_CODES } from '@rebook/shared';
import { env } from '../../env';
import { AppError } from '../../lib/errors';
import { requireAuth } from '../../lib/auth';
import { orderRepo } from '../order/order.repo';
import { orderService } from '../order/order.service';

const mockConfirmBody = z.object({
  orderId: z.string().min(1),
  token: z.string().min(1),
});

export const paymentRoutes = new Elysia({ prefix: '/payments', tags: ['payments'] })
  .use(requireAuth)
  .post(
    '/orders/:orderId/prepare',
    async ({ params, user }) => {
      const order = await orderRepo.findById(params.orderId);
      if (!order || order.buyerId !== user.id) throw new AppError(ERROR_CODES.ORDER_NOT_FOUND, 404);
      if (order.status !== 'pending_payment') {
        throw new AppError(ERROR_CODES.INVALID_INPUT, 400, 'Order is not awaiting payment');
      }
      return {
        channel: 'mock' as const,
        orderId: order.id,
        mockConfirmToken: `${order.id}:${user.id}`,
      };
    },
    { params: t.Object({ orderId: t.String() }) },
  )
  .post(
    '/mock/confirm',
    async ({ body, user }) => {
      if (env.NODE_ENV === 'production') {
        throw new AppError(ERROR_CODES.FORBIDDEN, 403, 'Not available in production');
      }
      const parsed = mockConfirmBody.parse(body);
      if (parsed.token !== `${parsed.orderId}:${user.id}`) {
        throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
      }
      const order = await orderRepo.findById(parsed.orderId);
      if (!order || order.buyerId !== user.id) throw new AppError(ERROR_CODES.ORDER_NOT_FOUND, 404);
      return orderService.markPaidMock(parsed.orderId, `mock-${parsed.orderId}`);
    },
    { body: t.Any() },
  );
