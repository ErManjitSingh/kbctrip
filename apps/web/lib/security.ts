import { NextRequest, NextResponse } from 'next/server';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Best-effort client IP behind nginx/Cloudflare. */
export function clientIp(req: Request | NextRequest): string {
  const headers = req.headers;
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  const real = headers.get('x-real-ip')?.trim();
  if (real) return real;
  const cf = headers.get('cf-connecting-ip')?.trim();
  if (cf) return cf;
  return 'unknown';
}

/**
 * In-memory sliding window rate limit (per Node process).
 * Fine for single-instance kbctrip-web; not a substitute for WAF/edge limits.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  // Opportunistic cleanup to avoid unbounded growth.
  if (buckets.size > 5_000) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(k);
    }
  }
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (existing.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  existing.count += 1;
  return { ok: true };
}

export function rateLimitResponse(retryAfterSec: number) {
  return NextResponse.json(
    { success: false, message: 'Too many requests. Please wait and try again.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'Cache-Control': 'no-store',
      },
    },
  );
}

/** Reject path traversal and empty segments in proxy path parts. */
export function assertSafeProxyPath(parts: string[]): string | null {
  if (!parts.length) return 'Path is required';
  if (parts.length > 12) return 'Path too deep';
  for (const part of parts) {
    if (!part || part === '.' || part === '..') return 'Invalid path';
    if (part.includes('\\') || part.includes('\0')) return 'Invalid path';
    if (!/^[A-Za-z0-9._~-]+$/.test(part)) return 'Invalid path segment';
  }
  return null;
}

const ALLOWED_PROXY_HEADERS = new Set([
  'authorization',
  'content-type',
  'accept',
  'accept-language',
  'x-request-id',
]);

/** Only forward safe headers to the booking backend. */
export function buildUpstreamHeaders(req: Request, extra?: HeadersInit): Headers {
  const out = new Headers(extra);
  req.headers.forEach((value, key) => {
    if (ALLOWED_PROXY_HEADERS.has(key.toLowerCase())) out.set(key, value);
  });
  if (!out.has('accept')) out.set('accept', 'application/json');
  return out;
}

const MAX_PROXY_BODY_BYTES = 1_000_000; // 1 MB

export async function readProxyBody(req: Request): Promise<
  { ok: true; body: ArrayBuffer | undefined } | { ok: false; response: NextResponse }
> {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return { ok: true, body: undefined };
  }
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > MAX_PROXY_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ message: 'Request body too large' }, { status: 413 }),
    };
  }
  const body = await req.arrayBuffer();
  if (body.byteLength > MAX_PROXY_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ message: 'Request body too large' }, { status: 413 }),
    };
  }
  return { ok: true, body: body.byteLength ? body : undefined };
}

/** Shared baseline security headers for responses. */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(self), payment=(self), usb=(), interest-cohort=()',
  'X-DNS-Prefetch-Control': 'off',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export function applySecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  res.headers.delete('x-powered-by');
  return res;
}
