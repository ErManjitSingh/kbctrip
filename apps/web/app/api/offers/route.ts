import { NextResponse } from "next/server";
import { getExclusiveOffers } from "@/lib/exclusive-offers";

export const dynamic = "force-static";
export const revalidate = 300;

/** Public exclusive offers for hotels homepage / marketing surfaces. */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: getExclusiveOffers(),
  });
}
