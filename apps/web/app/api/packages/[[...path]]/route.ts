/**
 * Packages API — KBC only.
 * Catalog uses marketplace via services/packages + booking-api.
 * Legacy Unotrips /v1/packages proxy is disabled (no :8000).
 */

import { NextResponse } from "next/server";

function gone() {
  return NextResponse.json(
    {
      message:
        "Unotrips package API is disabled. Catalog uses KBC marketplace packages; pricing runs in the web app.",
      status: 410,
      data: null,
    },
    { status: 410 },
  );
}

export const GET = gone;
export const POST = gone;
export const PUT = gone;
export const PATCH = gone;
export const DELETE = gone;
export const OPTIONS = gone;
