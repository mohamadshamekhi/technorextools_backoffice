import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";

/** دسته‌بندی‌ها و ویژگی‌ها — docs/api/backoffice.md § Categories. Perm: `categories.view` / `categories.manage`. */

export type BackofficeCategory = {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export type CategoryTreeNode = BackofficeCategory & { children: CategoryTreeNode[] };

export type ListCategoriesQuery = ListQuery & {
  search?: string;
  isActive?: boolean;
};

export type CreateCategoryInput = {
  title: string;
  slug: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type AttributeInputType = "text" | "number" | "select" | "boolean";

export type Attribute = {
  id: string;
  groupId: string;
  title: string;
  unit: string | null;
  inputType: AttributeInputType;
  options: string[];
  sortOrder: number;
};

export type AttributeGroup = {
  id: string;
  categoryId: string;
  title: string;
  attributes: Attribute[];
};

export type CreateAttributeGroupInput = { title: string };
export type CreateAttributeInput = {
  title: string;
  /** کلید الزامی، نال‌پذیر — بدون واحد حتماً null بفرست، نه حذف کلید */
  unit: string | null;
  inputType?: AttributeInputType;
  /** اگر inputType=select حداقل یک گزینه لازم است */
  options?: string[];
  sortOrder?: number;
};

/** GET /backoffice/categories */
export const list = (query: ListCategoriesQuery = {}) =>
  api.get<Paginated<BackofficeCategory>>("/backoffice/categories", { query });

/** GET /backoffice/categories/tree */
export const tree = () =>
  api.get<CategoryTreeNode[]>("/backoffice/categories/tree");

/** POST /backoffice/categories */
export const create = (input: CreateCategoryInput) =>
  api.post<BackofficeCategory>("/backoffice/categories", input);

/** PATCH /backoffice/categories/{id} */
export const update = (id: string, input: UpdateCategoryInput) =>
  api.patch<BackofficeCategory>(`/backoffice/categories/${id}`, input);

/** DELETE /backoffice/categories/{id} */
export const remove = (id: string) =>
  api.delete<void>(`/backoffice/categories/${id}`);

/** GET /backoffice/categories/{categoryId}/attribute-groups */
export const listAttributeGroups = (categoryId: string) =>
  api.get<AttributeGroup[]>(
    `/backoffice/categories/${categoryId}/attribute-groups`,
  );

/** POST /backoffice/categories/{categoryId}/attribute-groups */
export const createAttributeGroup = (
  categoryId: string,
  input: CreateAttributeGroupInput,
) =>
  api.post<AttributeGroup>(
    `/backoffice/categories/${categoryId}/attribute-groups`,
    input,
  );

/** PATCH /backoffice/attribute-groups/{id} */
export const updateAttributeGroup = (
  id: string,
  input: CreateAttributeGroupInput,
) => api.patch<AttributeGroup>(`/backoffice/attribute-groups/${id}`, input);

/** DELETE /backoffice/attribute-groups/{id} */
export const removeAttributeGroup = (id: string) =>
  api.delete<void>(`/backoffice/attribute-groups/${id}`);

/** POST /backoffice/attribute-groups/{groupId}/attributes */
export const createAttribute = (groupId: string, input: CreateAttributeInput) =>
  api.post<Attribute>(
    `/backoffice/attribute-groups/${groupId}/attributes`,
    input,
  );

/** PATCH /backoffice/attributes/{id} */
export const updateAttribute = (
  id: string,
  input: Partial<CreateAttributeInput>,
) => api.patch<Attribute>(`/backoffice/attributes/${id}`, input);

/** DELETE /backoffice/attributes/{id} */
export const removeAttribute = (id: string) =>
  api.delete<void>(`/backoffice/attributes/${id}`);
