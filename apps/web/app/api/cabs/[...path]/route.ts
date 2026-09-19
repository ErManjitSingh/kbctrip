/**
 * Legacy Unotrips cabs proxy — disabled.
 * Cabs product is deferred until KBC booking owns cab APIs.
 */
import { NextResponse } from "next/server";

function gone() {
  return NextResponse.json(
    {
      message: "Unotrips cabs API proxy is disabled. Cabs will use KBC APIs when available.",
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
export const dynamic = "force-dynamic";
