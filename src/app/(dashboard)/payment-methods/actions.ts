"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { paymentsApi } from "@/lib/api";
import { pruneNullish } from "@/lib/prune";
import type {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from "@/lib/api/backoffice/payments";

export async function createPaymentMethodAction(
  input: CreatePaymentMethodInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const m = await paymentsApi.createMethod(
      pruneNullish(input) as CreatePaymentMethodInput,
    );
    revalidatePath("/payment-methods");
    return { ok: true, data: { id: m.id } };
  } catch (error) {
    return fail(error, "ساخت روش پرداخت ناموفق بود.");
  }
}

export async function updatePaymentMethodAction(
  id: string,
  input: UpdatePaymentMethodInput,
): Promise<ActionResult> {
  try {
    await paymentsApi.updateMethod(id, input);
    revalidatePath("/payment-methods");
    revalidatePath(`/payment-methods/${id}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

export async function deletePaymentMethodAction(id: string): Promise<ActionResult> {
  try {
    await paymentsApi.removeMethod(id);
    revalidatePath("/payment-methods");
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف روش پرداخت ناموفق بود.");
  }
}
