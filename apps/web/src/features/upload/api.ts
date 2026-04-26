import { ALLOWED_UPLOAD_MIME, type SignUploadInput, type SignedUploadResult } from '@rebook/shared';
import { api } from '@/lib/api';

function assertAllowedMime(contentType: string): SignUploadInput['contentType'] {
  const ok = (ALLOWED_UPLOAD_MIME as readonly string[]).includes(contentType);
  if (!ok) throw new Error('仅支持 JPEG / PNG / WebP');
  return contentType as SignUploadInput['contentType'];
}

export async function signUpload(input: SignUploadInput): Promise<SignedUploadResult> {
  return api.post<SignedUploadResult>('/uploads/sign', input);
}

/** Direct PUT to storage; returns nothing useful. */
export async function uploadWithSignedPut(file: File, sign: SignedUploadResult): Promise<void> {
  const res = await fetch(sign.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      ...sign.headers,
      'Content-Type': file.type,
    },
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }
}

export async function uploadBookImage(file: File): Promise<string> {
  const mime = file.type || 'image/jpeg';
  const sign = await signUpload({
    scene: 'book-cover',
    contentType: assertAllowedMime(mime),
    size: file.size,
  });
  await uploadWithSignedPut(file, sign);
  return sign.key;
}
