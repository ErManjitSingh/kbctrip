# Cabs on KBC (Phase 4 — deferred)

## Why deferred

`kbc-booking` has **no cab domain** today (quotes, partners, vehicles, payouts).
Guest `/cabs` and admin `cabs-admin-store` (localStorage) are Unotrips-shaped
shells. Shipping paid cabs without KBC APIs would reintroduce `:8000` traffic.

MVP hides Cabs from the primary nav and shows a coming-soon page.

## Proposed kbc-booking surfaces

| Area | Endpoints (sketch) |
|------|--------------------|
| Public quotes | `POST /public/cabs/quote`, `GET /public/cabs/quote/:id` |
| Book | `POST /public/cabs/quote/:id/hold`, `…/confirm`, optional `…/pay/*` |
| Partners | `POST /partner/cabs/apply`, vehicle/driver CRUD under tenant |
| Ops | `GET /platform/cabs/bookings`, partner approval |

## Admin cutover

Replace `apps/admin/lib/cabs-admin-store.ts` localStorage with platform APIs once
the tables and Nest modules exist. Do not point guest cabs at Unotrips again.
