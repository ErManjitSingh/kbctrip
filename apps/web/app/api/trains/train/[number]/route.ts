import { railTrack, railTrainInfo } from '@/lib/railkit';
import { trainsJsonError, trainsJsonOk } from '@/lib/trains-api-response';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ number: string }> },
) {
  try {
    const { number } = await context.params;
    const train = number.replace(/\D/g, '');
    if (train.length !== 5) {
      return trainsJsonError(new Error('Enter a valid 5-digit train number'));
    }
    const date = new URL(req.url).searchParams.get('date')?.trim() || undefined;
    const info = await railTrainInfo(train);
    let live = null;
    if (date) {
      live = await railTrack(train, date).catch(() => null);
    }
    return trainsJsonOk({ info, live });
  } catch (error) {
    return trainsJsonError(error);
  }
}
