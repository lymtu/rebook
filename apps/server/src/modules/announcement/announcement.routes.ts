import { Elysia, t } from 'elysia';
import { requireAuth } from '../../lib/auth';
import { announcementService } from './announcement.service';

export const announcementRoutes = new Elysia({ prefix: '/announcements', tags: ['announcements'] })
  .get('/', async () => announcementService.list())
  .use(requireAuth)
  .post('/', async ({ body, user }) => announcementService.create(user, body), { body: t.Any() });
