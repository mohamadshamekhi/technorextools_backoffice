import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";
import type { OrderPaymentMethod, OrderStatus } from "./order-status";

/**
 * سفارش‌های بک‌آفیس — docs/api/backoffice.md § Orders.
 * شناسه‌ی مسیرها `orderNumber` است (نه id).
 * تایپ و برچسب وضعیت‌ها در `./order-status` است (فایل خالص، قابل استفاده در کلاینت).
 */

export type { OrderStatus, OrderPaymentMethod } from "./order-status";
export {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_PAYMENT_METHODS,
  ORDER_PAYMENT_METHOD_LABELS,
} from "./order-status";

/** بک‌اند رابطه‌ی مشتری را روی سفارش برنمی‌گرداند — فقط `userId` خام. تنها اطلاعات تماسِ
 * موجود، گیرنده‌ی همان آدرسی است که سفارش با آن ثبت شده (`OrderDetail.address`). */
export type OrderAddress = {
  receiverName: string;
  receiverMobile: string;
  province: string;
  city: string;
  fullAddress: string;
  postalCode: string;
};

export type OrderListItem = {
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: OrderPaymentMethod;
  userId: string;
  total: number;
  itemCount: number;
  placedAt: string;
};

export type OrderLine = {
  id: string;
  productTitle: string;
  sku: string | null;
  qty: number;
  unitPrice: number;
};

export type OrderDetail = OrderListItem & {
  items: OrderLine[];
  subtotal: number;
  discountAmount: number;
  discountCode: string | null;
  shippingCost: number;
  shippingMethodTitle: string | null;
  /** `null` برای سفارش‌های قدیمی‌ای که آدرس‌شان حذف شده */
  address: OrderAddress | null;
  statusHistory: { status: OrderStatus; note: string | null; at: string }[];
  /** شرکت حمل و کد رهگیری — فقط پس از ثبت وضعیت «ارسال‌شده» پر می‌شوند */
  carrier?: string | null;
  trackingNumber?: string | null;
  payments: {
    gateway: string;
    status: string;
    amount: number;
    refId: string | null;
    paidAt: string | null;
  }[];
};

export type SetOrderStatusInput = {
  status: OrderStatus;
  note?: string;
  /** فقط هنگام `shipped` معنا دارد — نام شرکت حمل (مثلاً تیپاکس) */
  carrier?: string;
  /** فقط هنگام `shipped` — کد رهگیری مرسوله؛ در پیگیری عمومی سفارش نمایش داده می‌شود */
  trackingNumber?: string;
};

/** GET /backoffice/orders */
export const list = (query: ListQuery = {}) =>
  api.get<Paginated<OrderListItem>>("/backoffice/orders", { query });

/** GET /backoffice/orders/{orderNumber} */
export const get = (orderNumber: string) =>
  api.get<OrderDetail>(`/backoffice/orders/${orderNumber}`);

/** PATCH /backoffice/orders/{orderNumber}/status */
export const setStatus = (orderNumber: string, input: SetOrderStatusInput) =>
  api.patch<OrderDetail>(`/backoffice/orders/${orderNumber}/status`, input);

/**
 * PATCH /backoffice/orders/{orderNumber}/confirm-cash-payment — بدون body.
 * فقط وقتی معتبر است که `paymentMethod: cash` و `status: pending_payment` باشد؛
 * در غیر این صورت بک‌اند ۴۰۰ برمی‌گرداند (پیام دقیق در `ApiError.displayMessage`).
 */
export const confirmCashPayment = (orderNumber: string) =>
  api.patch<OrderDetail>(`/backoffice/orders/${orderNumber}/confirm-cash-payment`);
