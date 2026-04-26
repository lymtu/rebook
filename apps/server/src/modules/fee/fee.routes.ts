import { Elysia, t } from 'elysia';
import { proposeFeeInput, reviewFeeInput } from '@rebook/shared';
import { ensureRole, requireAuth } from '../../lib/auth';
import { feeService } from './fee.service';

export const feeRoutes = new Elysia({ prefix: '/fee', tags: ['fee'] })
  .get('/effective', async () => feeService.effectiveRate())
  .use(requireAuth)
  .get('/proposals', async ({ user }) => {
    ensureRole(user, ['admin', 'super_admin']);
    return feeService.listHistory();
  })
  .post(
    '/proposals',
    async ({ body, user }) => {
      ensureRole(user, ['admin', 'super_admin']);
      const input = proposeFeeInput.parse(body);
      return feeService.propose(user, input);
    },
    { body: t.Any() },
  )
  .post(
    '/proposals/:id/review',
    async ({ params, body, user }) => {
      ensureRole(user, ['super_admin']);
      const input = reviewFeeInput.parse(body);
      return feeService.review(user, params.id, input);
    },
    { params: t.Object({ id: t.String() }), body: t.Any() },
  );
