import { createAnnouncementInput, ERROR_CODES } from '@rebook/shared';
import { AppError } from '../../lib/errors';
import type { AuthContext } from '../../lib/auth';
import { announcementRepo } from './announcement.repo';
import { toAnnouncementDTO } from './announcement.mapper';

export const announcementService = {
  list() {
    return announcementRepo.listPublished(100).then((rows) => rows.map(toAnnouncementDTO));
  },

  async create(actor: AuthContext, raw: unknown) {
    if (actor.role !== 'admin' && actor.role !== 'super_admin') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    }
    const input = createAnnouncementInput.parse(raw);
    const row = await announcementRepo.insert({
      authorId: actor.id,
      title: input.title,
      body: input.body,
      pinSort: input.pinSort ?? 0,
    });
    return toAnnouncementDTO(row);
  },
};
