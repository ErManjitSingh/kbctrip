import { railStationByCode, railStationsByName } from '@/lib/railkit';
import { filterTrainStations } from '@/lib/train-stations';
import { railkitFailureMessage, trainsJsonError, trainsJsonOk, unwrapRailkit } from '@/lib/trains-api-response';

export const dynamic = 'force-dynamic';

function localStations(q: string) {
  return filterTrainStations(q).map((s) => ({
    code: s.code,
    name: s.name,
    city: s.city,
  }));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const code = searchParams.get('code')?.trim() || '';
    if (code) {
      try {
        const result = unwrapRailkit(await railStationByCode(code));
        return trainsJsonOk(result);
      } catch {
        const local = filterTrainStations(code).find(
          (s) => s.code.toUpperCase() === code.toUpperCase(),
        );
        if (local) return trainsJsonOk(local);
        throw new Error('Station not found');
      }
    }
    if (q.length < 2) {
      return trainsJsonOk(localStations(q));
    }
    try {
      const raw = await railStationsByName(q);
      if (railkitFailureMessage(raw)) {
        return trainsJsonOk(localStations(q));
      }
      const result = unwrapRailkit(raw);
      const list = Array.isArray(result)
        ? result
        : result &&
            typeof result === 'object' &&
            Array.isArray((result as { stations?: unknown }).stations)
          ? (result as { stations: unknown[] }).stations
          : result &&
              typeof result === 'object' &&
              Array.isArray((result as { data?: unknown }).data)
            ? (result as { data: unknown[] }).data
            : [];
      if (Array.isArray(list) && list.length > 0) return trainsJsonOk(list);
      return trainsJsonOk(localStations(q));
    } catch {
      return trainsJsonOk(localStations(q));
    }
  } catch (error) {
    return trainsJsonError(error);
  }
}
