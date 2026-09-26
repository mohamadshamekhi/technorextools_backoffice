import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";

/** باشگاه مشتریان — docs/api/backoffice.md § Loyalty. Perm: `loyalty.manage`. */

export type LoyaltyTransaction = {
  id: string;
  points: number;
  reason: string;
  note: string | null;
  createdAt: string;
};

export type LoyaltySummary = {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: Paginated<LoyaltyTransaction>;
};

export type AdjustPointsInput = {
  points: number;
  /** الزامی — دلیل تعدیل، ۲ تا ۲۰۰ کاراکتر */
  note: string;
};

/** GET /backoffice/loyalty/{userId} */
export const get = (userId: string, query: ListQuery = {}) =>
  api.get<LoyaltySummary>(`/backoffice/loyalty/${userId}`, { query });

/** POST /backoffice/loyalty/{userId}/adjust */
export const adjust = (userId: string, input: AdjustPointsInput) =>
  api.post<LoyaltySummary>(`/backoffice/loyalty/${userId}/adjust`, input);
