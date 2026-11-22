import { NextRequest, NextResponse } from 'next/server';
import { applySecurityHeaders, clientIp, rateLimit, rateLimitResponse } from '@/lib/security';

/**
 * Edge middleware: security headers + coarse API abuse protection.
 * Auth tokens remain in app logic; this is a first line of defense.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Coarse global API throttle (per IP). Route handlers add tighter limits.
  if (pathname.startsWith('/api/')) {
    const ip = clientIp(req);
    const limited = rateLimit(`mw:api:${ip}`, 120, 60_000);
    if (!limited.ok) return applySecurityHeaders(rateLimitResponse(limited.retryAfterSec));

    if (pathname.startsWith('/api/trains')) {
      const trainLimit = rateLimit(`mw:trains:${ip}`, 20, 60_000);
      if (!trainLimit.ok) return applySecurityHeaders(rateLimitResponse(trainLimit.retryAfterSec));
    }
  }

  const res = NextResponse.next();
  return applySecurityHeaders(res);
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets Next serves as files.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/|reference/|media/).*)',
  ],
};
