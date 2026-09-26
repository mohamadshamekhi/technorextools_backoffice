"use server";

import { fail, invalid, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { productQuestionsApi } from "@/lib/api";
import type { ProductQuestionStatus } from "@/lib/api/backoffice/moderation";

/** POST /backoffice/product-questions/{id}/answer — پاسخ‌دادن یعنی انتشار پرسش */
export async function answerProductQuestionAction(
  id: string,
  answer: string,
): Promise<ActionResult> {
  const trimmed = answer.trim();
  if (!trimmed) {
    return invalid({ answer: "متن پاسخ را وارد کنید." });
  }
  try {
    await productQuestionsApi.answer(id, trimmed);
    revalidatePath("/product-questions");
    return { ok: true };
  } catch (error) {
    return fail(error, "ثبت پاسخ ناموفق بود.");
  }
}

/** PATCH /backoffice/product-questions/{id} — تغییر وضعیت بدون پاسخ (مثلاً رد کردن) */
export async function setProductQuestionStatusAction(
  id: string,
  status: ProductQuestionStatus,
): Promise<ActionResult> {
  try {
    await productQuestionsApi.setStatus(id, status);
    revalidatePath("/product-questions");
    return { ok: true };
  } catch (error) {
    return fail(error, "ثبت وضعیت پرسش ناموفق بود.");
  }
}
