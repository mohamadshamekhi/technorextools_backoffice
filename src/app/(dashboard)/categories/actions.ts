"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { categoriesApi } from "@/lib/api";
import { pruneNullish } from "@/lib/prune";
import type {
  CreateAttributeInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/api/backoffice/categories";

function revalidate(id?: string) {
  revalidatePath("/categories");
  if (id) {
    revalidatePath(`/categories/${id}`);
    revalidatePath(`/categories/${id}/attributes`);
  }
}

export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const c = await categoriesApi.create(
      pruneNullish(input) as CreateCategoryInput,
    );
    revalidate();
    return { ok: true, data: { id: c.id } };
  } catch (error) {
    return fail(error, "ساخت دسته ناموفق بود.");
  }
}

export async function updateCategoryAction(
  id: string,
  input: UpdateCategoryInput,
): Promise<ActionResult> {
  try {
    await categoriesApi.update(id, input);
    revalidate(id);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await categoriesApi.remove(id);
    revalidate();
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف دسته ناموفق بود.");
  }
}

export async function createAttributeGroupAction(
  categoryId: string,
  title: string,
): Promise<ActionResult> {
  try {
    await categoriesApi.createAttributeGroup(categoryId, { title });
    revalidate(categoryId);
    return { ok: true };
  } catch (error) {
    return fail(error, "ساخت گروه ویژگی ناموفق بود.");
  }
}

export async function updateAttributeGroupAction(
  categoryId: string,
  groupId: string,
  title: string,
): Promise<ActionResult> {
  try {
    await categoriesApi.updateAttributeGroup(groupId, { title });
    revalidate(categoryId);
    return { ok: true };
  } catch (error) {
    return fail(error, "ویرایش گروه ویژگی ناموفق بود.");
  }
}

export async function deleteAttributeGroupAction(
  categoryId: string,
  groupId: string,
): Promise<ActionResult> {
  try {
    await categoriesApi.removeAttributeGroup(groupId);
    revalidate(categoryId);
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف گروه ویژگی ناموفق بود.");
  }
}

export async function createAttributeAction(
  categoryId: string,
  groupId: string,
  input: CreateAttributeInput,
): Promise<ActionResult> {
  try {
    await categoriesApi.createAttribute(groupId, input);
    revalidate(categoryId);
    return { ok: true };
  } catch (error) {
    return fail(error, "ساخت ویژگی ناموفق بود.");
  }
}

export async function deleteAttributeAction(
  categoryId: string,
  attributeId: string,
): Promise<ActionResult> {
  try {
    await categoriesApi.removeAttribute(attributeId);
    revalidate(categoryId);
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف ویژگی ناموفق بود.");
  }
}
