import { railTrack, railTrainInfo } from '@/lib/railkit';
import { clientIp, rateLimit, rateLimitResponse } from '@/lib/security';
import { trainsJsonError, trainsJsonOk, unwrapRailkit } from '@/lib/trains-api-response';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ number: string }> },
) {
  const limited = rateLimit(`trains:train:${clientIp(req)}`, 12, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);
  try {
    const { number } = await context.params;
    const train = number.replace(/\D/g, '');
    if (train.length !== 5) {
      return trainsJsonError(new Error('Enter a valid 5-digit train number'));
    }
    const date = new URL(req.url).searchParams.get('date')?.trim() || undefined;
    const info = unwrapRailkit(await railTrainInfo(train));
    let live = null;
    if (date) {
      try {
        live = unwrapRailkit(await railTrack(train, date));
      } catch {
        live = null;
      }
    }
    return trainsJsonOk({ info, live });
  } catch (error) {
    return trainsJsonError(error);
  }
}
