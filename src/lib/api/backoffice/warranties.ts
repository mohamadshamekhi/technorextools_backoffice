import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";
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

export type RepairRequest = {
  id: string;
  trackingCode: string;
  customerName: string | null;
  customerMobile: string;
  deviceTitle: string;
  problemDescription: string;
  status: RepairStatus;
  createdAt: string;
};

/** GET /backoffice/warranties?orderId= */
export const listWarranties = (orderId: string) =>
  api.get<OrderWarranty[]>("/backoffice/warranties", { query: { orderId } });

/** POST /backoffice/warranties */
export const issueWarranty = (input: IssueWarrantyInput) =>
  api.post<OrderWarranty>("/backoffice/warranties", input);

/** GET /backoffice/repairs */
export const listRepairs = (query: ListQuery = {}) =>
  api.get<Paginated<RepairRequest>>("/backoffice/repairs", { query });

/** PATCH /backoffice/repairs/{id}/status */
export const setRepairStatus = (id: string, status: RepairStatus) =>
  api.patch<RepairRequest>(`/backoffice/repairs/${id}/status`, { status });
