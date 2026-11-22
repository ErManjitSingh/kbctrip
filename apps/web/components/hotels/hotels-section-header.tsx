import { cn } from "@/lib/utils";

type HotelsSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
};

export function HotelsSectionHeader({
  eyebrow,
  title,
  description,
  className,
  action,
}: HotelsSectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-[#15202b] sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-[15px] leading-relaxed text-[#667085] sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
