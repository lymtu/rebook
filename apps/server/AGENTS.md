# AGENTS.md — `apps/server` (`@rebook/server`)

Read the repo root **`AGENTS.md`** first: **§2 Product domain** and cross-app rules are authoritative. This file lists **backend-only** work to implement that domain.

## Role of this app

- **Elysia** HTTP API, **Drizzle** + PostgreSQL, **JWT** auth, `StorageProvider` (COS) for book images.
- **No** UI; **no** imports from `apps/web` or `apps/miniapp`.
- DTOs and Zod: **`@rebook/shared`** is the source of truth; server validates and maps to DB.

## Implementation checklist (domain)

### Auth, users, roles

- [ ] `UserRole`: `user` | `admin` | `super_admin`; persist on `users` (or join table if you split roles).
- [ ] **Ban** (`banned` / `active`): if banned, **deny all normal user actions** (buy, sell, cart, pay, list, create order, open dispute, etc.) via middleware / guard—same rule for web and miniapp tokens.
- [ ] **Only `super_admin`** may **create, promote, or revoke `admin`** accounts. `admin` must **not** be able to create other admins or super_admins.
- [ ] Admin may manage **ordinary users** (ban, etc.) per §2.1; align API rules with that matrix.

### Listings (books)

- [ ] State machine: e.g. `pending_review` → `on_sale` | `rejected` (with reason); seller edits can reset to `pending_review` as needed—**document chosen transitions** in code or `packages/shared` comments.
- [ ] **Admin** endpoints: list pending, approve, reject. **Not** a routine super-admin job on the server (authorization still allows super if you use shared admin middleware).

### Cart, checkout, orders

- [ ] **Cart** lines keyed by book/seller; **checkout creates multiple orders**—one per seller (or parent/child model **documented in DB** and shared types).
- [ ] **Seller fee**: compute **per order** from **current approved** rate; persist **rate snapshot** (or `fee_rate_version_id`) on each order for audit.
- [ ] **No** order should use a proposed-but-unapproved fee.

### Platform fee (平台向卖家收费)

- [ ] **Admin** creates/updates a **fee proposal**; each change is a **separate** pending record until **`super_admin` approves or rejects**.
- [ ] **Only after approval** does a new rate apply to **new** orders; store history/versions for audits.
- [ ] `super_admin`: approve/reject routes; `admin` resubmit after reject.

### Payment

- [ ] **Multi-channel online payment**: e.g. **WeChat Pay (JSAPI / mini program)** for mini clients and **separate** web/browser flows for other channels as needed. All credentials in **`env.ts`** (Zod) + `.env.example` (one section per integrator is OK).
- [ ] Each **order** stores **which payment channel** was chosen and PSP-specific metadata needed for refunds/audit.
- [ ] **Webhooks / callback** handlers per channel: **idempotent**, drive order `paid` (or failure); **never** trust client alone for “paid”.

### Fulfillment (线下)

- [ ] State transitions for **seller delivery** or **buyer 自提**; platform does not ship. Persist enough for “completed handover” and audits.
- [ ] Persist **textual** delivery/pickup details **and** optional **map-backed** fields (e.g. lat/lng, POI name, address string from map pick)—schema should allow **both**; see §2.5 in root `AGENTS.md`.

### Disputes

- [ ] **Admin** (not super as default) resolves disputes; on close, persist **`handled_by`** (admin user id) for audit.
- [ ] `super_admin` not required in the default resolve path; optional extra permission is product-dependent.
- [ ] **Create dispute** supports **optional** image evidence URLs/keys; **Zod** allows empty list; re-use presigned **image-upload** patterns for evidence files (separate key prefix or `kind` is fine).

### Announcements

- [ ] **Publish** only; **no** `unpublish` / **no** “下线” state—treat as permanent history. Optional: `pinned_at`, `sort_order`, `published_at` for listing APIs.

### Uploads

- [ ] Book images **and** (optional) dispute evidence images: presigned upload + server validation per **`image-upload`** skill; metadata/keys in DB; namespace by `kind` or prefix.

## Engineering hygiene

- Route → service → repository; **no** SQL in route handlers.
- `AppError` for business errors; log with shared logger, not `console.log`.
- Migrations **append-only**; new env vars in `env.ts` + `.env.example`.

## Product notes (from owner; do not contradict)

- **Mini program**: WeChat Pay. **Web**: additional channel(s) as needed—**multiple** server-side integrators are expected.
- **Admin API** is used from **web and miniapp**; **super_admin-only** routes must reject any caller that is not `super_admin` (miniapp will not ship super UIs, but the API must still be safe).
