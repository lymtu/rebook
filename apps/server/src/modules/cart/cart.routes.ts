import { Elysia, t } from 'elysia';
import { addCartItemInput } from '@rebook/shared';
import { requireAuth } from '../../lib/auth';
import { cartService } from './cart.service';

export const cartRoutes = new Elysia({ prefix: '/cart', tags: ['cart'] })
  .use(requireAuth)
  .get('/', async ({ user }) => cartService.list(user.id))
  .post(
    '/items',
    async ({ body, user }) => {
      const input = addCartItemInput.parse(body);
      return cartService.add(user.id, input);
    },
    { body: t.Any() },
  )
  .delete(
    '/items/:bookId',
    async ({ params, user }) => cartService.remove(user.id, params.bookId),
    { params: t.Object({ bookId: t.String() }) },
  )
  .post('/checkout', async ({ user }) => cartService.checkout(user.id));
