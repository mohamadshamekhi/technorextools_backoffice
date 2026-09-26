import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";

/**
 * گزارش‌ها — docs/api/backoffice.md § Reports.
 * برای کارت‌های خلاصه‌ی داشبورد و صفحات گزارش استفاده می‌شود.
 */

export type SalesReport = {
  from: string;
  to: string;
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  /** سری زمانی روزانه برای نمودار */
  daily: { date: string; revenue: number; orders: number }[];
};

export type InventoryReport = {
  threshold: number;
  items: {
    variantId: string;
    productTitle: string;
    sku: string;
    stockQty: number;
  }[];
  total: number;
  skip: number;
  take: number;
};

export type AdminLog = {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
};

export type SalesReportQuery = {
  /** YYYY-MM-DD */
  from: string;
  /** YYYY-MM-DD */
  to: string;
};

/** GET /backoffice/reports/sales */
export const sales = (query: SalesReportQuery) =>
  api.get<SalesReport>("/backoffice/reports/sales", { query });

/** GET /backoffice/reports/inventory */
export const inventory = (threshold = 5) =>
  api.get<InventoryReport>("/backoffice/reports/inventory", {
    query: { threshold },
  });

/** GET /backoffice/reports/admin-logs */
export const adminLogs = (query: ListQuery = {}) =>
  api.get<Paginated<AdminLog>>("/backoffice/reports/admin-logs", { query });
