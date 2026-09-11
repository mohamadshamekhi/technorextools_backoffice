"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { discountsApi } from "@/lib/api";
import { pruneNullish } from "@/lib/prune";
import type {
  CreateDiscountInput,
  UpdateDiscountInput,
} from "@/lib/api/backoffice/discounts";

export async function createDiscountAction(
  input: CreateDiscountInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const d = await discountsApi.create(
      pruneNullish(input) as CreateDiscountInput,
    );
    revalidatePath("/discounts");
    return { ok: true, data: { id: d.id } };
  } catch (error) {
    return fail(error, "ساخت کد تخفیف ناموفق بود.");
  }
}

export async function updateDiscountAction(
  id: string,
  input: UpdateDiscountInput,
): Promise<ActionResult> {
  try {
    await discountsApi.update(id, input);
    revalidatePath("/discounts");
    revalidatePath(`/discounts/${id}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

export async function deleteDiscountAction(id: string): Promise<ActionResult> {
  try {
    await discountsApi.remove(id);
    revalidatePath("/discounts");
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف کد تخفیف ناموفق بود.");
  }
}
