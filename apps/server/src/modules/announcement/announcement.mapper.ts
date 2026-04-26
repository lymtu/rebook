import type { AnnouncementDTO } from '@rebook/shared';
import type { AnnouncementRow } from '../../db/schema/announcements';

export function toAnnouncementDTO(row: AnnouncementRow): AnnouncementDTO {
  return {
    id: row.id,
    authorId: row.authorId,
    title: row.title,
    body: row.body,
    pinSort: row.pinSort,
    createdAt: row.createdAt.toISOString(),
  };
}
