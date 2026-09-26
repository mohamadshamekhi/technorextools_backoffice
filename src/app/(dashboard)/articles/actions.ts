"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { contentApi } from "@/lib/api";
import { pruneNullish } from "@/lib/prune";
import type {
  CreateArticleInput,
  UpdateArticleInput,
} from "@/lib/api/backoffice/content";

export async function createArticleAction(
  input: CreateArticleInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const a = await contentApi.createArticle(
      pruneNullish(input) as CreateArticleInput,
    );
    revalidatePath("/articles");
    return { ok: true, data: { id: a.id } };
  } catch (error) {
    return fail(error, "ساخت مقاله ناموفق بود.");
  }
}

export async function updateArticleAction(
  id: string,
  input: UpdateArticleInput,
): Promise<ActionResult> {
  try {
    await contentApi.updateArticle(id, input);
    revalidatePath("/articles");
    revalidatePath(`/articles/${id}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

export async function deleteArticleAction(id: string): Promise<ActionResult> {
  try {
    await contentApi.removeArticle(id);
    revalidatePath("/articles");
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف مقاله ناموفق بود.");
  }
}
