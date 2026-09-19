"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpBoxes } from "@/components/auth/otp-boxes";
import { getAuthErrorMessage } from "@/contexts/auth-context";
import {
  forgotPasswordOtpSend,
  forgotPasswordOtpVerify,
  resetPassword,
} from "@/lib/hotels-auth-api";
import { cn } from "@/lib/utils";

type Channel = "phone" | "email";
type Step = "identify" | "otp" | "password" | "done";

export function ForgotPasswordClient() {
  const router = useRouter();
  const [channel, setChannel] = useState<Channel>("phone");
  const [step, setStep] = useState<Step>("identify");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (channel === "phone" && normalizedPhone.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (channel === "email" && !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const data = await forgotPasswordOtpSend(
        channel === "phone" ? { phone: normalizedPhone } : { email: email.trim() },
      );
      setInfo(data.message ?? "If that account exists, an OTP has been sent.");
      setStep("otp");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.replace(/\D/g, "").length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const data = await forgotPasswordOtpVerify({
        otp,
        ...(channel === "phone" ? { phone: normalizedPhone } : { email: email.trim() }),
      });
      setResetToken(data.reset_token);
      setInfo(data.message ?? "OTP verified. Set a new password.");
      setStep("password");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
      await resetPassword(resetToken, password);
      setStep("done");
      setInfo("Password updated. You can sign in now.");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-emerald-700">{info}</p>
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
    <div className="space-y-4">
      <div className="flex rounded-xl bg-[#f4efeb] p-1">
        {(
          [
            { id: "phone" as const, label: "Phone OTP" },
            { id: "email" as const, label: "Email OTP" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={step !== "identify"}
            onClick={() => {
              setChannel(t.id);
              setError(null);
              setInfo(null);
            }}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-[13px] font-bold transition",
              channel === t.id
                ? "bg-white text-[#1f1820] shadow-sm ring-1 ring-[#e6ddd7]"
                : "text-[#7a7178] hover:text-[#403842]",
              step !== "identify" && "opacity-60",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {step === "identify" ? (
        <form onSubmit={handleSend} className="space-y-4">
          {channel === "phone" ? (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#403842]">Mobile number</label>
              <div className="flex gap-2">
                <span className="flex h-11 items-center rounded-xl border border-[#e4dbd5] bg-[#faf7f5] px-3 text-sm font-semibold text-[#616161]">
                  +91
                </span>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="h-11 rounded-xl border-[#e4dbd5]"
                  placeholder="10-digit number"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#403842]">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-[#e4dbd5]"
                placeholder="you@example.com"
              />
            </div>
          )}
          {info ? <p className="text-[12px] font-medium text-emerald-700">{info}</p> : null}
          {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl border-0 bg-[#EF6614] bg-none text-sm font-bold text-white hover:bg-[#E65100]"
          >
            {loading ? "Sending…" : "Send OTP"}
          </Button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={handleVerify} className="space-y-4">
          <OtpBoxes
            id="forgot-otp"
            value={otp}
            onChange={setOtp}
            disabled={loading}
            label={
              channel === "phone"
                ? "Enter OTP sent to your mobile number"
                : "Enter OTP sent to your email"
            }
          />
          <button
            type="button"
            className="text-[12px] font-bold text-[#ef6614] hover:underline"
            onClick={() => {
              setStep("identify");
              setOtp("");
            }}
          >
            Change {channel === "phone" ? "number" : "email"}
          </button>
          {info ? <p className="text-[12px] font-medium text-emerald-700">{info}</p> : null}
          {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl border-0 bg-[#EF6614] bg-none text-sm font-bold text-white hover:bg-[#E65100]"
          >
            {loading ? "Verifying…" : "Verify OTP"}
          </Button>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#403842]">New password</label>
            <Input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border-[#e4dbd5]"
              placeholder="At least 8 characters"
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
              placeholder="Repeat password"
            />
          </div>
          {info ? <p className="text-[12px] font-medium text-emerald-700">{info}</p> : null}
          {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl border-0 bg-[#EF6614] bg-none text-sm font-bold text-white hover:bg-[#E65100]"
          >
            {loading ? "Saving…" : "Update password"}
          </Button>
        </form>
      ) : null}

      <p className="text-center text-[12px] text-[#757575]">
        Remembered it?{" "}
        <Link href="/login" className="font-bold text-[#ef6614] hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
