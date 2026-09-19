# KBC Trip seed checklist

Guest MVP needs real KBC marketplace inventory (not Unotrips).

## Hotels (kbc-booking)

From the `kbc-booking` repo:

```bash
cd apps/api
pnpm db:seed
# optional richer demo:
# pnpm exec tsx prisma/seed-himalayan-retreat.ts
```

Target for staging demos:

- [ ] At least **3 cities** with published properties (e.g. Shimla, Manali, Goa)
- [ ] At least **5 hotels** with room types + rate plans + availability calendar
- [ ] One smoke booking: hold → confirm (no Razorpay) and appear under guest My trips

Admin wizard (`POST /platform/tenants/:id/properties`) creates the property shell.
Room/rate inventory is owned by the tenant dashboard / prisma seed until a fuller
admin inventory API is wired.

## Packages (kbc-booking + admin Package Maker)

- [ ] At least **3 marketplace packages** with non-empty day itineraries
- [ ] Published only when itinerary has day titles/summaries (enforced in PackageMaker)
- [ ] Guest list/detail shows those days (local day-options, no Unotrips)

## Env

Web (`apps/web/.env.local`):

```
KBC_BOOKING_API_URL=http://localhost:4000/api
NEXT_PUBLIC_KBC_BOOKING_API_URL=http://localhost:4000/api
# NEXT_PUBLIC_RAZORPAY_KEY_ID=   # optional, KBC account only
```

Do **not** set Unotrips `:8000` URLs or Unotrips Razorpay keys.
