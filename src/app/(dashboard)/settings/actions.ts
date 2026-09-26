"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { settingsApi } from "@/lib/api";
import type { SettingEntry } from "@/lib/api/backoffice/settings";

/** PUT /backoffice/settings — کل مجموعه جایگزین می‌شود */
export async function saveSettingsAction(
  entries: SettingEntry[],
): Promise<ActionResult> {
  const cleaned = entries
    .map((e) => ({ key: e.key.trim(), value: e.value }))
    .filter((e) => e.key.length > 0);

  if (cleaned.length !== new Set(cleaned.map((e) => e.key)).size) {
    return { ok: false, message: "کلیدهای تکراری وجود دارد." };
  }

  try {
    await settingsApi.put({ entries: cleaned });
    revalidatePath("/settings");
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تنظیمات ناموفق بود.");
  }
}
