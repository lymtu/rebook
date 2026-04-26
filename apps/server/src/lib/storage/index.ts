import type { SignedUploadResult } from '@rebook/shared';
import { env } from '../../env';
import { localStorage } from './local';
import { cosStorage } from './cos';

export interface SignPutInput {
  key: string;
  contentType: string;
  contentLength: number;
  expiresIn?: number;
}

export interface StorageProvider {
  signPutUrl(input: SignPutInput): Promise<SignedUploadResult>;
  buildPublicUrl(key: string): string;
  delete(key: string): Promise<void>;
}

export const storage: StorageProvider =
  env.STORAGE_PROVIDER === 'cos' ? cosStorage : localStorage;
