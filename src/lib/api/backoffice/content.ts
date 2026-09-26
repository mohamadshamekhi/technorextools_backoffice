import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";

/** محتوا: مقالات، شعب، سئو — docs/api/backoffice.md § Content. Perm: `articles.manage` / `branches.manage`. */

export type BackofficeArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  /** فقط خواندنی — با آپلود رسانه (`ownerType=ARTICLE`, `purpose=COVER`) ست می‌شود. */
  coverImage: string | null;
  body: string;
  publishedAt: string | null;
  createdAt: string;
};

/** بدنه دیگر `coverImage` نمی‌گیرد؛ کاور با `POST /backoffice/media/upload` آپلود می‌شود. */
export type CreateArticleInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  publishedAt?: string | null;
};
export type UpdateArticleInput = Partial<CreateArticleInput>;

export type BackofficeBranch = {
  id: string;
  title: string;
  address: string;
  phone: string;
  workingHours: string | null;
  isWholesalePoint: boolean;
};

export type CreateBranchInput = {
  title: string;
  address: string;
  phone: string;
  workingHours?: string | null;
  isWholesalePoint?: boolean;
};
export type UpdateBranchInput = Partial<CreateBranchInput>;

export type SeoEntityType = "product" | "article" | "category" | "brand";

export type SeoMeta = {
  entityType: SeoEntityType;
  entityId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  /** فقط خواندنی — با آپلود رسانه روی خود موجودیت (`purpose=OG_IMAGE`) ست می‌شود. */
  ogImage: string | null;
  canonicalUrl: string | null;
};

/** بدنه دیگر `ogImage` نمی‌گیرد؛ تصویر OG با آپلود رسانه روی همان موجودیت ست می‌شود. */
export type UpsertSeoInput = Omit<SeoMeta, "ogImage">;

/** GET /backoffice/content/articles */
export const listArticles = (query: ListQuery = {}) =>
  api.get<Paginated<BackofficeArticle>>("/backoffice/content/articles", {
    query,
  });

/** GET /backoffice/content/articles/{id} */
export const getArticle = (id: string) =>
  api.get<BackofficeArticle>(`/backoffice/content/articles/${id}`);

/** POST /backoffice/content/articles */
export const createArticle = (input: CreateArticleInput) =>
  api.post<BackofficeArticle>("/backoffice/content/articles", input);

/** PATCH /backoffice/content/articles/{id} */
export const updateArticle = (id: string, input: UpdateArticleInput) =>
  api.patch<BackofficeArticle>(`/backoffice/content/articles/${id}`, input);

/** DELETE /backoffice/content/articles/{id} */
export const removeArticle = (id: string) =>
  api.delete<void>(`/backoffice/content/articles/${id}`);

/** GET /backoffice/content/branches */
export const listBranches = () =>
  api.get<BackofficeBranch[]>("/backoffice/content/branches");

/** POST /backoffice/content/branches */
export const createBranch = (input: CreateBranchInput) =>
  api.post<BackofficeBranch>("/backoffice/content/branches", input);

/** PATCH /backoffice/content/branches/{id} */
export const updateBranch = (id: string, input: UpdateBranchInput) =>
  api.patch<BackofficeBranch>(`/backoffice/content/branches/${id}`, input);

/** DELETE /backoffice/content/branches/{id} */
export const removeBranch = (id: string) =>
  api.delete<void>(`/backoffice/content/branches/${id}`);

/** GET /backoffice/content/seo */
export const getSeo = (entityType: SeoEntityType, entityId: string) =>
  api.get<SeoMeta | null>("/backoffice/content/seo", {
    query: { entityType, entityId },
  });

/** POST /backoffice/content/seo */
export const upsertSeo = (input: UpsertSeoInput) =>
  api.post<SeoMeta>("/backoffice/content/seo", input);
