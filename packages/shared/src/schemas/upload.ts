import { z } from 'zod';

export const UPLOAD_SCENES = ['book-cover', 'book-image', 'avatar', 'dispute-evidence'] as const;
export type UploadScene = (typeof UPLOAD_SCENES)[number];

export const ALLOWED_UPLOAD_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const signUploadInput = z.object({
  scene: z.enum(UPLOAD_SCENES),
  contentType: z.enum(ALLOWED_UPLOAD_MIME),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});
export type SignUploadInput = z.infer<typeof signUploadInput>;
