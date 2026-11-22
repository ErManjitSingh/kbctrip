import { SiteFooter } from '@/components/SiteFooter';
import { TrainDetailClient } from '@/components/trains/train-detail-client';

export default async function TrainDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const train = number.replace(/\D/g, '').slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <main className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6">
        <TrainDetailClient number={train || number} />
      </main>
      <SiteFooter />
    </div>
  );
}
