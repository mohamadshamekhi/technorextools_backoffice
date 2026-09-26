"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { usersApi } from "@/lib/api";
import type { UpdateUserInput } from "@/lib/api/backoffice/users";

/** PATCH /backoffice/users/{id} — Perm: users.manage */
export async function updateUserAction(
  userId: string,
  input: UpdateUserInput,
): Promise<ActionResult> {
  try {
    await usersApi.update(userId, input);
    revalidatePath(`/users/${userId}`);
    revalidatePath("/users");
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}
