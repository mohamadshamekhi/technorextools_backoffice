"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * نمای خطای مشترک برای error.tsx صفحات.
 * پیام کاربرپسند + دکمه‌ی تلاش مجدد (reset مرز خطای Next).
 */
export function ErrorView({
  title = "مشکلی پیش آمد",
  description = "بارگذاری این بخش ناموفق بود. لطفاً دوباره تلاش کنید.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-surface px-6 py-16 text-center">
      <AlertTriangle className="mb-4 size-10 text-danger" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <RotateCw className="size-4" />
          تلاش مجدد
        </button>
      )}
    </div>
  );
}
