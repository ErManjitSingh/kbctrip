import { railPnr } from '@/lib/railkit';
import { trainsJsonError, trainsJsonOk, unwrapRailkit } from '@/lib/trains-api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const pnr = new URL(req.url).searchParams.get('pnr')?.replace(/\D/g, '') ?? '';
    if (pnr.length !== 10) {
      return trainsJsonError(new Error('Enter a valid 10-digit PNR'));
    }
    const result = unwrapRailkit(await railPnr(pnr));
    return trainsJsonOk(result);
  } catch (error) {
    return trainsJsonError(error);
  }
}
