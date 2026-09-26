"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { accessApi } from "@/lib/api";
import { pruneNullish } from "@/lib/prune";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "@/lib/api/backoffice/access";

export async function createRoleAction(
  input: CreateRoleInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const role = await accessApi.createRole(
      pruneNullish(input) as CreateRoleInput,
    );
    revalidatePath("/roles");
    return { ok: true, data: { id: role.id } };
  } catch (error) {
    return fail(error, "ساخت نقش ناموفق بود.");
  }
}

export async function updateRoleAction(
  id: string,
  input: UpdateRoleInput,
): Promise<ActionResult> {
  try {
    await accessApi.updateRole(id, input);
    revalidatePath("/roles");
    revalidatePath(`/roles/${id}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

export async function deleteRoleAction(id: string): Promise<ActionResult> {
  try {
    await accessApi.removeRole(id);
    revalidatePath("/roles");
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف نقش ناموفق بود.");
  }
}
