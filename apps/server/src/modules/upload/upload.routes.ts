import { Elysia, t } from 'elysia';
import { signUploadInput } from '@rebook/shared';
import { ulid } from 'ulid';
import { requireAuth } from '../../lib/auth';
import { storage } from '../../lib/storage';

export const uploadRoutes = new Elysia({ prefix: '/uploads', tags: ['uploads'] })
  .use(requireAuth)
  .post(
    '/sign',
    async ({ body, user }) => {
      const input = signUploadInput.parse(body);
      const ext = input.contentType.split('/')[1] ?? 'bin';
      const key = `${input.scene}/${user.id}/${ulid()}.${ext}`;
      return storage.signPutUrl({
        key,
        contentType: input.contentType,
        contentLength: input.size,
        expiresIn: 300,
      });
    },
    { body: t.Any() },
  );
