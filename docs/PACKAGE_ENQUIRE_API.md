# Package enquire API (shipped)

Guest package “Book” posts to kbc-booking:

## `POST /public/marketplace-packages/:slug/enquire`

### Body

```json
{
  "name": "Guest Name",
  "email": "guest@email.com",
  "phone": "9876543210",
  "travelDate": "2026-10-12",
  "adults": 2,
  "children": 0,
  "rooms": 1,
  "message": "Optional notes",
  "selections": {
    "days": [],
    "estimatedTotalMinor": 4500000
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "enquiryId": "enq_…",
    "reference": "PKG-…",
    "status": "received"
  }
}
```

Persisted as `MarketplacePackageEnquiry`. Ops: `GET /platform/marketplace-package-enquiries` (super_admin).

Web: `createPackageEnquiry` in `apps/web/lib/booking-api.ts` + `use-package-booking` (localStorage fallback if API down).
