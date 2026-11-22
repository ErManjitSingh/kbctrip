import { SiteFooter } from '@/components/SiteFooter';
import { TrainsResultsClient } from '@/components/trains/trains-results-client';

export default async function TrainsResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; date?: string; class?: string }>;
}) {
  const params = await searchParams;
  const from = (params.from || 'NDLS').toUpperCase();
  const to = (params.to || 'BCT').toUpperCase();
  const date = params.date || '';
  const coachClass = (params.class || 'ALL').toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6">
        <TrainsResultsClient from={from} to={to} date={date} coachClass={coachClass} />
      </main>
      <SiteFooter />
    </div>
  );
}
