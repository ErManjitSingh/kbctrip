import { railSearch } from '@/lib/railkit';
import { trainsJsonError, trainsJsonOk } from '@/lib/trains-api-response';

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
    const result = await railSearch(from, to, date);
    // RailKit wraps lists as { success, data: Train[] } — flatten for the UI.
    const list =
      result &&
      typeof result === 'object' &&
      Array.isArray((result as { data?: unknown }).data)
        ? (result as { data: unknown[] }).data
        : result;
    return trainsJsonOk(list);
  } catch (error) {
    return trainsJsonError(error);
  }
}
