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

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH']);

async function handle(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (!ALLOWED_METHODS.has(req.method)) {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  const ip = clientIp(req);
  const limited = rateLimit(`cab-partner:${ip}`, 60, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const { path } = await context.params;
  const pathError = assertSafeProxyPath(path);
  if (pathError) {
    return NextResponse.json({ message: pathError }, { status: 400 });
  }

  // Partner portal endpoints require a Bearer token (backend enforces; block empty early).
  const auth = req.headers.get('authorization')?.trim();
  if (!auth?.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const target = new URL(`${getBackendOrigin()}/api/v1/cab-partner/${path.join('/')}`);
  target.search = req.nextUrl.search;
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
      { timeoutMs: 15_000, maxAttempts: 2, wakeOnFailure: false },
    );
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: stripHopByHopHeaders(upstream.headers),
    });
  } catch {
    return NextResponse.json(
      { message: 'Cab partner service is unavailable. Please try again.' },
      { status: 503 },
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const dynamic = 'force-dynamic';
