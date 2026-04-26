import { Elysia, t } from 'elysia';
import { createBookInput, listBooksQuery, updateBookInput } from '@rebook/shared';
import { authPlugin, requireAuth } from '../../lib/auth';
import type { AuthContext } from '../../lib/auth';
import { bookService } from './book.service';

const optionalViewer = new Elysia({ name: 'optionalViewer' })
  .use(authPlugin)
  .derive({ as: 'scoped' }, async ({ jwt, cookie, headers }): Promise<{ viewer: AuthContext | null }> => {
    const bearer = headers.authorization?.replace(/^Bearer\s+/i, '');
    const raw = cookie.token?.value ?? bearer;
    if (typeof raw !== 'string' || raw.length === 0) return { viewer: null };
    const payload = (await jwt.verify(raw)) as { sub?: string; role?: AuthContext['role'] } | false;
    if (!payload || typeof payload === 'boolean' || !payload.sub || !payload.role) {
      return { viewer: null };
    }
    return { viewer: { id: payload.sub, role: payload.role } };
  });

const bookProtected = new Elysia({ name: 'bookProtected' })
  .use(requireAuth)
  .get(
    '/mine',
    async ({ query, user }) => {
      const q = listBooksQuery.parse({
        q: query.q,
        status: query.status,
        cursor: query.cursor,
        limit: query.limit != null ? Number(query.limit) : 20,
      });
      return bookService.listMine(user.id, q);
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
        status: t.Optional(t.String()),
        cursor: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
      }),
    },
  )
  .post(
    '/',
    async ({ body, user }) => {
      const input = createBookInput.parse(body);
      return bookService.create(user.id, input);
    },
    { body: t.Any() },
  )
  .patch(
    '/:id',
    async ({ params, body, user }) => {
      const input = updateBookInput.parse(body);
      return bookService.update(user.id, params.id, input);
    },
    { params: t.Object({ id: t.String() }), body: t.Any() },
  )
  .delete('/:id', async ({ params, user }) => bookService.remove(user.id, params.id), {
    params: t.Object({ id: t.String() }),
  });

export const bookRoutes = new Elysia({ prefix: '/books', tags: ['books'] })
  .use(optionalViewer)
  .get(
    '/',
    async ({ query, viewer }) => {
      const q = listBooksQuery.parse({
        q: query.q,
        sellerId: query.sellerId,
        status: query.status,
        cursor: query.cursor,
        limit: query.limit != null ? Number(query.limit) : 20,
      });
      if (q.sellerId) {
        if (viewer?.id === q.sellerId) {
          return bookService.listMine(q.sellerId, q);
        }
        return bookService.listSellerStore(q.sellerId, q);
      }
      return bookService.listPublic(q);
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
        sellerId: t.Optional(t.String()),
        status: t.Optional(t.String()),
        cursor: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
      }),
    },
  )
  .use(bookProtected)
  .get('/:id', async ({ params, viewer }) => bookService.getById(params.id, viewer), {
    params: t.Object({ id: t.String() }),
  });
