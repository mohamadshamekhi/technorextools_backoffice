"use client";

import { useEffect, useRef } from "react";

/**
 * ورودی کد تایید با خانه‌های جدا (پیش‌فرض ۵ رقمی — مطابق بک‌اند).
 * چون inputها uncontrolled هستند، value فقط برای حالت‌های پرش (paste/backspace) استفاده می‌شود.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 5,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  /** تعداد ارقام کد */
  length?: number;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const commit = (next: string) => {
    onChange(next);
    if (next.length === length && !next.includes(" ")) onComplete?.(next);
  };

  const setDigit = (index: number, digit: string) => {
    const chars = digits.map((d) => (d === " " ? "" : d));
    chars[index] = digit;
    const next = chars.join("").replace(/\s/g, "").slice(0, length);
    commit(next);
    if (digit) inputsRef.current[index + 1]?.focus();
  };

  return (
    <div dir="ltr" className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          defaultValue={digit.trim()}
          className="size-12 rounded-lg border bg-background text-center text-xl outline-none focus:border-primary"
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, "").slice(-1);
            e.target.value = digit;
            if (digit) setDigit(index, digit);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              if (!e.currentTarget.value && index > 0) {
                inputsRef.current[index - 1]?.focus();
                inputsRef.current[index - 1]!.value = "";
                commit(value.slice(0, index - 1));
              }
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, length);
            if (!pasted) return;
            pasted.split("").forEach((d, i) => {
              if (inputsRef.current[i]) inputsRef.current[i]!.value = d;
            });
            commit(pasted);
            inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
          }}
        />
      ))}
    </div>
  );
}
