import { SiteFooter } from '@/components/SiteFooter';
import { TrainsLiveClient } from '@/components/trains/trains-live-client';

export default function TrainsLivePage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <main className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6">
        <TrainsLiveClient />
      </main>
      <SiteFooter />
    </div>
  );
}
