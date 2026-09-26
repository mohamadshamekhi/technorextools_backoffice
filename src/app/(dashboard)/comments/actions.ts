"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { commentsApi } from "@/lib/api";
import type { CommentStatus } from "@/lib/api/backoffice/moderation";

export async function moderateCommentAction(
  id: string,
  status: CommentStatus,
): Promise<ActionResult> {
  try {
    await commentsApi.moderate(id, status);
    revalidatePath("/comments");
    return { ok: true };
  } catch (error) {
    return fail(error, "ثبت وضعیت نظر ناموفق بود.");
  }
}
