"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { inventoryApi } from "@/lib/api";
import type {
  PriceTier,
  UpdateInventoryVariantInput,
} from "@/lib/api/backoffice/inventory";

export async function updateVariantAction(
  id: string,
  input: UpdateInventoryVariantInput,
): Promise<ActionResult> {
  try {
    await inventoryApi.update(id, input);
    revalidatePath("/inventory");
    revalidatePath(`/inventory/${id}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره موجودی/قیمت ناموفق بود.");
  }
}

export async function replacePriceTiersAction(
  id: string,
  tiers: PriceTier[],
): Promise<ActionResult> {
  try {
    await inventoryApi.replacePriceTiers(id, tiers);
    revalidatePath(`/inventory/${id}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره لایه‌های قیمت ناموفق بود.");
  }
}
