import { Elysia, t } from 'elysia';
import {
  adminSetUserStatusInput,
  promoteUserInput,
  reviewBookInput,
  listBooksQuery,
} from '@rebook/shared';
import { requireAuth } from '../../lib/auth';
import { ensureRole } from '../../lib/auth';
import { bookService } from '../book/book.service';
import { adminService } from './admin.service';

export const adminRoutes = new Elysia({ prefix: '/admin', tags: ['admin'] })
  .use(requireAuth)
  .get(
    '/users',
    async ({ query, user }) => {
      ensureRole(user, ['admin', 'super_admin']);
      const limit = query.limit != null ? Number(query.limit) : 80;
      return adminService.listUsers(Number.isFinite(limit) ? limit : 80);
    },
    { query: t.Object({ limit: t.Optional(t.Numeric()) }) },
  )
  .get(
    '/books',
    async ({ query, user }) => {
      ensureRole(user, ['admin', 'super_admin']);
      const q = listBooksQuery.parse({
        q: query.q,
        cursor: query.cursor,
        limit: query.limit != null ? Number(query.limit) : 20,
      });
      return bookService.listPendingReview({ ...q, status: 'PENDING_REVIEW' });
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
    '/books/:id/review',
    async ({ params, body, user }) => {
      const input = reviewBookInput.parse(body);
      return adminService.reviewBook(user, params.id, input);
    },
    { params: t.Object({ id: t.String() }), body: t.Any() },
  )
  .patch(
    '/users/:id',
    async ({ params, body, user }) => {
      const input = adminSetUserStatusInput.parse(body);
      return adminService.setUserStatus(user, params.id, input);
    },
    { params: t.Object({ id: t.String() }), body: t.Any() },
  )
  .post(
    '/promote',
    async ({ body, user }) => {
      ensureRole(user, ['super_admin']);
      const input = promoteUserInput.parse(body);
      return adminService.promote(user, input);
    },
    { body: t.Any() },
  );
