---
name: web-page
description: Creates or modifies pages, routes, forms, and components in `apps/web` (React 18 + Vite + TypeScript + Ant Design 5 + TanStack Query + Zustand + Tailwind CSS). Use when adding routes, building forms, implementing API-backed views, or composing UI components for the web client.
---

# web-page

The web app is a React + Vite SPA. State splits into three layers: server state (TanStack Query), UI state (component-local `useState`), and global app state (Zustand). UI uses Ant Design components, with Tailwind for layout/spacing utilities.

## Read first

- `apps/web/src/router.tsx` — route table (React Router)
- `apps/web/src/lib/api.ts` — typed API client (uses `@rebook/shared` types)
- `apps/web/src/lib/queryClient.ts` — TanStack Query client + defaults
- `apps/web/src/features/<domain>/api.ts` — existing query/mutation hooks
- `packages/shared/src/api/<domain>.ts` — DTOs you must reuse

## Folder layout

```
apps/web/src/
├── pages/<page>/          # one folder per route, e.g. pages/book-detail/
│   ├── index.tsx          # the page component (default export)
│   └── components/        # page-only sub-components
├── components/            # cross-page reusable components
├── features/<domain>/
│   ├── api.ts             # useXxxQuery / useXxxMutation hooks
│   ├── store.ts           # Zustand store (only if needed)
│   └── types.ts           # local-only types (rare; prefer @rebook/shared)
├── lib/
│   ├── api.ts             # fetch wrapper, base URL, auth, error mapping
│   ├── queryClient.ts
│   └── auth.ts
├── router.tsx
└── main.tsx
```

## Routing

React Router v6 with lazy routes:

```tsx
// apps/web/src/router.tsx
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/app-layout';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', lazy: () => import('./pages/home') },
      { path: '/books/:id', lazy: () => import('./pages/book-detail') },
    ],
  },
]);
```

Each page folder exports a `Component` (and optionally `loader`):

```tsx
// apps/web/src/pages/book-detail/index.tsx
import { useParams } from 'react-router-dom';
import { useBook } from '@/features/book/api';

export function Component() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useBook(id!);
  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} />;
  return <BookDetailView book={data!} />;
}
```

## API hooks (TanStack Query)

```ts
// apps/web/src/features/book/api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BookDTO, CreateBookInput } from '@rebook/shared';
import { api } from '@/lib/api';

export const bookKeys = {
  all: ['books'] as const,
  detail: (id: string) => ['books', id] as const,
};

export function useBook(id: string) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => api.get<BookDTO>(`/books/${id}`),
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookInput) => api.post<BookDTO>('/books', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookKeys.all }),
  });
}
```

- **All response types come from `@rebook/shared`.** Never redefine them.
- Always export `<domain>Keys` factories so cache invalidation stays consistent.
- Don't put fetch calls directly in components. Always go through a hook.

## Forms

Use Ant Design `Form` + `useForm` for any non-trivial form. Pair with the Zod schema from shared via a thin adapter when complex validation is needed:

```tsx
import { Form, Input, InputNumber, Select, Button } from 'antd';
import { createBookInput, type CreateBookInput } from '@rebook/shared';

export function CreateBookForm() {
  const [form] = Form.useForm<CreateBookInput>();
  const create = useCreateBook();

  const onFinish = (values: CreateBookInput) => {
    const parsed = createBookInput.parse(values);
    create.mutate(parsed);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="title" label="书名" rules={[{ required: true }]}>
        <Input maxLength={200} />
      </Form.Item>
      {/* ... */}
      <Button type="primary" htmlType="submit" loading={create.isPending}>
        发布
      </Button>
    </Form>
  );
}
```

## Global state (Zustand)

Use Zustand only for genuinely cross-cutting UI state (current user, theme, cart). Server data lives in TanStack Query, not Zustand.

```ts
// apps/web/src/features/auth/store.ts
import { create } from 'zustand';

interface AuthStore {
  user: { id: string; name: string } | null;
  setUser: (user: AuthStore['user']) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

## Styling

- Layout/spacing/utility: **Tailwind classes** on plain `div`/`section`.
- Components and themed widgets: **Ant Design**.
- Don't write a `.css` file unless absolutely necessary; if you do, scope with CSS Modules (`<name>.module.css`).

```tsx
<section className="flex flex-col gap-4 p-6">
  <Card title={book.title}>{/* ... */}</Card>
</section>
```

## Workflow

```
- [ ] 1. shared: ensure DTO + Zod schema exist (use shared-types skill)
- [ ] 2. features/<domain>/api.ts — add Query/Mutation hook + key factory
- [ ] 3. pages/<page>/index.tsx — page component with Suspense/error boundaries
- [ ] 4. Register route in router.tsx (lazy import)
- [ ] 5. Add menu/link from existing navigation if user-facing
- [ ] 6. pnpm --filter @rebook/web typecheck && lint
```

## Anti-patterns

- Calling `fetch` directly inside a component. Use a Query hook.
- Storing server data in Zustand. Server data belongs in TanStack Query.
- Importing types from `apps/server`. Types come from `@rebook/shared`.
- Using `any` to bypass form/types. Add proper types.
- Inlining magic strings — use constants from `@rebook/shared/constants`.
- Hand-written CSS files when Tailwind / Ant Design tokens would do.
