import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ProductForm } from "../product-form";
import { loadProductRefs } from "../product-refs";

export const metadata: Metadata = { title: "محصول جدید" };

export default async function NewProductPage() {
  const { brands, categories } = await loadProductRefs();

  return (
    <>
      <PageHeader
        title="محصول جدید"
        actions={
          <LinkButton href="/products" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <ProductForm brands={brands} categories={categories} />
      </Card>
      <p className="mt-3 text-sm text-muted">
        بعد از ساخت محصول، افزودن تصویر، واریانت و مشخصات فنی از همین صفحه‌ی محصول ممکن است.
      </p>
    </>
  );
}
