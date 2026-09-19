"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

/** A focused mobile header for auth pages: branded, but with an obvious exit. */
export function AuthMobileHeader() {
  const router = useRouter();

  function closeAuth() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:hidden">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between rounded-2xl border border-white/25 bg-[#201613]/55 px-3 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="flex h-9 items-center rounded-xl bg-white px-2.5 shadow-sm">
          <BrandLogo size="sm" className="!gap-1.5" />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={closeAuth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/12 text-white transition hover:bg-white/20"
            aria-label="Close sign in"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}
