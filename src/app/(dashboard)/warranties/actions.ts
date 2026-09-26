"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { warrantiesApi } from "@/lib/api";
import type { IssueWarrantyInput } from "@/lib/api/backoffice/warranties";

export async function issueWarrantyAction(
  input: IssueWarrantyInput,
): Promise<ActionResult> {
  try {
    await warrantiesApi.issueWarranty(input);
    revalidatePath("/warranties");
    return { ok: true };
  } catch (error) {
    return fail(error, "صدور گارانتی ناموفق بود.");
  }
}
