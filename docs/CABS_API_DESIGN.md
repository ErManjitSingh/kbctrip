# Cabs on KBC (Phase 4 — deferred)

## Status

- Guest `/cabs` is coming-soon; primary nav hides Cabs.
- Admin `cabs-admin-store` remains localStorage until platform APIs exist.
- Scaffold marker: `apps/api/src/cabs/cabs.scaffold.ts` (not registered in AppModule).

## Why deferred

`kbc-booking` has **no cab domain tables** yet (quotes, partners, vehicles, payouts).
Shipping paid cabs without KBC APIs would reintroduce Unotrips `:8000` traffic.

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
