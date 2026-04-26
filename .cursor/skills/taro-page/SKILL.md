---
name: taro-page
description: Creates or modifies pages, components, and services in `apps/miniapp` (Taro 4 + React + TypeScript + NutUI-React-Taro). Use when adding mini-program pages, tabbar entries, components, `wx.*` integrations, or anything compiled by Taro for WeChat / Alipay / TikTok mini-programs.
---

# taro-page

The mini-program targets WeChat first; Taro is the cross-end framework. Pages must use `Taro.*` APIs (not `window`/`document`/`fetch`) so the same code can compile to other mini-program platforms.

## Read first

- `apps/miniapp/src/app.config.ts` — page registry, tabbar, window options
- `apps/miniapp/src/app.tsx` — root component, providers
- `apps/miniapp/src/services/request.ts` — `Taro.request` wrapper with auth + base URL
- `apps/miniapp/src/services/auth.ts` — `wx.login` flow
- `apps/miniapp/project.config.json` — appId, mini-program project settings
- `packages/shared/src/api/<domain>.ts` — DTOs you must reuse

## Folder layout

```
apps/miniapp/src/
├── app.tsx
├── app.config.ts                # global registration: pages, tabbar
├── pages/
│   └── <page>/
│       ├── index.tsx
│       ├── index.config.ts      # page-level config (title, navStyle)
│       └── index.module.scss    # optional, scoped styles
├── components/                  # cross-page components
├── services/                    # API + login wrappers
├── stores/                      # Zustand stores (compatible with Taro)
├── lib/                         # helpers (formatters, hooks)
└── types/                       # local-only types (rare)
```

## Adding a page

1. Create `apps/miniapp/src/pages/<page>/index.tsx`:

   ```tsx
   import { View, Text } from '@tarojs/components';
   import { Button } from '@nutui/nutui-react-taro';
   import { useLoad } from '@tarojs/taro';
   import { useEffect, useState } from 'react';
   import type { BookDTO } from '@rebook/shared';
   import { fetchBook } from '@/services/book';

   export default function BookDetailPage() {
     const [book, setBook] = useState<BookDTO | null>(null);

     useLoad((options) => {
       fetchBook(options.id as string).then(setBook);
     });

     if (!book) return <View>加载中...</View>;
     return (
       <View className="page">
         <Text className="title">{book.title}</Text>
         <Button type="primary">联系卖家</Button>
       </View>
     );
   }
   ```

2. Create `apps/miniapp/src/pages/<page>/index.config.ts`:

   ```ts
   export default definePageConfig({
     navigationBarTitleText: '书籍详情',
   });
   ```

3. Register the page in `apps/miniapp/src/app.config.ts`:

   ```ts
   export default defineAppConfig({
     pages: [
       'pages/home/index',
       'pages/book-detail/index',  // add here
     ],
     tabBar: {
       list: [
         { pagePath: 'pages/home/index', text: '首页', /* iconPath, selectedIconPath */ },
         { pagePath: 'pages/me/index', text: '我的' },
       ],
     },
   });
   ```

## API client

Wrap `Taro.request` once and reuse everywhere. Never call `Taro.request` directly from a page.

```ts
// apps/miniapp/src/services/request.ts
import Taro from '@tarojs/taro';
import { ERROR_CODES, type ErrorCode } from '@rebook/shared';

const BASE_URL = process.env.TARO_APP_API_BASE_URL!;

export class ApiError extends Error {
  constructor(public code: ErrorCode, message: string, public status: number) {
    super(message);
  }
}

async function request<T>(opts: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
}): Promise<T> {
  const token = Taro.getStorageSync('token') as string | undefined;
  const res = await Taro.request<{ data?: T; error?: { code: ErrorCode; message: string } }>({
    url: `${BASE_URL}${opts.url}`,
    method: opts.method ?? 'GET',
    data: opts.data,
    header: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.statusCode >= 400 || res.data.error) {
    const err = res.data.error;
    throw new ApiError(err?.code ?? ERROR_CODES.INVALID_INPUT, err?.message ?? 'Request failed', res.statusCode);
  }
  return (res.data.data ?? (res.data as unknown)) as T;
}

export const api = {
  get: <T>(url: string) => request<T>({ url }),
  post: <T>(url: string, data: unknown) => request<T>({ url, method: 'POST', data }),
  put: <T>(url: string, data: unknown) => request<T>({ url, method: 'PUT', data }),
  del: <T>(url: string) => request<T>({ url, method: 'DELETE' }),
};
```

Domain services on top:

```ts
// apps/miniapp/src/services/book.ts
import type { BookDTO, CreateBookInput } from '@rebook/shared';
import { api } from './request';

export const fetchBook = (id: string) => api.get<BookDTO>(`/books/${id}`);
export const createBook = (input: CreateBookInput) => api.post<BookDTO>('/books', input);
```

## Login (wx.login)

The `auth` skill covers the full flow. Short version: call `Taro.login()` → POST `code` to `/auth/wx-login` → store returned JWT in `Taro.setStorageSync('token', ...)`.

## Cross-end safety

- Use `<View>`, `<Text>`, `<Image>` from `@tarojs/components`. Never raw HTML elements.
- Never reference `window`, `document`, `localStorage`, `fetch`. Use `Taro.*` equivalents.
- Conditional code per platform: `if (process.env.TARO_ENV === 'weapp') {...}`.
- Avoid `dangerouslySetInnerHTML`.

## Styling

- Tailwind is generally not used in the mini-program (Taro's NutUI + scoped SCSS Modules is the default).
- Use **`rpx`** units (Taro's responsive pixel) instead of `px` for layout sizing.
- Page-scoped styles live in `index.module.scss`; import as `import styles from './index.module.scss'`.

## Workflow

```
- [ ] 1. shared: ensure DTO + Zod schema exist (use shared-types skill)
- [ ] 2. services/<domain>.ts — API call wrapper using `api` client
- [ ] 3. pages/<page>/index.tsx + index.config.ts
- [ ] 4. Register page (and tabbar if needed) in app.config.ts
- [ ] 5. pnpm --filter @rebook/miniapp typecheck
- [ ] 6. pnpm dev:miniapp — verify in 微信开发者工具
```

## Anti-patterns

- Calling `Taro.request` directly from page components. Use a service.
- Using web globals (`window`, `document`, `localStorage`, `fetch`).
- Hard-coding API base URL. Use `process.env.TARO_APP_API_BASE_URL` (configured per env in `apps/miniapp/config/`).
- Using `px` for sizing. Use `rpx` so layouts scale across screens.
- Importing from `apps/server` or `apps/web`.
- Importing NutUI components from `@nutui/nutui-react` (web). Always use `@nutui/nutui-react-taro`.
