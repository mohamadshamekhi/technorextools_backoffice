import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { BrandForm } from "../brand-form";

export const metadata: Metadata = { title: "برند جدید" };

export default function NewBrandPage() {
  return (
    <>
      <PageHeader
        title="برند جدید"
        actions={
          <LinkButton href="/brands" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <BrandForm />
      </Card>
    </>
  );
}
