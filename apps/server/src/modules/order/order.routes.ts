import { Elysia, t } from 'elysia';
import { listOrdersQuery, patchOrderInput } from '@rebook/shared';
import { requireAuth } from '../../lib/auth';
import { orderService } from './order.service';

export const orderRoutes = new Elysia({ prefix: '/orders', tags: ['orders'] })
  .use(requireAuth)
  .get(
    '/',
    async ({ query, user }) => {
      const q = listOrdersQuery.parse({
        as: query.as,
        status: query.status,
        cursor: query.cursor,
        limit: query.limit != null ? Number(query.limit) : 20,
      });
      return orderService.list(user.id, q);
    },
    {
      query: t.Object({
        as: t.Optional(t.String()),
        status: t.Optional(t.String()),
        cursor: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
      }),
    },
  )
  .get('/:id', async ({ params, user }) => orderService.getById(user.id, params.id), {
    params: t.Object({ id: t.String() }),
  })
  .patch(
    '/:id',
    async ({ params, body, user }) => {
      const input = patchOrderInput.parse(body);
      return orderService.patch(user, params.id, input);
    },
    { params: t.Object({ id: t.String() }), body: t.Any() },
  )
  .post('/:id/cancel', async ({ params, user }) => orderService.cancel(user.id, params.id), {
    params: t.Object({ id: t.String() }),
  });
