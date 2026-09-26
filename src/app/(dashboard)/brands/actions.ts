"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { brandsApi } from "@/lib/api";
import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "@/lib/api/backoffice/brands";

export async function createBrandAction(
  input: CreateBrandInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    // authenticityNote در createBrandSchema نال‌پذیر است ولی کلیدش الزامی است —
    // برخلاف parentId/description در دامنه‌های دیگر، اینجا نباید با pruneNullish
    // حذف شود (حذف کلید = خطای «Required»، نه رفع خطا).
    // لوگو دیگر در بدنه نمی‌آید؛ جدا روی /backoffice/media/upload آپلود می‌شود.
    const brand = await brandsApi.create(input);
    revalidatePath("/brands");
    return { ok: true, data: { id: brand.id } };
  } catch (error) {
    return fail(error, "ساخت برند ناموفق بود.");
  }
}

export async function updateBrandAction(
  brandId: string,
  input: UpdateBrandInput,
): Promise<ActionResult> {
  try {
    await brandsApi.update(brandId, input);
    revalidatePath("/brands");
    revalidatePath(`/brands/${brandId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

export async function deleteBrandAction(brandId: string): Promise<ActionResult> {
  try {
    await brandsApi.remove(brandId);
    revalidatePath("/brands");
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف برند ناموفق بود.");
  }
}
