import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { brandsApi, ApiError } from "@/lib/api";
import { BrandForm } from "../brand-form";
import { deleteBrandAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش برند" };

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;

  let brand;
  try {
    brand = await brandsApi.get(brandId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const deleteAction = deleteBrandAction.bind(null, brandId);

  return (
    <>
      <PageHeader
        title={brand.title}
        description={brand.slug}
        actions={
          <LinkButton href="/brands" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card className="mb-4">
        <BrandForm brand={brand} />
      </Card>
      <DeleteButton action={deleteAction} redirectTo="/brands">
        حذف برند
      </DeleteButton>
    </>
  );
}
