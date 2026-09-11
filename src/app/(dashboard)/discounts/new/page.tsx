import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DiscountForm } from "../discount-form";

export const metadata: Metadata = { title: "کد تخفیف جدید" };

export default function NewDiscountPage() {
  return (
    <>
      <PageHeader
        title="کد تخفیف جدید"
        actions={
          <LinkButton href="/discounts" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <DiscountForm />
      </Card>
    </>
  );
}
