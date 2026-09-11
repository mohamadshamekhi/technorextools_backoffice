"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { contentApi } from "@/lib/api";
import { pruneNullish } from "@/lib/prune";
import type {
  CreateBranchInput,
  UpdateBranchInput,
} from "@/lib/api/backoffice/content";

export async function createBranchAction(
  input: CreateBranchInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const b = await contentApi.createBranch(
      pruneNullish(input) as CreateBranchInput,
    );
    revalidatePath("/branches");
    return { ok: true, data: { id: b.id } };
  } catch (error) {
    return fail(error, "ساخت شعبه ناموفق بود.");
  }
}

export async function updateBranchAction(
  id: string,
  input: UpdateBranchInput,
): Promise<ActionResult> {
  try {
    await contentApi.updateBranch(id, input);
    revalidatePath("/branches");
    revalidatePath(`/branches/${id}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

export async function deleteBranchAction(id: string): Promise<ActionResult> {
  try {
    await contentApi.removeBranch(id);
    revalidatePath("/branches");
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف شعبه ناموفق بود.");
  }
}
