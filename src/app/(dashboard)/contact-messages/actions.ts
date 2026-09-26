"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { contactApi } from "@/lib/api";
import type { ContactMessageStatus } from "@/lib/api/backoffice/moderation";

/** PATCH /backoffice/contact-messages/{id} */
export async function setContactMessageStatusAction(
  id: string,
  status: ContactMessageStatus,
): Promise<ActionResult> {
  try {
    await contactApi.setStatus(id, status);
    revalidatePath("/contact-messages");
    return { ok: true };
  } catch (error) {
    return fail(error, "ثبت وضعیت پیام ناموفق بود.");
  }
}
