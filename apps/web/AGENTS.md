# AGENTS.md — `apps/web` (`@rebook/web`)

Read the repo root **`AGENTS.md`** first: **§2 Product domain** and **§4–§6** (directory, conventions, cross-cutting) apply. This file lists **web client** work only.

## Role of this app

- **React 18 + Vite + Ant Design 5 + TanStack Query + Zustand + Tailwind**; primary place for **mouse/keyboard** admin workflows.
- Auth: **httpOnly cookie** session to the API (no tokens in `localStorage` for session JWT).
- Import **`@rebook/shared`** and local code only—**never** `apps/server`.

## Feature checklist (by role)

### 普通用户 (`user`)

- [ ] Browse/search books, book detail, seller-facing info needed for C2C (no **messaging** UI—**no** chat/comment/forum; §2.1).
- [ ] **Cart** → **checkout**; show **split into multiple orders** (one per seller) before pay.
- [ ] **Online pay (web / multi-channel)**: integrate **non–WeChat-only** browser flows (e.g. other PSP, QR, or redirect) per server—**separate** from **mini** WeChat Pay. Return/notify URLs and order status polling aligned with `apps/server`.
- [ ] **Offline** fulfillment: support **text** (address, time, notes) **and** **map/location** UI (e.g. pick coordinates or POI + display on order detail) per §2.5; order list shows combined state ( delivery / 自提 ).
- [ ] Publish/edit listing flow; show **review状态** (pending / on sale / rejected + reason).
- [ ] **Ban**: if API says user is banned, **block** normal actions (no cart/checkout/pay/publish) and show a clear **account restricted** state.

### 管理员 (`admin`) — also implement equivalent flows on `apps/miniapp`

- [ ] **Listing review** queue: approve / reject.
- [ ] **User management**: ban/unban, etc. **Do not** expose “create admin” in admin UIs—**super_admin only** (§2.1). Implement admin screens here; **mirror** the same **admin** capabilities in the miniapp (see `apps/miniapp/AGENTS.md`).
- [ ] **Disputes**: list/detail/resolve; **show `handled_by` (which admin closed it)** on resolved records.
- [ ] **Propose** platform **fee** changes (forms + list of pending/past proposals)—**not** final approval.
- [ ] **Announcements**: create/publish; **no** 下线 or unpublish—permanent list/history, optional pin/sort in UI.
- [ ] **Optional**: if admins see fee history only—**each rate change** still goes through **super approval** on the server; web only reflects API.

### 超级管理员 (`super_admin`) — **web only** (no `super_admin` area in the miniapp)

- [ ] **Approve / reject** every **admin fee proposal**; show history (approve/reject).
- [ ] **Create / configure `admin` accounts** (grant/revoke admin)—**only** this role; no routine listing/user/dispute UIs **required** here (§2.1), unless you add shortcuts.

### Layout / nav

- [ ] **Route guards** by role: `user` pages vs `admin+` area vs `super_admin`-only (fee approval + admin user management on **web**). Use shared constants from `@rebook/shared` for role strings/enums.
- [ ] **Disputes (user opens)**: form includes **optional image upload** (field present; submission may omit files)—**§2.6** root.
- [ ] `App` shell (existing `app-layout` / router): extend for new sections without breaking skeleton.

## Out of scope for web (unless product changes)

- **No** in-app “用户发言” community; **no** per-book public comments.
- **No** server-side business logic in the browser—**all** in API.

## Engineering hygiene

- `pnpm` only; new API usage → typed client + Query hooks under `src/features/<domain>/`.
- Run `pnpm typecheck` and `pnpm lint` from repo root (or app) before finishing a task.
- See root **`## 8. Common workflows`** for endpoint-first flow (shared → server → web).

## Product notes (from owner; do not contradict)

- **Payment**: WeChat in mini; **web** = additional channel(s). See root §2.5 and `apps/server/AGENTS.md`.
- **Admins** use **web + miniapp**; **super_admin** uses **web only**; end-user flows on both clients.
- **Disputes**: optional images; form **must** offer upload. **Fulfillment** UIs: text + map/location.
