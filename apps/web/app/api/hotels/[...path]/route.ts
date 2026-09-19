import { NextResponse } from "next/server";

/**
 * Legacy Unotrips hotels proxy — disabled.
 * Guest hotel catalog comes from KBC booking API via lib/hotels-api.ts.
 */
function gone() {
  return NextResponse.json(
    {
      message: "Unotrips hotels API proxy is disabled. Use KBC booking marketplace.",
      status: 410,
      data: null,
    },
    { status: 410 },
  );
}

export const GET = gone;
export const POST = gone;
export const PUT = gone;
export const DELETE = gone;
export const PATCH = gone;
export const dynamic = "force-dynamic";
