"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PhoneOtpLoginForm } from "@/components/auth/phone-otp-login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { useAuthOptional } from "@/contexts/auth-context";
import { navigateAfterAuth } from "@/lib/auth-navigation";
import { cn } from "@/lib/utils";

type SignupTab = "otp" | "email";

export function SignupPageClient() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const auth = useAuthOptional();
  const [tab, setTab] = useState<SignupTab>("otp");
  const loginHref = useMemo(() => {
    const params = new URLSearchParams();
    if (searchParams.get("redirect")) params.set("redirect", searchParams.get("redirect")!);
    if (searchParams.get("role")) params.set("role", searchParams.get("role")!);
    const q = params.toString();
    return q ? `/login?${q}` : "/login";
  }, [searchParams]);

  useEffect(() => {
    if (auth?.isAuthenticated && !auth.isLoading) {
      navigateAfterAuth(redirectTo);
    }
  }, [auth?.isAuthenticated, auth?.isLoading, redirectTo]);

  if (auth?.isLoading || auth?.isAuthenticated) {
    return (
      <p className="flex items-center justify-center gap-2 py-8 text-sm text-[#757575]">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Redirecting…
      </p>
    );
  }

  return (
    <>
      <div className="mb-5 flex rounded-xl bg-[#f4efeb] p-1">
        {(
          [
            { id: "otp" as const, label: "Phone OTP" },
            { id: "email" as const, label: "Email signup" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-[13px] font-bold transition",
              tab === t.id
                ? "bg-white text-[#1f1820] shadow-sm ring-1 ring-[#e6ddd7]"
                : "text-[#7a7178] hover:text-[#403842]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "otp" ? (
        <>
          <p className="mb-4 text-[12px] text-[#837882]">
            New number? Verify OTP and we&apos;ll create your account automatically.
          </p>
          <PhoneOtpLoginForm redirectTo={redirectTo} />
        </>
      ) : (
        <SignupForm redirectTo={redirectTo} />
      )}

      <p className="mt-4 text-center text-[12px] text-[#757575]">
        Already have an account?{" "}
        <Link href={loginHref} className="font-bold text-[#ef6614] hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
