"use client";

import { useCallback, useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type OtpBoxesProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
  label?: string;
};

export function OtpBoxes({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
  id = "otp-boxes",
  label = "Enter OTP sent to your mobile number",
}: OtpBoxesProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (!autoFocus || disabled) return;
    inputsRef.current[0]?.focus();
  }, [autoFocus, disabled]);

  const setDigit = useCallback(
    (index: number, char: string) => {
      const next = digits.slice();
      next[index] = char;
      onChange(next.join("").replace(/\D/g, "").slice(0, length));
    },
    [digits, length, onChange],
  );

  const focusAt = (index: number) => {
    const el = inputsRef.current[Math.max(0, Math.min(length - 1, index))];
    el?.focus();
    el?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setDigit(index, "");
      return;
    }
    // Paste or multi-digit into one box
    if (cleaned.length > 1) {
      const merged = (value.slice(0, index) + cleaned).replace(/\D/g, "").slice(0, length);
      onChange(merged);
      focusAt(Math.min(merged.length, length - 1));
      return;
    }
    setDigit(index, cleaned);
    if (index < length - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        setDigit(index - 1, "");
        focusAt(index - 1);
      }
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusAt(Math.min(pasted.length, length - 1));
  };

  return (
    <div>
      <label htmlFor={`${id}-0`} className="mb-2 block text-sm font-semibold text-[#403842]">
        {label}
        <span className="text-[#ef6614]" aria-hidden>
          *
        </span>
      </label>
      <div className="flex justify-between gap-2 sm:gap-2.5" role="group" aria-label={label}>
        {digits.map((digit, index) => (
          <input
            key={index}
            id={`${id}-${index}`}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={length}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={cn(
              "h-12 w-11 shrink-0 rounded-lg border bg-white text-center text-lg font-bold text-[#1f1820] outline-none transition sm:h-[52px] sm:w-12",
              "border-[#d9d9d9] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/25",
              digit && "border-[#0d9488]/60",
              disabled && "cursor-not-allowed opacity-60",
            )}
          />
        ))}
      </div>
    </div>
  );
}
