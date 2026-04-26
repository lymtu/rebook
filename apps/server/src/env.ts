import { z } from 'zod';

/** 本地无 `.env` 时也能起服务；与 docker-compose 中 Postgres 一致。生产环境必须在环境中显式设置。 */
function withDevDefaults (env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const out = { ...env };
  const isProd = env.NODE_ENV === 'production';
  if (isProd) {
    return out;
  }
  if (!out.DATABASE_URL) {
    out.DATABASE_URL = 'postgres://rebook:rebook@127.0.0.1:5432/rebook';
    console.info('[env] DATABASE_URL 未设置，使用本机开发默认（与 docker-compose 中 postgres 一致）');
  }
  if (!out.JWT_SECRET) {
    out.JWT_SECRET = 'rebook-dev-jwt-secret-do-not-use-in-prod-32b';
    console.info('[env] JWT_SECRET 未设置，使用仅用于开发的占位值，部署前请配置正式密钥');
  }
  return out;
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),

  WX_APPID: z.string().default(''),
  WX_SECRET: z.string().default(''),

  STORAGE_PROVIDER: z.enum(['local', 'cos']).default('local'),
  STORAGE_BUCKET: z.string().default('rebook-dev'),
  STORAGE_REGION: z.string().default('ap-shanghai'),
  COS_SECRET_ID: z.string().default(''),
  COS_SECRET_KEY: z.string().default(''),
  COS_PUBLIC_BASE_URL: z.string().default(''),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),
});

const parsed = envSchema.safeParse(withDevDefaults(process.env));
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
