import Taro from '@tarojs/taro';
import { ERROR_CODES, type ApiErrorBody, type ErrorCode } from '@rebook/shared';

const BASE_URL = process.env.TARO_APP_API_BASE_URL ?? 'http://localhost:3000';
const TOKEN_STORAGE_KEY = 'rebook:token';

export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function setToken(token: string | null) {
  if (token) Taro.setStorageSync(TOKEN_STORAGE_KEY, token);
  else Taro.removeStorageSync(TOKEN_STORAGE_KEY);
}

export function getToken(): string | null {
  return (Taro.getStorageSync(TOKEN_STORAGE_KEY) as string | undefined) || null;
}

interface RequestOptions<TBody = unknown> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: TBody;
  header?: Record<string, string>;
}

async function request<T>(opts: RequestOptions): Promise<T> {
  const token = getToken();
  const res = await Taro.request<T | ApiErrorBody>({
    url: `${BASE_URL}${opts.url}`,
    method: opts.method ?? 'GET',
    data: opts.data,
    header: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.header ?? {}),
    },
  });

  if (res.statusCode >= 400) {
    const body = res.data as ApiErrorBody | null;
    throw new ApiError(
      body?.error?.code ?? ERROR_CODES.INTERNAL,
      body?.error?.message ?? `HTTP ${res.statusCode}`,
      res.statusCode,
      body?.error?.details,
    );
  }
  return res.data as T;
}

export const api = {
  get: <T>(url: string) => request<T>({ url }),
  post: <T>(url: string, data?: unknown) => request<T>({ url, method: 'POST', data }),
  put: <T>(url: string, data?: unknown) => request<T>({ url, method: 'PUT', data }),
  patch: <T>(url: string, data?: unknown) => request<T>({ url, method: 'PATCH', data }),
  del: <T>(url: string) => request<T>({ url, method: 'DELETE' }),
};
