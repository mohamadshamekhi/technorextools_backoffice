import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { loadProductRefs } from "../product-refs";
import { BulkPriceUpdateForm } from "./bulk-price-update-form";

export const metadata: Metadata = { title: "تغییر قیمت گروهی" };

export default async function BulkPriceUpdatePage() {
  const { brands, categories } = await loadProductRefs();

  return (
    <>
      <PageHeader
        title="تغییر قیمت گروهی"
        description="قیمت پایه‌ی محصولات و قیمت واریانت‌های دارای override را برای یک برند، یک دسته‌بندی یا مجموعه‌ای از محصولات یک‌جا تغییر دهید."
        actions={
          <LinkButton href="/products" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <BulkPriceUpdateForm brands={brands} categories={categories} />
      </Card>
    </>
  );
}
