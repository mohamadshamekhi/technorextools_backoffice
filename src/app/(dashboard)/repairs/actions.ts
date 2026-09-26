"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { warrantiesApi } from "@/lib/api";
import type { RepairStatus } from "@/lib/api/backoffice/moderation";

export async function setRepairStatusAction(
  id: string,
  status: RepairStatus,
  note?: string,
): Promise<ActionResult> {
  try {
    await warrantiesApi.setRepairStatus(id, status, note?.trim() || undefined);
    revalidatePath("/repairs");
    return { ok: true };
  } catch (error) {
    return fail(error, "ثبت وضعیت تعمیر ناموفق بود.");
  }
}

/** ثبت یافته‌های تکنسین (یادداشت و هزینه‌ی تخمینی) */
export async function updateRepairAction(
  id: string,
  input: { technicianNote?: string; estimatedCost?: number },
): Promise<ActionResult> {
  try {
    await warrantiesApi.updateRepair(id, input);
    revalidatePath("/repairs");
    return { ok: true };
  } catch (error) {
    return fail(error, "ثبت یافته‌های تعمیر ناموفق بود.");
  }
}
