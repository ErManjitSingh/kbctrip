export type TrainsApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

export async function fetchTrainsApi<T = unknown>(path: string): Promise<TrainsApiResponse<T>> {
  const res = await fetch(path, { cache: 'no-store' });
  const body = (await res.json().catch(() => null)) as TrainsApiResponse<T> | null;
  if (!body) {
    return { success: false, message: 'Could not reach train service' };
  }
  if (!res.ok && !body.message) {
    return { success: false, message: `Request failed (${res.status})` };
  }
  return body;
}

export const IRCTC_BOOK_URL = 'https://www.irctc.co.in/nget/train-search';

export function formatIsoToDisplay(iso: string): string {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  });
}
