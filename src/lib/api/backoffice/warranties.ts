import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";
import type { RepairRequest, UpdateRepairInput } from "./repair";
import type { RepairStatus } from "./moderation";

/** گارانتی و تعمیرات — docs/api/backoffice.md § Warranties / Repairs. Perm: `warranties.manage` / `repairs.manage`. */

export type OrderWarranty = {
  id: string;
  orderId: string;
  orderItemId: string;
  serialNumber: string;
  productTitle: string | null;
  startsAt: string;
  endsAt: string;
  createdAt: string;
};

export type IssueWarrantyInput = {
  orderId: string;
  orderItemId: string;
  serialNumber: string;
  startsAt: string;
  endsAt: string;
};

export type {
  RepairAttachment,
  RepairRequest,
  UpdateRepairInput,
} from "./repair";

/** GET /backoffice/warranties?orderId= */
export const listWarranties = (orderId: string) =>
  api.get<OrderWarranty[]>("/backoffice/warranties", { query: { orderId } });

/** POST /backoffice/warranties */
export const issueWarranty = (input: IssueWarrantyInput) =>
  api.post<OrderWarranty>("/backoffice/warranties", input);

/** GET /backoffice/repairs?status= */
export const listRepairs = (query: ListQuery & { status?: RepairStatus } = {}) =>
  api.get<Paginated<RepairRequest>>("/backoffice/repairs", { query });

/** PATCH /backoffice/repairs/{id} — ثبت یافته‌های تکنسین */
export const updateRepair = (id: string, input: UpdateRepairInput) =>
  api.patch<RepairRequest>(`/backoffice/repairs/${id}`, input);

/** PATCH /backoffice/repairs/{id}/status — `note` اختیاری در تاریخچه‌ی وضعیت ثبت می‌شود */
export const setRepairStatus = (id: string, status: RepairStatus, note?: string) =>
  api.patch<RepairRequest>(`/backoffice/repairs/${id}/status`, note ? { status, note } : { status });
