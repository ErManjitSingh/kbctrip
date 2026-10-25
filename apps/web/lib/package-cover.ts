/** Local covers for package cards. Many catalog photos are dead Unsplash links. */

const LOCAL_COVERS: { test: RegExp; src: string }[] = [
  { test: /goa|pondicherry/i, src: '/images/home/lite/dest-goa.jpg' },
  { test: /manali/i, src: '/images/home/lite/dest-manali.jpg' },
  { test: /kashmir/i, src: '/images/home/lite/dest-kashmir.jpg' },
  { test: /jaipur|udaipur|rajasthan|agra/i, src: '/images/home/lite/dest-jaipur.jpg' },
  { test: /dubai/i, src: '/images/home/lite/dest-dubai.jpg' },
  { test: /shimla|himachal/i, src: '/images/home/lite/dest-shimla.jpg' },
  { test: /kerala/i, src: '/images/home/slides/dom-kerala.jpg' },
  { test: /rishikesh|uttarakhand/i, src: '/images/home/slides/dom-uttarakhand.jpg' },
  { test: /andaman/i, src: '/images/home/slides/dom-andaman.jpg' },
  { test: /leh|ladakh/i, src: '/images/home/slides/dom-ladakh.jpg' },
];

const FALLBACK = '/images/home/lite/card-lodge.jpg';

export function localPackageCover(destination: string | null | undefined) {
  const name = destination?.trim();
  if (!name) return null;
  return LOCAL_COVERS.find((item) => item.test.test(name))?.src ?? null;
}

/** Local photo first, then any remote photos, then a lodge fallback. */
export function packageCoverUrls(
  destination: string | null | undefined,
  photos: string[] | null | undefined,
) {
  const urls: string[] = [];
  const local = localPackageCover(destination);
  if (local) urls.push(local);
  for (const photo of photos ?? []) {
    if (photo && !urls.includes(photo)) urls.push(photo);
  }
  if (!urls.length) urls.push(FALLBACK);
  return urls;
}
