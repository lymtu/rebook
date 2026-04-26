import { Elysia, t } from 'elysia';
import { openDisputeInput, resolveDisputeInput } from '@rebook/shared';
import { requireAuth } from '../../lib/auth';
import { disputeService } from './dispute.service';

export const disputeRoutes = new Elysia({ prefix: '/disputes', tags: ['disputes'] })
  .use(requireAuth)
  .post('/', async ({ body, user }) => {
    const input = openDisputeInput.parse(body);
    return disputeService.open(user.id, input);
  }, { body: t.Any() })
  .get('/open', async ({ user }) => disputeService.listOpen(user))
  .post(
    '/:id/resolve',
    async ({ params, body, user }) => {
      const input = resolveDisputeInput.parse(body);
      return disputeService.resolve(user, params.id, input);
    },
    { params: t.Object({ id: t.String() }), body: t.Any() },
  );
