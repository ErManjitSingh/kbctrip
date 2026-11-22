import { railStationByCode, railStationsByName } from '@/lib/railkit';
import { trainsJsonError, trainsJsonOk } from '@/lib/trains-api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const code = searchParams.get('code')?.trim() || '';
    if (code) {
      const result = await railStationByCode(code);
      return trainsJsonOk(result);
    }
    if (q.length < 2) {
      return trainsJsonOk([]);
    }
    const result = await railStationsByName(q);
    return trainsJsonOk(result);
  } catch (error) {
    return trainsJsonError(error);
  }
}
