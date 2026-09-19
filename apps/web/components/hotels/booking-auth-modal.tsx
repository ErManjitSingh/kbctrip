"use client";

/**
 * BookingAuthModal — login inside booking/checkout flows.
 * Phone OTP is primary (creates account if new). Email+password secondary.
 * After auth succeeds, closes modal and continues booking (no page redirect).
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { PhoneOtpLoginForm } from "@/components/auth/phone-otp-login-form";
import { EmailLoginForm } from "@/components/auth/email-login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { useAuthOptional } from "@/contexts/auth-context";
import { TRAVEL_HOME_BRAND, TRAVEL_HOME_LOGO_SRC } from "@/lib/travel-home-brand";
import { cn } from "@/lib/utils";

type AuthTab = "otp" | "password" | "signup";

type BookingAuthModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Prefill for email signup only. */
  prefill?: { name?: string; email?: string; phone?: string };
  title?: string;
  subtitle?: string;
  footerNote?: string;
};

export function BookingAuthModal({
  open,
  onClose,
  onSuccess,
  prefill,
  title = "Login to continue booking",
  subtitle = "Sign in with OTP — fastest way to continue",
  footerNote = "Your booking details are saved. Login to confirm.",
}: BookingAuthModalProps) {
  const auth = useAuthOptional();
  const [tab, setTab] = useState<AuthTab>("otp");

  useEffect(() => {
    if (auth?.isAuthenticated && !auth.isLoading && open) {
      onSuccess();
      onClose();
    }
  }, [auth?.isAuthenticated, auth?.isLoading, open, onSuccess, onClose]);

  if (!open) return null;

  const stayPath =
    typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-[580px] flex-col rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#9E9E9E] hover:bg-[#f5f5f5] hover:text-[#212121]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-[#eee] px-6 pb-4 pt-6 text-center">
          <div className="relative mx-auto mb-3 h-9 w-[110px]">
            <Image
              src={TRAVEL_HOME_LOGO_SRC}
              alt={TRAVEL_HOME_BRAND.name}
              fill
              className="object-contain"
              sizes="110px"
            />
          </div>
          <h2 className="text-[17px] font-bold text-[#212121]">{title}</h2>
          <p className="mt-1 text-[12px] text-[#757575]">{subtitle}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4 flex rounded-lg border border-[#e0e0e0] bg-[#f5f5f5] p-1">
            {(
              [
                { id: "otp" as const, label: "Phone OTP" },
                { id: "password" as const, label: "Password" },
                { id: "signup" as const, label: "Sign up" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 rounded-md py-2 text-[13px] font-semibold transition",
                  tab === t.id
                    ? "bg-white text-[#212121] shadow-sm"
                    : "text-[#757575] hover:text-[#212121]",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "otp" ? (
            <PhoneOtpLoginForm redirectTo={stayPath} onAuthComplete={() => {}} />
          ) : null}
          {tab === "password" ? (
            <EmailLoginForm redirectTo={stayPath} onAuthComplete={() => {}} />
          ) : null}
          {tab === "signup" ? (
            <SignupForm
              redirectTo={stayPath}
              onAuthComplete={() => {}}
              initialName={prefill?.name}
              initialEmail={prefill?.email}
              initialPhone={prefill?.phone}
            />
          ) : null}

          <p className="mt-4 text-center text-[11px] text-[#9E9E9E]">
            {footerNote}{" "}
            <Link href="/forgot-password" className="font-semibold text-[#ef6614] hover:underline">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
