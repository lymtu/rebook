---
name: image-upload
description: Implements or modifies book image upload flows across `apps/server`, `apps/web`, and `apps/miniapp`. Use when handling file uploads, signed URLs, presigned POST policies, image compression, thumbnail generation, or anything that puts user-supplied images into object storage (Tencent COS by default).
---

# image-upload

Images never go through the API server — clients upload directly to object storage with a short-lived signed URL or signed POST policy issued by the server. The server only stores the resulting **object key** (e.g. `books/2026/04/abc123.jpg`).

## Read first

- `apps/server/src/lib/storage/index.ts` — `StorageProvider` interface
- `apps/server/src/lib/storage/cos.ts` — Tencent COS implementation (default)
- `apps/server/src/modules/upload/upload.routes.ts` — `/uploads/sign` endpoint
- `apps/server/src/env.ts` — required env vars (`COS_*`, `STORAGE_BUCKET`, `STORAGE_REGION`)
- `apps/web/src/features/upload/api.ts` and `apps/miniapp/src/services/upload.ts`
- `packages/shared/src/schemas/upload.ts` — sign request/response shapes

## Architecture

```mermaid
sequenceDiagram
    participant C as Client (Web / Miniapp)
    participant S as Server (/uploads/sign)
    participant O as Object Storage (COS)
    C->>S: POST /uploads/sign { contentType, size, scene }
    S->>S: validate user, contentType, size
    S->>C: { uploadUrl, key, headers, expiresIn }
    C->>O: PUT uploadUrl (binary)
    C->>S: subsequent API call with key (e.g. POST /books { coverImageKey: key })
    S->>S: persist key; never trust raw URLs
```

## StorageProvider interface

Keep storage swappable so tests and local dev can use a stub.

```ts
// apps/server/src/lib/storage/index.ts
export interface SignedUpload {
  uploadUrl: string;
  key: string;
  headers: Record<string, string>;
  expiresIn: number; // seconds
}

export interface StorageProvider {
  signPutUrl(input: {
    key: string;
    contentType: string;
    contentLength: number;
    expiresIn?: number;
  }): Promise<SignedUpload>;

  buildPublicUrl(key: string): string;
  delete(key: string): Promise<void>;
}

export { cosStorage as storage } from './cos';
```

## Sign endpoint

```ts
// apps/server/src/modules/upload/upload.routes.ts
import { Elysia } from 'elysia';
import { signUploadInput } from '@rebook/shared';
import { requireAuth } from '../../lib/auth';
import { storage } from '../../lib/storage';
import { ulid } from 'ulid';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export const uploadRoutes = new Elysia({ prefix: '/uploads' })
  .use(requireAuth)
  .post('/sign', async ({ body, user }) => {
    const input = signUploadInput.parse(body);
    if (!ALLOWED_MIME.includes(input.contentType)) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, 400);
    }
    if (input.size > MAX_SIZE) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, 400);
    }
    const ext = input.contentType.split('/')[1];
    const key = `${input.scene}/${user.id}/${ulid()}.${ext}`;
    return storage.signPutUrl({
      key,
      contentType: input.contentType,
      contentLength: input.size,
      expiresIn: 300,
    });
  });
```

## Web client upload

```ts
// apps/web/src/features/upload/api.ts
export async function uploadImage(file: File, scene: 'book-cover' | 'avatar') {
  const sign = await api.post<SignedUpload>('/uploads/sign', {
    scene,
    contentType: file.type,
    size: file.size,
  });
  const compressed = await compressImage(file); // see below
  await fetch(sign.uploadUrl, {
    method: 'PUT',
    body: compressed,
    headers: { ...sign.headers, 'Content-Type': file.type },
  });
  return sign.key;
}
```

Compression with `browser-image-compression`:

```ts
import imageCompression from 'browser-image-compression';
function compressImage(file: File) {
  return imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true });
}
```

In a form, integrate with Ant Design's `Upload`:

```tsx
<Upload
  beforeUpload={async (file) => {
    const key = await uploadImage(file, 'book-cover');
    form.setFieldValue('coverImageKey', key);
    return false; // prevent AntD's default upload
  }}
/>
```

## Mini-program client upload

Use `Taro.chooseImage` + `Taro.uploadFile` (signed PUT requires `Taro.request` with `arrayBuffer`; many vendors instead accept POST with form policy — check the storage impl).

```ts
// apps/miniapp/src/services/upload.ts
import Taro from '@tarojs/taro';
import { api } from './request';

export async function pickAndUploadImage(scene: 'book-cover' | 'avatar') {
  const { tempFiles } = await Taro.chooseImage({ count: 1, sizeType: ['compressed'] });
  const file = tempFiles[0];
  const sign = await api.post<{ uploadUrl: string; key: string; headers: Record<string, string> }>(
    '/uploads/sign',
    { scene, contentType: 'image/jpeg', size: file.size },
  );
  const buf = await Taro.getFileSystemManager().readFileSync(file.path);
  await Taro.request({
    url: sign.uploadUrl,
    method: 'PUT',
    data: buf,
    header: { ...sign.headers, 'Content-Type': 'image/jpeg' },
  });
  return sign.key;
}
```

`Taro.chooseImage` with `sizeType: ['compressed']` already returns a downsized file; no extra compression library needed.

## Persisting and serving

- The server stores **only the key** in DB columns like `books.cover_image_key`.
- When returning to clients, expose either:
  - a public URL via `storage.buildPublicUrl(key)` for public buckets, or
  - a short-lived signed GET URL for private buckets.
- Build thumbnails by relying on COS image processing query params (e.g. `?imageMogr2/thumbnail/600x600`) — do NOT pre-generate variants.

## Workflow

```
- [ ] 1. shared: add upload DTO + Zod (use shared-types)
- [ ] 2. server: implement / extend storage provider if scene is new
- [ ] 3. server: extend /uploads/sign with scene-specific validation if needed
- [ ] 4. web: add helper in features/upload/api.ts; wire into form
- [ ] 5. miniapp: add helper in services/upload.ts; wire into page
- [ ] 6. After upload, store the returned `key` in the relevant DB column via the existing API
- [ ] 7. Verify display works for both new key and legacy keys
```

## Anti-patterns

- Uploading through the API server (multipart). Wastes bandwidth and Bun memory; always use direct-to-storage.
- Storing absolute URLs in DB. Store the **key** so you can switch buckets/CDNs later.
- Trusting client-supplied `contentType` for storage but not for validation. Validate against an allowlist server-side.
- Pre-generating multiple thumbnail sizes at upload time. Use COS image processing on demand.
- Returning the signed URL to the user as the canonical image URL. URLs expire; persist only the key.
- Letting unauthenticated users hit `/uploads/sign`. Always behind `requireAuth`.
