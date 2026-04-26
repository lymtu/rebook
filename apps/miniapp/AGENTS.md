# AGENTS.md — `apps/miniapp` (`@rebook/miniapp`)

Read the repo root **`AGENTS.md`** first: **§2 Product domain** and **Taro/miniapp rules** (no `window`/`document`; use **`Taro.*`**) apply. This file lists **WeChat (primary) mini-program** work only.

## Role of this app

- **Taro 4 + React + NutUI-React-Taro**; **Bearer token** in `Authorization` to the same API as web (follow **`auth`** skill).
- **Import `@rebook/shared` + local code only**—**never** `apps/server` or `apps/web`.

## Product surface (from owner; do not contradict)

- **Payment**: **WeChat Pay** in the mini program (`wx.requestPayment` / server prepay) — one channel; **web** handles other PSPs.
- **Admin** (`admin`): provide the **same operational features** as web (review, users, disputes, fee **proposal**, announcements)—**not** fee **approval** or **admin account** management.
- **Super admin** (`super_admin`): **no** miniapp screens—**all** on `apps/web` only. If a super logs in on mini for some reason, show “use web for management” or hide admin entry points by role.
- **Disputes (user)**: form includes **optional** image fields but **must** support upload. **Fulfillment** pages: **text** + **map/location** (WeChat `chooseLocation` or map component as appropriate).

## Feature checklist

### 普通用户 (`user`)

- [ ] **Home / browse / book detail**; no **messaging** (no IM, no public thread under books).
- [ ] **Cart** → **checkout**; **UI shows 拆单** (multiple orders by seller) matching server.
- [ ] **WeChat Pay** only for pay in this client; success/fail/cancel → order list.
- [ ] **Orders** + **offline** state: 卖家配送 / 买家自提; **text fields** and **map/POI/坐标** as allowed by API (align with `apps/web`).
- [ ] **Publish / edit** listing, **审核状态** (pending, on sale, rejected + reason).
- [ ] **Ban**: disable normal user surface (买/卖/车/单/付/发书) when API indicates banned.
- [ ] `wx.login` + token exchange; **`services/request.ts`** for API calls; **`taro-page`** for new pages.

### 管理员 (`admin`)

- [ ] **Parity** with `apps/web` **admin** areas: review listings, user ops (no create-admin), resolve disputes (show/record consistent with `handled_by` on list), **propose** fee changes, publish announcements.
- [ ] **Do not** build **fee approval** or **create/revoke admin** UIs here—**super is web-only**.

## Engineering hygiene

- No web-only APIs; use **Taro** for storage, nav, and uploads (user media + **optional** dispute evidence; same `image-upload` rules as server).
- New endpoints: types from `@rebook/shared` only; no duplicate DTOs.
- `app.config.ts` / tab bar: register admin subpackages or stack pages as flows grow; keep routes **protected** by role.
- `pnpm` + repo typecheck/lint.

## Product notes (from owner; do not contradict)

- **Admin** on **web + mini**; **super** on **web** only. **Multi-channel pay**: WeChat here; other channels on web. **Dispute** optional images. **履约**: text + map.
