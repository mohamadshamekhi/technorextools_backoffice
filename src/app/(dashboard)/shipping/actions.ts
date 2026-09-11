"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { shippingApi } from "@/lib/api";
import { pruneNullish } from "@/lib/prune";
import type {
  CreateShippingMethodInput,
  UpdateShippingMethodInput,
} from "@/lib/api/backoffice/shipping";

export async function createShippingAction(
  input: CreateShippingMethodInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const m = await shippingApi.create(
      pruneNullish(input) as CreateShippingMethodInput,
    );
    revalidatePath("/shipping");
    return { ok: true, data: { id: m.id } };
  } catch (error) {
    return fail(error, "ساخت روش ارسال ناموفق بود.");
  }
}

export async function updateShippingAction(
  id: string,
  input: UpdateShippingMethodInput,
): Promise<ActionResult> {
  try {
    await shippingApi.update(id, input);
    revalidatePath("/shipping");
    revalidatePath(`/shipping/${id}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

export async function deleteShippingAction(id: string): Promise<ActionResult> {
  try {
    await shippingApi.remove(id);
    revalidatePath("/shipping");
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف روش ارسال ناموفق بود.");
  }
}
