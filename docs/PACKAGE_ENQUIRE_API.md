# Package enquire API (kbc-booking — proposed)

Guest package “Book” today persists a **local enquiry/request** (no charge).
When kbc-booking should own leads, add:

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

Until this ships, the web app keeps enquiry mode (localStorage / request UI) and
must not call Unotrips package book/pay endpoints.
