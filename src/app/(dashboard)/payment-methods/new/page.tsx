import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PaymentMethodForm } from "../payment-method-form";

export const metadata: Metadata = { title: "روش پرداخت جدید" };

export default function NewPaymentMethodPage() {
  return (
    <>
      <PageHeader
        title="روش پرداخت جدید"
        actions={
          <LinkButton href="/payment-methods" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <PaymentMethodForm />
      </Card>
    </>
  );
}
