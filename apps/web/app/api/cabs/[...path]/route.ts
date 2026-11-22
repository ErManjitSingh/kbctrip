/**
 * Guest cab marketplace proxy.
 * Browser calls /api/cabs/* → kbc-booking /api/v1/cabs/*.
 */
import { NextRequest, NextResponse } from 'next/server';
import { fetchBackendWithRetry, getBackendOrigin, stripHopByHopHeaders } from '@/lib/backend-fetch';
import {
  assertSafeProxyPath,
  buildUpstreamHeaders,
  clientIp,
  rateLimit,
  rateLimitResponse,
  readProxyBody,
} from '@/lib/security';

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

async function handle(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (!ALLOWED_METHODS.has(req.method)) {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  const ip = clientIp(req);
  const limited = rateLimit(`cabs:${ip}`, 60, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const { path } = await context.params;
  const pathError = assertSafeProxyPath(path);
  if (pathError) {
    return NextResponse.json({ message: pathError }, { status: 400 });
  }

  const target = new URL(`${getBackendOrigin()}/api/v1/cabs/${path.join('/')}`);
  target.search = req.nextUrl.search;
  // Prevent open redirect / host injection via weird search params — origin is fixed.
  if (target.origin !== new URL(getBackendOrigin()).origin) {
    return NextResponse.json({ message: 'Invalid upstream target' }, { status: 400 });
  }

  const bodyResult = await readProxyBody(req);
  if (!bodyResult.ok) return bodyResult.response;

  try {
    const upstream = await fetchBackendWithRetry(
      target.toString(),
      {
        method: req.method,
        headers: buildUpstreamHeaders(req),
        body: bodyResult.body,
      },
      { timeoutMs: 20_000, maxAttempts: 2, wakeOnFailure: false },
    );
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: stripHopByHopHeaders(upstream.headers),
    });
  } catch {
    return NextResponse.json({ message: 'Cab service is unavailable. Please try again.' }, { status: 503 });
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const dynamic = 'force-dynamic';
