import type { SignedUploadResult } from '@rebook/shared';
import type { SignPutInput, StorageProvider } from './index';

/**
 * Tencent COS implementation stub.
 *
 * To enable, install `cos-nodejs-sdk-v5` and replace the body below with a
 * real signed PUT URL using {@link https://cloud.tencent.com/document/product/436/14048}.
 * Keep the public {@link StorageProvider} contract identical.
 */
export const cosStorage: StorageProvider = {
  async signPutUrl(_input: SignPutInput): Promise<SignedUploadResult> {
    throw new Error('cosStorage is not implemented yet. Use STORAGE_PROVIDER=local for now.');
  },
  buildPublicUrl(_key: string): string {
    throw new Error('cosStorage is not implemented yet.');
  },
  async delete(_key: string): Promise<void> {
    throw new Error('cosStorage is not implemented yet.');
  },
};
