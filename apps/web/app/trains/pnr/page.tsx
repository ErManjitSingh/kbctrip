import { SiteFooter } from '@/components/SiteFooter';
import { TrainsPnrClient } from '@/components/trains/trains-pnr-client';

export default function TrainsPnrPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <main className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6">
        <TrainsPnrClient />
      </main>
      <SiteFooter />
    </div>
  );
}
