export type { SignUploadInput, UploadScene } from '../schemas/upload';

export interface SignedUploadResult {
  uploadUrl: string;
  key: string;
  headers: Record<string, string>;
  expiresIn: number;
}
