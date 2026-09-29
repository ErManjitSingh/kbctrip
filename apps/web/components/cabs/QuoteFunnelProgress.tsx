"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "request", label: "Request", detail: "Share trip details" },
  { key: "quotes", label: "Compare", detail: "Review partner quotes" },
  { key: "book", label: "Book", detail: "Confirm & pay" },
] as const;

export type QuoteFunnelStep = "request" | "quotes" | "book" | "done";

export function QuoteFunnelProgress({
  current,
  className,
  compact = false,
}: {
  current: QuoteFunnelStep;
  className?: string;
  compact?: boolean;
}) {
  const index =
    current === "request" ? 0 : current === "quotes" ? 1 : current === "book" ? 2 : 3;

  return (
    <nav
      aria-label="Quote booking progress"
      className={cn(
        "rounded-2xl border border-[var(--kbc-line,#d7e2de)] bg-white px-3 py-3 shadow-sm sm:px-5 sm:py-4",
        className,
      )}
    >
      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map((step, i) => {
          const done = index > i || current === "done";
          const active = index === i && current !== "done";
          return (
            <li key={step.key} className="relative min-w-0 text-center">
              {i > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[-50%] right-1/2 top-[14px] h-0.5 sm:top-[16px]",
                    done || active ? "bg-[var(--kbc-teal,#0f766e)]/50" : "bg-[#e5ebe9]",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 mx-auto grid place-items-center rounded-full border-2 font-bold",
                  compact ? "h-7 w-7 text-[11px]" : "h-8 w-8 text-xs sm:h-9 sm:w-9 sm:text-sm",
                  done
                    ? "border-[var(--kbc-teal,#0f766e)] bg-[var(--kbc-teal,#0f766e)] text-white"
                    : active
                      ? "border-[var(--kbc-teal,#0f766e)] bg-[var(--kbc-teal-soft,#ecf7f5)] text-[var(--kbc-teal,#0f766e)]"
                      : "border-[#d7e2de] bg-white text-[#9aa8a3]",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <strong
                className={cn(
                  "mt-1.5 block truncate text-[11px] font-extrabold sm:text-xs",
                  active || done ? "text-[var(--kbc-ink,#0c1210)]" : "text-[#9aa8a3]",
                )}
              >
                {step.label}
              </strong>
              {!compact ? (
                <span className="mt-0.5 hidden truncate text-[10px] font-medium text-[var(--kbc-muted,#5c6662)] sm:block">
                  {step.detail}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function quoteFunnelStepFromStatus(args: {
  status: string;
  hasQuotes: boolean;
}): QuoteFunnelStep {
  if (args.status === "accepted") return "book";
  if (args.hasQuotes || args.status === "quoted") return "quotes";
  if (args.status === "open") return "quotes";
  return "request";
}
