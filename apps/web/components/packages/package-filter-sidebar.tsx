"use client";

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarRange,
  ChevronDown,
  Filter,
  IndianRupee,
  MapPin,
  RotateCcw,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { TourPackage } from "@/lib/constants";
import {
  durationOptions,
  listingFiltersActive,
  placeOptions,
  priceOptions,
  EMPTY_LISTING_FILTERS,
  readListingFilters,
  type FilterOption,
  type ListingFilters,
  typeOptions,
  withListingFilters,
} from "@/lib/package-listing-filters";
import { cn } from "@/lib/utils";

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function FilterMenu({
  title,
  icon: Icon,
  defaultOpen,
  children,
}: {
  title: string;
  icon: LucideIcon;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-[#e8e8e8] py-3 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex min-w-0 items-center gap-2 text-[13px] font-bold text-slate-900">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="truncate">{title}</span>
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? <div className="mt-2.5 space-y-0.5">{children}</div> : null}
    </section>
  );
}

function FilterChoice({
  option,
  checked,
  onChange,
}: {
  option: FilterOption;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-[13px] leading-snug text-slate-700 hover:bg-slate-50",
        checked && "bg-primary/5 font-semibold text-slate-900",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 rounded border-slate-300 accent-primary"
      />
      <span className="min-w-0 flex-1">{option.label}</span>
      <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-400">{option.count}</span>
    </label>
  );
}

function PackageFilterSidebarInner({ tours }: { tours: TourPackage[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = readListingFilters(searchParams);
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = listingFiltersActive(filters);

  const sections = useMemo(() => {
    const hasDeparture = tours.some((tour) => tour.departureCity?.trim());
    return [
      { key: "price", title: "Price", icon: IndianRupee, options: priceOptions(tours), selected: filters.prices, field: "prices" as const },
      { key: "type", title: "Package type", icon: Tag, options: typeOptions(tours), selected: filters.types, field: "types" as const },
      { key: "days", title: "Duration", icon: CalendarRange, options: durationOptions(tours), selected: filters.durations, field: "durations" as const },
      { key: "place", title: hasDeparture ? "Departure city" : "Destination", icon: MapPin, options: placeOptions(tours), selected: filters.places, field: "places" as const },
    ].filter((section) => section.options.length > 0);
  }, [tours, filters.prices, filters.types, filters.durations, filters.places]);

  const pushFilters = (next: ListingFilters) => {
    const href = withListingFilters(new URLSearchParams(searchParams.toString()), next);
    router.replace(href ? `${pathname}${href}` : pathname, { scroll: false });
  };

  const reset = () => pushFilters(EMPTY_LISTING_FILTERS);

  return (
    <aside className="w-full rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex min-w-0 items-center gap-2 text-[13px] font-bold text-slate-900">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Filter className="h-4 w-4" aria-hidden />
          </span>
          <span className="truncate">Filter your tour</span>
        </h3>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={!active}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:cursor-default disabled:text-slate-300 disabled:no-underline"
          >
            <RotateCcw className="h-3 w-3 shrink-0" aria-hidden />
            Reset
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary sm:hidden"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "Hide" : "Show filters"}
          </button>
        </div>
      </div>

      <div className={cn("mt-3 border-t border-[#e8e8e8]", mobileOpen ? "block" : "hidden sm:block")}>
        {sections.length === 0 ? (
          <p className="py-4 text-[12px] text-slate-500">Filters appear when packages are listed.</p>
        ) : (
          sections.map((section, index) => (
            <FilterMenu key={section.key} title={section.title} icon={section.icon} defaultOpen={index < 2}>
              {section.options.map((option) => (
                <FilterChoice
                  key={option.id}
                  option={option}
                  checked={section.selected.includes(option.id)}
                  onChange={() =>
                    pushFilters({
                      ...filters,
                      [section.field]: toggleValue(section.selected, option.id),
                    })
                  }
                />
              ))}
            </FilterMenu>
          ))
        )}
      </div>
    </aside>
  );
}

export function PackageFilterSidebar({ tours }: { tours: TourPackage[] }) {
  return (
    <Suspense fallback={<aside className="h-40 rounded-2xl border border-[#e5e7eb] bg-white" aria-hidden />}>
      <PackageFilterSidebarInner tours={tours} />
    </Suspense>
  );
}
