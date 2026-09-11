"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { bundlesApi } from "@/lib/api";
import { pruneNullish } from "@/lib/prune";
import type {
  CreateBundleInput,
  UpdateBundleInput,
} from "@/lib/api/backoffice/bundles";

export async function createBundleAction(
  input: CreateBundleInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const b = await bundlesApi.create(
      pruneNullish(input) as CreateBundleInput,
    );
    revalidatePath("/bundles");
    return { ok: true, data: { id: b.id } };
  } catch (error) {
    return fail(error, "ساخت پکیج ناموفق بود.");
  }
}

export async function updateBundleAction(
  id: string,
  input: UpdateBundleInput,
): Promise<ActionResult> {
  try {
    await bundlesApi.update(id, input);
    revalidatePath("/bundles");
    revalidatePath(`/bundles/${id}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

export async function deleteBundleAction(id: string): Promise<ActionResult> {
  try {
    await bundlesApi.remove(id);
    revalidatePath("/bundles");
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف پکیج ناموفق بود.");
  }
}
