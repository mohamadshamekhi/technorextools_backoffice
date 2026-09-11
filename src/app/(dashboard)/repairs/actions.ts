"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { warrantiesApi } from "@/lib/api";
import type { RepairStatus } from "@/lib/api/backoffice/moderation";

export async function setRepairStatusAction(
  id: string,
  status: RepairStatus,
): Promise<ActionResult> {
  try {
    await warrantiesApi.setRepairStatus(id, status);
    revalidatePath("/repairs");
    return { ok: true };
  } catch (error) {
    return fail(error, "ثبت وضعیت تعمیر ناموفق بود.");
  }
}
