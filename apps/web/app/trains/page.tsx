import Link from 'next/link';
import { Activity, Search, Ticket } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { TrainSearchBar } from '@/components/trains/TrainSearchBar';

type TrainsHomePageProps = {
  searchParams?: Promise<{ date?: string; from?: string; to?: string; class?: string }> | {
    date?: string;
    from?: string;
    to?: string;
    class?: string;
  };
};

export default async function TrainsHomePage({ searchParams }: TrainsHomePageProps) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const initialDate = params?.date?.trim() || undefined;
  const initialFrom = params?.from?.trim() || undefined;
  const initialTo = params?.to?.trim() || undefined;
  const initialClass = params?.class?.trim() || undefined;

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f294d] via-[#163a6b] to-[#1e4d8c] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #3264ff 0%, transparent 45%)' }} />
        <div className="relative mx-auto max-w-[1120px] px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Indian Railways</p>
          <h1 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Find trains. Check seats. Track live.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
            Search routes, seat availability, and PNR status. Ticket booking opens on IRCTC.
          </p>
          <div className="mt-8">
            <TrainSearchBar
              initialFrom={initialFrom}
              initialTo={initialTo}
              initialDate={initialDate}
              initialClass={initialClass}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/trains/pnr" className="rounded-2xl border border-[#e6ebf2] bg-white p-5 shadow-sm transition hover:border-[#3264ff]/40 hover:shadow-md">
            <Ticket className="h-6 w-6 text-[#3264ff]" />
            <strong className="mt-3 block text-lg text-[#0f294d]">PNR status</strong>
            <span className="mt-1 block text-sm text-slate-500">Check chart and passenger status for any 10-digit PNR.</span>
          </Link>
          <Link href="/trains/live" className="rounded-2xl border border-[#e6ebf2] bg-white p-5 shadow-sm transition hover:border-[#3264ff]/40 hover:shadow-md">
            <Activity className="h-6 w-6 text-[#16a34a]" />
            <strong className="mt-3 block text-lg text-[#0f294d]">Live board</strong>
            <span className="mt-1 block text-sm text-slate-500">See trains at a station or track a train by number.</span>
          </Link>
          <div className="rounded-2xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
            <Search className="h-6 w-6 text-[#ff6a00]" />
            <strong className="mt-3 block text-lg text-[#0f294d]">Seat & fare</strong>
            <span className="mt-1 block text-sm text-slate-500">Open any result to check class-wise availability before you book on IRCTC.</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
