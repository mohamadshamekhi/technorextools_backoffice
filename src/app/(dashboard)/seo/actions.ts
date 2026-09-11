"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { contentApi } from "@/lib/api";
import type { UpsertSeoInput } from "@/lib/api/backoffice/content";

export async function upsertSeoAction(
  input: UpsertSeoInput,
): Promise<ActionResult> {
  try {
    await contentApi.upsertSeo(input);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره متادیتای سئو ناموفق بود.");
  }
}
