import { railAvailability, railFare } from '@/lib/railkit';
import { clientIp, rateLimit, rateLimitResponse } from '@/lib/security';
import { trainsJsonError, trainsJsonOk, unwrapRailkit } from '@/lib/trains-api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const limited = rateLimit(`trains:avail:${clientIp(req)}`, 15, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);
  try {
    const { searchParams } = new URL(req.url);
    const train = searchParams.get('train')?.trim();
    const from = searchParams.get('from')?.trim();
    const to = searchParams.get('to')?.trim();
    const date = searchParams.get('date')?.trim();
    const coach = searchParams.get('class')?.trim() || searchParams.get('coach')?.trim() || 'SL';
    const quota = searchParams.get('quota')?.trim() || 'GN';
    if (!train || !from || !to || !date) {
      return trainsJsonError(new Error('train, from, to, and date are required'));
    }
    const [availabilityRaw, fareRaw] = await Promise.all([
      railAvailability(train, from, to, date, coach, quota),
      railFare(train, from, to, date, coach, quota).catch(() => null),
    ]);
    const availability = unwrapRailkit(availabilityRaw);
    let fare: unknown = null;
    if (fareRaw != null) {
      try {
        fare = unwrapRailkit(fareRaw);
      } catch {
        fare = null;
      }
    }
    return trainsJsonOk({ availability, fare });
  } catch (error) {
    return trainsJsonError(error);
  }
}
