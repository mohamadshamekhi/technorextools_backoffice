"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { loyaltyApi } from "@/lib/api";

export async function adjustPointsAction(
  userId: string,
  points: number,
  note: string,
): Promise<ActionResult> {
  try {
    await loyaltyApi.adjust(userId, { points, note: note.trim() });
    revalidatePath("/loyalty");
    return { ok: true };
  } catch (error) {
    return fail(error, "ثبت امتیاز ناموفق بود.");
  }
}
