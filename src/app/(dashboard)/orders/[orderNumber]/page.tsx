import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ordersApi, guardedResource } from "@/lib/api";
import {
  ORDER_PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
  type OrderLine,
} from "@/lib/api/backoffice/orders";
import { ORDER_STATUS_TONE } from "../order-status";
import { OrderStatusForm } from "./order-status-form";
import { ConfirmCashPaymentButton } from "./confirm-cash-payment-button";
import { formatToman, formatDateTime, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "جزئیات سفارش" };

const lineColumns: Column<OrderLine>[] = [
  { key: "title", header: "کالا", cell: (l) => l.productTitle },
  {
    key: "qty",
    header: "تعداد",
    className: "text-end tabular-nums",
    cell: (l) => formatNumber(l.qty),
  },
  {
    key: "unit",
    header: "قیمت واحد",
    className: "text-end tabular-nums",
    cell: (l) => formatToman(l.unitPrice),
  },
  {
    key: "total",
    header: "جمع",
    className: "text-end tabular-nums",
    cell: (l) => formatToman(l.qty * l.unitPrice),
  },
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await guardedResource(ordersApi.get(orderNumber));

  return (
    <>
      <PageHeader
        title={`سفارش ${orderNumber}`}
        description={formatDateTime(order.placedAt)}
        actions={
          <Link
            href="/orders"
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <ArrowRight className="size-4" />
            بازگشت به لیست
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="اقلام سفارش">
            <DataTable
              columns={lineColumns}
              rows={order.items}
              getRowKey={(l) => l.id}
              emptyMessage="قلمی برای این سفارش ثبت نشده است."
            />
            <dl className="mt-4 space-y-2 text-sm">
              <SummaryRow label="جمع کالاها" value={formatToman(order.subtotal)} />
              <SummaryRow label="تخفیف" value={formatToman(order.discountAmount)} />
              <SummaryRow label="هزینه ارسال" value={formatToman(order.shippingCost)} />
              <SummaryRow label="مبلغ نهایی" value={formatToman(order.total)} strong />
            </dl>
          </Card>
        </div>

        <div className="space-y-4">
          {/* بک‌اند رابطه‌ی مشتری را روی سفارش برنمی‌گرداند — فقط گیرنده‌ی آدرس ثبت‌شده در دسترس است. */}
          <Card title="گیرنده">
            <dl className="space-y-2 text-sm">
              <SummaryRow label="نام" value={order.address?.receiverName ?? "—"} />
              <SummaryRow label="موبایل" value={order.address?.receiverMobile ?? "—"} ltr />
            </dl>
            {order.address && (
              <p className="mt-3 text-sm text-muted">
                {order.address.province}، {order.address.city}، {order.address.fullAddress}
              </p>
            )}
          </Card>

          <Card title="وضعیت">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone={ORDER_STATUS_TONE[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <Badge tone="neutral">{ORDER_PAYMENT_METHOD_LABELS[order.paymentMethod]}</Badge>
            </div>

            {order.paymentMethod === "cash" && order.status === "pending_payment" && (
              <div className="mb-4">
                <ConfirmCashPaymentButton orderNumber={orderNumber} />
              </div>
            )}

            <OrderStatusForm
              orderNumber={orderNumber}
              currentStatus={order.status}
              currentCarrier={order.carrier ?? ""}
              currentTrackingNumber={order.trackingNumber ?? ""}
            />
          </Card>
        </div>
      </div>
    </>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  ltr,
}: {
  label: string;
  value: string;
  strong?: boolean;
  ltr?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${strong ? "border-t pt-2 font-semibold" : ""}`}
    >
      <dt className="text-muted">{label}</dt>
      <dd className="text-end tabular-nums" dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}
