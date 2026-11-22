import { BadgePercent, Hotel, Star, Wallet } from "lucide-react";

const REASONS = [
  {
    icon: Hotel,
    title: "Best stays",
    text: "Handpicked hotels across destinations for a stay you will remember.",
  },
  {
    icon: BadgePercent,
    title: "Best offers",
    text: "Book with exclusive discounts and make every trip more affordable.",
  },
  {
    icon: Star,
    title: "Hotel ratings",
    text: "Trusted guest ratings so you know what to expect before you book.",
  },
  {
    icon: Wallet,
    title: "Great prices",
    text: "Excellent hotels and resorts at clear, competitive nightly rates.",
  },
] as const;

export function HotelsWhyBook() {
  return (
    <section className="border-y border-[#eeeeee] bg-[#f7f9fc] py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[1180px] px-3 sm:px-4 lg:px-6">
        <h2 className="text-center text-[22px] font-bold tracking-tight text-[#212121] sm:text-[26px]">
          Why Book Hotels with KBC Trip?
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {REASONS.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e3f2fd] text-[#1976d2]">
                <item.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 text-[15px] font-bold text-[#212121]">{item.title}</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#757575]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
