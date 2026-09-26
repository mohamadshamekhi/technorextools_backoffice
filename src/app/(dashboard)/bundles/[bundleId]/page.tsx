import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { bundlesApi, inventoryApi, mediaApi, ApiError } from "@/lib/api";
import { BundleForm } from "../bundle-form";
import { BundleGallery } from "../bundle-gallery";
import { deleteBundleAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش پکیج" };

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<{ bundleId: string }>;
}) {
  const { bundleId } = await params;

  let bundle;
  try {
    bundle = await bundlesApi.get(bundleId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  // سقف واقعی take در listInventoryVariantsQuerySchema بک‌اند ۱۰۰ است؛ عدد بزرگ‌تر ۴۰۰ می‌دهد.
  const [{ items: variants }, images] = await Promise.all([
    inventoryApi.list({ take: 100 }),
    mediaApi.listByOwner("BUNDLE", bundleId).catch(() => []),
  ]);
  const deleteAction = deleteBundleAction.bind(null, bundleId);

  return (
    <>
      <PageHeader
        title={bundle.title}
        description={bundle.slug}
        actions={
          <LinkButton href="/bundles" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card className="mb-4">
        <BundleForm bundle={bundle} variants={variants} />
      </Card>
      <Card className="mb-4">
        <h2 className="mb-3 text-sm font-medium">تصاویر پکیج</h2>
        <BundleGallery bundleId={bundleId} initial={images} />
      </Card>
      <DeleteButton action={deleteAction} redirectTo="/bundles">
        حذف پکیج
      </DeleteButton>
    </>
  );
}
