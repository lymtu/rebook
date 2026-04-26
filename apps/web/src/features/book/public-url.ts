/**
 * Public base for object keys from upload (same idea as server COS_PUBLIC_BASE_URL + bucket).
 * Set `VITE_PUBLIC_ASSET_BASE_URL` in `.env` so covers render, e.g. http://localhost:9000/rebook-dev
 */
export function publicAssetUrl(key: string | null | undefined): string | undefined {
  if (!key) return undefined;
  const base = import.meta.env.VITE_PUBLIC_ASSET_BASE_URL as string | undefined;
  if (!base) return undefined;
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}
