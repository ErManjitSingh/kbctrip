"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage } from "@/contexts/auth-context";
import { resetPassword } from "@/lib/hotels-auth-api";

/** Legacy email-link reset page (token in query). OTP flow uses /forgot-password. */
export function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("This reset link is missing a token. Request a new one.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-emerald-700">Password updated successfully.</p>
        <Button
          type="button"
          onClick={() => router.push("/login")}
          className="h-11 w-full rounded-xl border-0 bg-[#EF6614] bg-none text-sm font-bold text-white hover:bg-[#E65100]"
        >
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!token ? (
        <p className="text-[12px] font-medium text-red-600">
          Invalid reset link.{" "}
          <Link href="/forgot-password" className="font-bold underline">
            Request a new OTP
          </Link>
          .
        </p>
      ) : null}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#403842]">New password</label>
        <Input
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-xl border-[#e4dbd5]"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#403842]">Confirm password</label>
        <Input
          type="password"
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="h-11 rounded-xl border-[#e4dbd5]"
          required
        />
      </div>
      {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}
      <Button
        type="submit"
        disabled={loading || !token}
        className="h-11 w-full rounded-xl border-0 bg-[#EF6614] bg-none text-sm font-bold text-white hover:bg-[#E65100]"
      >
        {loading ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}
