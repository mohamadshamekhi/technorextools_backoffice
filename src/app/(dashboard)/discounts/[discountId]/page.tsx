import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { discountsApi, ApiError } from "@/lib/api";
import type { DiscountUsage } from "@/lib/api/backoffice/discounts";
import { formatDateTime, formatToman } from "@/lib/format";
import { DiscountForm } from "../discount-form";
import { deleteDiscountAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش کد تخفیف" };

const usageColumns: Column<DiscountUsage>[] = [
  { key: "user", header: "کاربر", cell: (u) => u.userName ?? u.userId },
  {
    key: "order",
    header: "سفارش",
    cell: (u) => <span dir="ltr">{u.orderNumber}</span>,
  },
  {
    key: "amount",
    header: "مبلغ تخفیف",
    className: "tabular-nums",
    cell: (u) => formatToman(u.amount),
  },
  { key: "usedAt", header: "زمان", cell: (u) => formatDateTime(u.usedAt) },
];

export default async function DiscountDetailPage({
  params,
}: {
  params: Promise<{ discountId: string }>;
}) {
  const { discountId } = await params;

  let discount;
  try {
    discount = await discountsApi.get(discountId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const usages = await discountsApi.usages(discountId).catch(() => []);
  const deleteAction = deleteDiscountAction.bind(null, discountId);

  return (
    <>
      <PageHeader
        title={discount.code}
        actions={
          <LinkButton href="/discounts" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card className="mb-4">
        <DiscountForm discount={discount} />
      </Card>

      <Card title="سابقه استفاده" className="mb-4">
        <DataTable
          columns={usageColumns}
          rows={usages}
          getRowKey={(u) => u.id}
          emptyMessage="این کد هنوز استفاده نشده است."
        />
      </Card>

      <DeleteButton action={deleteAction} redirectTo="/discounts">
        حذف کد تخفیف
      </DeleteButton>
    </>
  );
}
