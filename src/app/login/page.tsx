"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, LogIn, Smartphone } from "lucide-react";
import { OtpInput } from "@/components/auth/otp-input";
import { sendOtpAction, verifyOtpAction } from "@/lib/auth-actions";

type Step = "phone" | "otp";

const RESEND_SECONDS = 120;

// طول کد تایید — مطابق بک‌اند (۵ رقمی)
const OTP_LENGTH = 5;

// اعتبارسنجی شماره موبایل ایران: 09xxxxxxxxx
const MOBILE_REGEX = /^09\d{9}$/;

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("phone");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  // شمارش معکوس ارسال مجدد کد
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  /** مرحله ۱: ارسال کد تایید به شماره موبایل */
  function handleSendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (!MOBILE_REGEX.test(mobile)) {
      setError("شماره موبایل معتبر نیست (مثال: 09123456789)");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await sendOtpAction(mobile);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setStep("otp");
      setResendIn(result.status === "sent" ? result.resendAfter : RESEND_SECONDS);
    });
  }

  /** مرحله ۲: تایید کد و ورود به پنل */
  function handleVerifyOtp(code = otp) {
    setError(null);
    startTransition(async () => {
      const result = await verifyOtpAction(mobile, code);
      if (result.status === "error") {
        setError(result.message);
        setOtp("");
        return;
      }
      router.replace("/");
      router.refresh();
    });
  }

  function backToPhone() {
    setStep("phone");
    setOtp("");
    setError(null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-surface p-8 shadow-sm">
        {step === "phone" ? (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">ورود به پنل مدیریت</h1>
              <p className="mt-1 text-sm text-muted">
                شماره موبایل خود را وارد کنید
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="mobile" className="mb-1 block text-sm">
                  شماره موبایل
                </label>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <input
                    id="mobile"
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={11}
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full rounded-lg border bg-background py-2 pl-3 pr-9 text-sm outline-none focus:border-primary"
                    placeholder="09123456789"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogIn className="size-4" />
                )}
                دریافت کد تایید
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">کد تایید</h1>
              <p className="mt-1 text-sm text-muted">
                کد ارسال‌شده به{" "}
                <span dir="ltr" className="font-medium">
                  {mobile}
                </span>{" "}
                را وارد کنید
              </p>
            </div>

            <div className="space-y-4">
              <OtpInput
                value={otp}
                onChange={setOtp}
                onComplete={(code) => handleVerifyOtp(code)}
                length={OTP_LENGTH}
              />

              {error && (
                <p className="text-center text-xs text-danger">{error}</p>
              )}

              {isPending && (
                <p className="flex items-center justify-center gap-2 text-sm text-muted">
                  <Loader2 className="size-4 animate-spin" />
                  در حال بررسی…
                </p>
              )}

              <button
                type="button"
                disabled={isPending || otp.length < OTP_LENGTH}
                onClick={() => handleVerifyOtp()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                ورود به پنل
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={backToPhone}
                  className="flex items-center gap-1 text-muted hover:text-foreground"
                >
                  <ArrowRight className="size-4" />
                  تغییر شماره
                </button>

                {resendIn > 0 ? (
                  <span className="text-muted">
                    ارسال مجدد تا {resendIn} ثانیه
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-primary hover:opacity-80"
                  >
                    ارسال مجدد کد
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
