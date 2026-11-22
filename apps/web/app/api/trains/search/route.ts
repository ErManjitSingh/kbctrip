import { railSearch } from '@/lib/railkit';
import { trainsJsonError, trainsJsonOk, unwrapRailkit } from '@/lib/trains-api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from')?.trim();
    const to = searchParams.get('to')?.trim();
    const date = searchParams.get('date')?.trim() || undefined;
    if (!from || !to) {
      return trainsJsonError(new Error('from and to station codes are required'));
    }
    const result = unwrapRailkit(await railSearch(from, to, date));
    // RailKit may still wrap lists as { data: Train[] } after the outer unwrap.
    const list =
      result &&
      typeof result === 'object' &&
      !Array.isArray(result) &&
      Array.isArray((result as { data?: unknown }).data)
        ? (result as { data: unknown[] }).data
        : result;
    return trainsJsonOk(Array.isArray(list) ? list : []);
  } catch (error) {
    return trainsJsonError(error);
  }
}
