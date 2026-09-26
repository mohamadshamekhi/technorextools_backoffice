import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { sparePartsApi, productsApi, mediaApi, guardedResource } from "@/lib/api";
import { SparePartForm } from "../spare-part-form";
import { SparePartGallery } from "../spare-part-gallery";
import { deleteSparePartAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش قطعه" };

export default async function SparePartDetailPage({
  params,
}: {
  params: Promise<{ sparePartId: string }>;
}) {
  const { sparePartId } = await params;

  const [part, products, images] = await Promise.all([
    guardedResource(sparePartsApi.get(sparePartId)),
    productsApi
      .list({ take: 100 })
      .then((r) => r.items.map((p) => ({ id: p.id, title: p.title })))
      .catch(() => []),
    mediaApi.listByOwner("SPARE_PART", sparePartId).catch(() => []),
  ]);

  return (
    <>
      <PageHeader
        title={part.title}
        description={part.slug}
        actions={
          <LinkButton href="/spare-parts" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card className="mb-4">
        <SparePartForm part={part} products={products} />
      </Card>
      <Card className="mb-4">
        <h2 className="mb-3 text-sm font-medium">تصاویر قطعه</h2>
        <SparePartGallery sparePartId={sparePartId} initial={images} />
      </Card>
      <DeleteButton action={deleteSparePartAction.bind(null, sparePartId)} redirectTo="/spare-parts">
        حذف قطعه
      </DeleteButton>
    </>
  );
}
