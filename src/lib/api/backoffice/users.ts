import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";

/**
 * کاربران بک‌آفیس — docs/api/backoffice.md § Users.
 * Perm: خواندن `users.view`، تغییر `users.manage`.
 * شکل پاسخ‌ها بر اساس قرارداد رایج پروژه مدل شده؛ در صورت اختلاف با بک‌اند اصلاح شود.
 */

export type Role = {
  id: string;
  title: string;
  slug: string;
};

export type BackofficeUser = {
  id: string;
  fullName: string | null;
  mobile: string;
  email: string | null;
  role: Role | null;
  isActive: boolean;
  createdAt: string;
};

export type ListUsersQuery = ListQuery & {
  search?: string;
};

export type UpdateUserInput = {
  fullName?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
};

/** GET /backoffice/users */
export const list = (query: ListUsersQuery = {}) =>
  api.get<Paginated<BackofficeUser>>("/backoffice/users", { query });

/** GET /backoffice/users/{id} */
export const get = (userId: string) =>
  api.get<BackofficeUser>(`/backoffice/users/${userId}`);

/** PATCH /backoffice/users/{id} */
export const update = (userId: string, input: UpdateUserInput) =>
  api.patch<BackofficeUser>(`/backoffice/users/${userId}`, input);

/** GET /backoffice/access/roles — برای انتخابگر نقش */
export const listRoles = () =>
  api.get<Role[]>("/backoffice/access/roles");
