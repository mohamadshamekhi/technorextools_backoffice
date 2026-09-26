import Link from "next/link";
import {
  Users,
  Package,
  ShoppingCart,
  Wallet,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { usersApi, productsApi, ordersApi, reportsApi } from "@/lib/api";
import { ORDER_PAYMENT_METHOD_LABELS } from "@/lib/api/backoffice/orders";
import { formatNumber, formatToman, formatDate } from "@/lib/format";
import { DashboardStatCard } from "./dashboard-stat-card";
import { DashboardSparkline } from "./dashboard-sparkline";

/** بازه‌ی گزارش فروش: ۳۰ روز اخیر (YYYY-MM-DD) */
function salesRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

export default async function DashboardPage() {
  const range = salesRange();

  // هر بخش مستقل fail می‌شود تا یک خطا کل داشبورد را از کار نیندازد
  const [users, products, orders, sales, inventory] = await Promise.allSettled([
    usersApi.list({ take: 1 }),
    productsApi.list({ take: 1 }),
    ordersApi.list({ take: 6 }),
    reportsApi.sales(range),
    reportsApi.inventory(5),
  ]);

  const salesData = sales.status === "fulfilled" ? sales.value : null;

  const stats = [
    { title: "کاربران", value: count(users), icon: Users },
    { title: "محصولات", value: count(products), icon: Package },
    { title: "سفارش‌ها", value: count(orders), icon: ShoppingCart },
    {
      title: "درآمد ۳۰ روز اخیر",
      value: salesData ? formatToman(salesData.totalRevenue) : "—",
      icon: Wallet,
      hint: salesData
        ? `میانگین هر سفارش: ${formatToman(salesData.averageOrderValue)}`
        : undefined,
    },
  ];

  const recentOrders = orders.status === "fulfilled" ? orders.value.items : [];
  const lowStock = inventory.status === "fulfilled" ? inventory.value.items : [];

  return (
    <>
      <PageHeader title="داشبورد" description="نمای کلی از وضعیت فروشگاه" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <DashboardStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="روند درآمد"
          className="lg:col-span-2"
          action={
            salesData ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                <TrendingUp className="size-4 text-primary" />
                <span className="tabular-nums">
                  {formatNumber(salesData.orderCount)} سفارش
                </span>
              </span>
            ) : null
          }
        >
          {salesData?.daily ? (
            <DashboardSparkline
              points={salesData.daily.map((d) => ({
                date: d.date,
                revenue: d.revenue,
              }))}
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted">
              گزارش فروش در دسترس نیست.
            </p>
          )}
        </Card>

        <Card
          title="کسری موجودی"
          action={
            lowStock.length > 0 ? (
              <Badge tone="warning">{formatNumber(lowStock.length)}</Badge>
            ) : null
          }
        >
          {lowStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              موجودی همه‌ی کالاها مناسب است.
            </p>
          ) : (
            <ul className="space-y-3">
              {lowStock.slice(0, 5).map((v) => (
                <li
                  key={v.variantId}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0 text-warning" />
                    <span className="truncate">{v.productTitle}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {formatNumber(v.stockQty)} عدد
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card
          title="آخرین سفارش‌ها"
          action={
            <Link
              href="/orders"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              همه سفارش‌ها
              <ArrowLeft className="size-4" />
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <EmptyState
              title="سفارشی برای نمایش نیست"
              description="به‌محض ثبت سفارش، اینجا نمایش داده می‌شود."
            />
          ) : (
            <ul className="divide-y">
              {recentOrders.map((order) => (
                <li
                  key={order.orderNumber}
                  className="grid grid-cols-2 items-center gap-3 py-3 text-sm sm:grid-cols-4"
                >
                  <span dir="ltr" className="text-end font-medium">
                    {order.orderNumber}
                  </span>
                  <span className="truncate text-muted">
                    {ORDER_PAYMENT_METHOD_LABELS[order.paymentMethod]}
                  </span>
                  <span className="tabular-nums">{formatToman(order.total)}</span>
                  <span className="text-start text-muted sm:text-end">
                    {formatDate(order.placedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function count(settled: PromiseSettledResult<{ total: number }>): string {
  return settled.status === "fulfilled"
    ? formatNumber(settled.value.total)
    : "—";
}
