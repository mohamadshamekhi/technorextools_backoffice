"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Loader2 } from "lucide-react";
import { FormMessage } from "@/components/ui/form-controls";
import { confirmCashPaymentAction } from "../actions";
import type { ActionResult } from "@/lib/forms";

/**
 * دکمه‌ی «تأیید دریافت وجه نقد» — فقط برای سفارش نقدیِ در انتظار پرداخت نمایش داده می‌شود
 * (شرط در صفحه‌ی جزئیات سفارش). اگر ادمین دیر بجنبد و سفارش توسط sweep job رهاشده اعلام شود،
 * بک‌اند ۴۰۰ برمی‌گرداند؛ پیامش همین‌جا نمایش داده می‌شود.
 */
export function ConfirmCashPaymentButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  function handleClick() {
    setResult(null);
    startTransition(async () => {
      const res = await confirmCashPaymentAction(orderNumber);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Banknote className="size-4" />
        )}
        تأیید دریافت وجه نقد
      </button>
      {result && !result.ok && (
        <FormMessage tone="danger">{result.message}</FormMessage>
      )}
    </div>
  );
}
