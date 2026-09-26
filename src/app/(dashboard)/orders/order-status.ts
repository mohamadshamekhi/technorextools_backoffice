import type { BadgeTone } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/api/backoffice/order-status";

/** نگاشت وضعیت سفارش به رنگ بج */
export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  pending_payment: "warning",
  payment_failed: "danger",
  abandoned: "neutral",
  paid: "info",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};
