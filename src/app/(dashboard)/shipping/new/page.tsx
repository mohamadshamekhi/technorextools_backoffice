import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ShippingForm } from "../shipping-form";

export const metadata: Metadata = { title: "روش ارسال جدید" };

export default function NewShippingPage() {
  return (
    <>
      <PageHeader
        title="روش ارسال جدید"
        actions={
          <LinkButton href="/shipping" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <ShippingForm />
      </Card>
    </>
  );
}
