"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { ordersApi } from "@/lib/api";
import type { OrderStatus } from "@/lib/api/backoffice/orders";

/** PATCH /backoffice/orders/{orderNumber}/status */
export async function setOrderStatusAction(
  orderNumber: string,
  status: OrderStatus,
  note?: string,
): Promise<ActionResult> {
  try {
    await ordersApi.setStatus(orderNumber, {
      status,
      note: note?.trim() || undefined,
    });
    revalidatePath(`/orders/${orderNumber}`);
    revalidatePath("/orders");
    return { ok: true };
  } catch (error) {
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
