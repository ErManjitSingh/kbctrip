import { railAvailability, railFare } from '@/lib/railkit';
import { trainsJsonError, trainsJsonOk } from '@/lib/trains-api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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
    // Unwrap RailKit { success, data } envelopes when present.
    const availability =
      availabilityRaw &&
      typeof availabilityRaw === 'object' &&
      'data' in availabilityRaw &&
      (availabilityRaw as { success?: boolean }).success !== false
        ? (availabilityRaw as { data: unknown }).data
        : availabilityRaw;
    const fare =
      fareRaw &&
      typeof fareRaw === 'object' &&
      'data' in fareRaw &&
      (fareRaw as { success?: boolean }).success !== false
        ? (fareRaw as { data: unknown }).data
        : fareRaw;
    return trainsJsonOk({ availability, fare });
  } catch (error) {
    return trainsJsonError(error);
  }
}
