/** Package card covers — prefer real catalog photos; local art only as fallback. */

import { resolveMediaUrl } from '@/lib/booking-api';

const LOCAL_COVERS: { test: RegExp; src: string }[] = [
  { test: /goa|pondicherry/i, src: '/images/home/lite/dest-goa.jpg' },
  { test: /manali/i, src: '/images/home/lite/dest-manali.jpg' },
  { test: /kashmir|srinagar|gulmarg|pahalgam/i, src: '/images/home/lite/dest-kashmir.jpg' },
  { test: /jaipur|udaipur|rajasthan|jodhpur|agra/i, src: '/images/home/lite/dest-jaipur.jpg' },
  { test: /dubai/i, src: '/images/home/lite/dest-dubai.jpg' },
  { test: /shimla|shimal/i, src: '/images/home/lite/dest-shimla.jpg' },
  { test: /dharamshala|dharmshala|dalhousie|dalhausie|himachal/i, src: '/images/home/slides/dom-himachal.jpg' },
  { test: /kerala|munnar|alleppey/i, src: '/images/home/slides/dom-kerala.jpg' },
  { test: /rishikesh|uttarakhand/i, src: '/images/home/slides/dom-uttarakhand.jpg' },
  { test: /andaman/i, src: '/images/home/slides/dom-andaman.jpg' },
  { test: /leh|ladakh/i, src: '/images/home/slides/dom-ladakh.jpg' },
  { test: /sikkim|gangtok|darjeeling/i, src: '/images/home/lite/dest-manali.jpg' },
];

const FALLBACK = '/images/home/lite/card-lodge.jpg';

export function localPackageCover(destination: string | null | undefined) {
  const name = destination?.trim();
  if (!name) return null;
  return LOCAL_COVERS.find((item) => item.test.test(name))?.src ?? null;
}

/**
 * Real package photos first (unique per trip), then a destination local cover,
 * then a generic lodge fallback. Previously local covers were first, so every
 * Shimla/Manali card looked identical.
 */
export function packageCoverUrls(
  destination: string | null | undefined,
  photos: string[] | null | undefined,
) {
  const urls: string[] = [];
  for (const photo of photos ?? []) {
    const resolved = resolveMediaUrl(photo);
    if (resolved && !urls.includes(resolved)) urls.push(resolved);
  }
  const local = localPackageCover(destination);
  if (local && !urls.includes(local)) urls.push(local);
  if (!urls.length) urls.push(FALLBACK);
  return urls;
}
