"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { ticketsApi } from "@/lib/api";
import type { TicketStatus } from "@/lib/api/backoffice/moderation";

/** `mediaIds`: شناسه‌ی فایل‌های از پیش آپلودشده (حداکثر ۵ تا). */
export async function replyTicketAction(
  id: string,
  body: string,
  mediaIds: string[] = [],
): Promise<ActionResult> {
  try {
    await ticketsApi.reply(id, body, mediaIds);
    revalidatePath(`/tickets/${id}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ارسال پاسخ ناموفق بود.");
  }
}

export async function setTicketStatusAction(
  id: string,
  status: TicketStatus,
): Promise<ActionResult> {
  try {
    await ticketsApi.setStatus(id, status);
    revalidatePath(`/tickets/${id}`);
    revalidatePath("/tickets");
    return { ok: true };
  } catch (error) {
    return fail(error, "تغییر وضعیت تیکت ناموفق بود.");
  }
}
