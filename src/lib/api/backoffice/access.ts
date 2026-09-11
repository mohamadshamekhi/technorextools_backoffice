import { api } from "../http";

/** نقش‌ها و دسترسی‌ها (RBAC) — docs/api/backoffice.md § Access. Perm: `roles.manage`. */

export type PermissionItem = {
  code: string;
  title: string;
};

export type PermissionGroup = {
  group: string;
  title: string;
  permissions: PermissionItem[];
};

export type BackofficeRole = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
};

export type CreateRoleInput = {
  title: string;
  slug: string;
  description?: string | null;
  permissions: string[];
};

export type UpdateRoleInput = Partial<CreateRoleInput>;

/** GET /backoffice/access/permissions */
export const listPermissions = () =>
  api.get<PermissionGroup[]>("/backoffice/access/permissions");

/** GET /backoffice/access/roles */
export const listRoles = () =>
  api.get<BackofficeRole[]>("/backoffice/access/roles");

/** GET /backoffice/access/roles/{id} */
export const getRole = (id: string) =>
  api.get<BackofficeRole>(`/backoffice/access/roles/${id}`);

/** POST /backoffice/access/roles */
export const createRole = (input: CreateRoleInput) =>
  api.post<BackofficeRole>("/backoffice/access/roles", input);

/** PATCH /backoffice/access/roles/{id} */
export const updateRole = (id: string, input: UpdateRoleInput) =>
  api.patch<BackofficeRole>(`/backoffice/access/roles/${id}`, input);

/** DELETE /backoffice/access/roles/{id} */
export const removeRole = (id: string) =>
  api.delete<void>(`/backoffice/access/roles/${id}`);
