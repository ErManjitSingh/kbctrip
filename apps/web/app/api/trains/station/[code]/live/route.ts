import { railLiveStation } from '@/lib/railkit';
import { clientIp, rateLimit, rateLimitResponse } from '@/lib/security';
import { trainsJsonError, trainsJsonOk, unwrapRailkit } from '@/lib/trains-api-response';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ code: string }> },
) {
  const limited = rateLimit(`trains:live:${clientIp(req)}`, 10, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);
  try {
    const { code } = await context.params;
    const hoursParam = Number(new URL(req.url).searchParams.get('hours') || 2);
    const hours = ([2, 4, 8] as const).includes(hoursParam as 2 | 4 | 8)
      ? (hoursParam as 2 | 4 | 8)
      : 2;
    if (!code?.trim()) {
      return trainsJsonError(new Error('Station code is required'));
    }
    const result = unwrapRailkit(await railLiveStation(code, hours));
    return trainsJsonOk(result);
  } catch (error) {
    return trainsJsonError(error);
  }
}
