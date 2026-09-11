import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { paymentsApi, guardedResource } from "@/lib/api";
import { PaymentMethodForm } from "../payment-method-form";
import { deletePaymentMethodAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش روش پرداخت" };

export default async function PaymentMethodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const method = await guardedResource(paymentsApi.getMethod(id));
  const deleteAction = deletePaymentMethodAction.bind(null, id);

  return (
    <>
      <PageHeader
        title={method.title}
        actions={
          <LinkButton href="/payment-methods" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card className="mb-4">
        <PaymentMethodForm method={method} />
      </Card>
      <DeleteButton action={deleteAction} redirectTo="/payment-methods">
        حذف روش پرداخت
      </DeleteButton>
    </>
  );
}
