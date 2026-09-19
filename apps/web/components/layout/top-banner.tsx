"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, Copy, X } from "lucide-react";
import { CAB_WELCOME_PROMO_CODE } from "@/lib/cab-promo";

const DISMISS_KEY = "uno_cabs_promo_banner_dismissed";

function shouldShowCabPromoBanner(pathname: string) {
  if (pathname.startsWith("/cabs/partner")) return false;
  // Keep KBC marketing home clean — Unotrips cab promo only on /cabs.
  return pathname.startsWith("/cabs");
}

function setBannerHeight(px: number) {
  document.documentElement.style.setProperty("--uno-top-banner-height", `${px}px`);
}

export function TopBanner() {
  const pathname = usePathname() || "";
  const bannerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const syncBannerHeight = useCallback(() => {
    const el = bannerRef.current;
    setBannerHeight(el ? el.offsetHeight : 0);
  }, []);

  useEffect(() => {
    if (!shouldShowCabPromoBanner(pathname)) {
      setVisible(false);
      setBannerHeight(0);
      return;
    }
    try {
      setVisible(sessionStorage.getItem(DISMISS_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!visible) {
      setBannerHeight(0);
      return;
    }
    syncBannerHeight();
    const el = bannerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(syncBannerHeight);
    observer.observe(el);
    return () => {
      observer.disconnect();
      setBannerHeight(0);
    };
  }, [visible, syncBannerHeight]);

  if (!visible || !shouldShowCabPromoBanner(pathname)) {
    return null;
  }

  const dismiss = () => {
    setVisible(false);
    setBannerHeight(0);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(CAB_WELCOME_PROMO_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      ref={bannerRef}
      className="sticky top-0 z-[60] border-b border-[#c94f0f] bg-[#ef6614] text-white"
      role="region"
      aria-label="KBC Cabs welcome offer"
    >
      <div className="relative mx-auto flex min-h-10 max-w-6xl items-center justify-center px-10 py-1.5 sm:px-12">
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap text-[11px] font-semibold sm:gap-2 sm:text-xs">
          <span className="text-white/90">First KBC Cabs ride?</span>
          <span className="font-extrabold">Get 10% off</span>
          <button
            type="button"
            onClick={() => void copyCode()}
            className="inline-flex items-center gap-1 rounded-md border border-white/25 bg-white px-2 py-0.5 font-black tracking-wide text-[#d95511] shadow-sm transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#ef6614]"
            aria-label={`Copy promo code ${CAB_WELCOME_PROMO_CODE}`}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : CAB_WELCOME_PROMO_CODE}
          </button>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 grid h-7 w-7 place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white sm:right-4"
          aria-label="Dismiss offer banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
