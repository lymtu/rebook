export interface AnnouncementDTO {
  id: string;
  authorId: string;
  title: string;
  body: string;
  pinSort: number;
  createdAt: string;
}

export type { CreateAnnouncementInput } from '../schemas/announcement';
