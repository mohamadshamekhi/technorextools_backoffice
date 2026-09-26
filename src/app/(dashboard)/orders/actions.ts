"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { ordersApi, ApiError } from "@/lib/api";
import type { OrderStatus } from "@/lib/api/backoffice/orders";

/** فیلدهای اختیاری همراه تغییر وضعیت؛ `carrier`/`trackingNumber` فقط برای `shipped` */
export type SetOrderStatusExtras = {
  note?: string;
  carrier?: string;
  trackingNumber?: string;
};

/**
 * PATCH /backoffice/orders/{orderNumber}/status
 * اگر ادمین دیگری هم‌زمان وضعیت را عوض کرده باشد بک‌اند `409` می‌دهد؛
 * پیام تعارض برگردانده می‌شود تا فرم آن را نشان دهد و لیست را تازه کند.
 */
export async function setOrderStatusAction(
  orderNumber: string,
  status: OrderStatus,
  extras: SetOrderStatusExtras = {},
): Promise<ActionResult> {
  try {
    await ordersApi.setStatus(orderNumber, {
      status,
      note: extras.note?.trim() || undefined,
      // بک‌اند این دو را فقط برای وضعیت ارسال‌شده ذخیره می‌کند
      carrier: status === "shipped" ? extras.carrier?.trim() || undefined : undefined,
      trackingNumber:
        status === "shipped" ? extras.trackingNumber?.trim() || undefined : undefined,
    });
    revalidatePath(`/orders/${orderNumber}`);
    revalidatePath("/orders");
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      revalidatePath(`/orders/${orderNumber}`);
      revalidatePath("/orders");
      return {
        ok: false,
        message:
          error.body.message ??
          "وضعیت این سفارش هم‌زمان توسط کاربر دیگری تغییر کرده است؛ وضعیت تازه را ببینید و دوباره تلاش کنید.",
      };
    }
    return fail(error, "تغییر وضعیت ناموفق بود.");
  }
}

/**
 * PATCH /backoffice/orders/{orderNumber}/confirm-cash-payment — تأیید دریافت وجه نقد.
 * فقط برای سفارش نقدیِ در انتظار پرداخت معتبر است؛ پیام خطای بک‌اند (مثلاً «رهاشده») مستقیم نمایش داده می‌شود.
 */
export async function confirmCashPaymentAction(
  orderNumber: string,
): Promise<ActionResult> {
  try {
    await ordersApi.confirmCashPayment(orderNumber);
    revalidatePath(`/orders/${orderNumber}`);
    revalidatePath("/orders");
    return { ok: true };
  } catch (error) {
    return fail(error, "تأیید دریافت وجه نقد ناموفق بود.");
  }
}
