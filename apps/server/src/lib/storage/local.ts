import type { SignedUploadResult } from '@rebook/shared';
import { env } from '../../env';
import type { SignPutInput, StorageProvider } from './index';

export const localStorage: StorageProvider = {
  async signPutUrl(input: SignPutInput): Promise<SignedUploadResult> {
    const base = env.COS_PUBLIC_BASE_URL || `http://localhost:9000/${env.STORAGE_BUCKET}`;
    return {
      uploadUrl: `${base}/${input.key}`,
      key: input.key,
      headers: { 'Content-Type': input.contentType },
      expiresIn: input.expiresIn ?? 300,
    };
  },
  buildPublicUrl(key: string): string {
    const base = env.COS_PUBLIC_BASE_URL || `http://localhost:9000/${env.STORAGE_BUCKET}`;
    return `${base}/${key}`;
  },
  async delete(_key: string): Promise<void> {
    // local stub: no-op
  },
};
