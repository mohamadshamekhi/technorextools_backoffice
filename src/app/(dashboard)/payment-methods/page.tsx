import type { Metadata } from "next";
import { Banknote, CreditCard, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { paymentsApi, guarded } from "@/lib/api";
import type { PaymentMethod } from "@/lib/api/backoffice/payments";
import { deletePaymentMethodAction } from "./actions";

export const metadata: Metadata = { title: "روش‌های پرداخت" };

/** آیکن هر ردیف بر اساس کد — دو مقدار seed‌شده آیکن اختصاصی دارند، بقیه آیکن عمومی کیف پول. */
function methodIcon(code: string) {
  if (code === "online") return CreditCard;
  if (code === "cash") return Banknote;
  return Wallet;
}

const columns: Column<PaymentMethod>[] = [
  {
    key: "title",
    header: "روش پرداخت",
    cell: (m) => {
      const Icon = methodIcon(m.code);
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-border/50 text-muted">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{m.title}</p>
            <p className="font-mono text-xs text-muted" dir="ltr">
              {m.code}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    key: "description",
    header: "توضیحات",
    cell: (m) => <span className="text-muted">{m.description ?? "—"}</span>,
  },
  {
    key: "sortOrder",
    header: "ترتیب نمایش",
    className: "text-end tabular-nums",
    cell: (m) => m.sortOrder,
  },
  {
    key: "isActive",
    header: "وضعیت",
    cell: (m) => (
      <span className="inline-flex items-center gap-1.5">
        <span
          className={`size-1.5 rounded-full ${m.isActive ? "bg-success" : "bg-muted"}`}
        />
        {m.isActive ? "فعال" : "غیرفعال"}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    className: "text-end",
    cell: (m) => (
      <RowActionsMenu
        viewHref={`/payment-methods/${m.id}`}
        editHref={`/payment-methods/${m.id}`}
        onDelete={deletePaymentMethodAction.bind(null, m.id)}
      />
    ),
  },
];

export default async function PaymentMethodsPage() {
  const methods = await guarded(paymentsApi.listMethods());

  return (
    <>
      <PageHeader
        title="روش‌های پرداخت"
        description="افزودن، ویرایش و حذف روش‌های پرداخت"
        actions={
          <>
            <LinkButton href="/payments" variant="ghost">
              بازگشت به تراکنش‌ها
            </LinkButton>
            <LinkButton href="/payment-methods/new">افزودن روش جدید</LinkButton>
          </>
        }
      />
      <DataTable
        columns={columns}
        rows={methods}
        getRowKey={(m) => m.id}
        emptyMessage="روش پرداختی ثبت نشده است."
      />
    </>
  );
}
