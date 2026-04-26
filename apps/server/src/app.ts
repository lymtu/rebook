import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { ZodError } from 'zod';
import { ERROR_CODES, type ApiErrorBody } from '@rebook/shared';
import { env } from './env';
import { logger } from './lib/logger';
import { AppError, isAppError } from './lib/errors';
import { adminRoutes } from './modules/admin/admin.routes';
import { announcementRoutes } from './modules/announcement/announcement.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { bookRoutes } from './modules/book/book.routes';
import { cartRoutes } from './modules/cart/cart.routes';
import { disputeRoutes } from './modules/dispute/dispute.routes';
import { feeRoutes } from './modules/fee/fee.routes';
import { orderRoutes } from './modules/order/order.routes';
import { paymentRoutes } from './modules/payment/payment.routes';
import { uploadRoutes } from './modules/upload/upload.routes';
import { userRoutes } from './modules/user/user.routes';

export const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    }),
  )
  .use(
    swagger({
      path: '/docs',
      documentation: {
        info: { title: 'rebook API', version: '0.0.0' },
      },
    }),
  )
  .onError(({ error, set, code }): ApiErrorBody => {
    if (error instanceof ZodError) {
      set.status = 400;
      return {
        error: {
          code: ERROR_CODES.INVALID_INPUT,
          message: 'Invalid input',
          details: error.flatten(),
        },
      };
    }
    if (isAppError(error)) {
      set.status = error.status;
      return {
        error: { code: error.code, message: error.message, details: error.details },
      };
    }
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: { code: ERROR_CODES.INVALID_INPUT, message: 'Not Found' } };
    }
    logger.error({ err: error }, 'Unhandled error');
    set.status = 500;
    return { error: { code: ERROR_CODES.INTERNAL, message: 'Internal Server Error' } };
  })
  .get('/', () => ({ name: 'rebook-api', status: 'ok' }))
  .get('/health', () => ({ status: 'ok', uptime: process.uptime() }))
  .use(authRoutes)
  .use(userRoutes)
  .use(uploadRoutes)
  .use(bookRoutes)
  .use(cartRoutes)
  .use(orderRoutes)
  .use(paymentRoutes)
  .use(feeRoutes)
  .use(announcementRoutes)
  .use(disputeRoutes)
  .use(adminRoutes);

export type App = typeof app;
