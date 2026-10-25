/**
 * Guest cab marketplace proxy.
 * Browser calls /api/cabs/* → kbc-booking /api/v1/cabs/*.
 */
import { NextRequest, NextResponse } from "next/server";
import { fetchBackendWithRetry, getBackendOrigin, stripHopByHopHeaders } from "@/lib/backend-fetch";

async function handle(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = new URL(`${getBackendOrigin()}/api/v1/cabs/${path.join("/")}`);
  target.search = req.nextUrl.search;
  const headers = new Headers(req.headers);
  ["host", "connection", "content-length", "expect", "accept-encoding"].forEach((key) => headers.delete(key));
  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();
  try {
    const upstream = await fetchBackendWithRetry(
      target.toString(),
      { method: req.method, headers, body: body?.byteLength ? body : undefined },
      { timeoutMs: 20_000, maxAttempts: 2, wakeOnFailure: false },
    );
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: stripHopByHopHeaders(upstream.headers),
    });
  } catch {
    return NextResponse.json({ message: "Cab service is unavailable. Please try again." }, { status: 503 });
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const dynamic = "force-dynamic";
