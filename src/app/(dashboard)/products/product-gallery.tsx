"use client";

import {
  uploadProductImageAction,
  deleteProductImageAction,
  setMainImageAction,
} from "./actions";
import { MediaGallery } from "@/components/ui/media-gallery";
import type { MediaView } from "@/lib/api/backoffice/media";

/** گالری تصاویر محصول — روی `ownerType=PRODUCT` و `purpose=GALLERY` آپلود می‌کند. */
export function ProductGallery({
  productId,
  initial,
}: {
  productId: string;
  initial: MediaView[];
}) {
  return (
    <MediaGallery
      ownerType="PRODUCT"
      ownerId={productId}
      initial={initial}
      emptyMessage="هنوز تصویری برای این محصول بارگذاری نشده است."
      imageAlt="تصویر محصول"
      onUpload={(file, sortOrder) => {
        const form = new FormData();
        form.set("file", file);
        form.set("sortOrder", String(sortOrder));
        return uploadProductImageAction(productId, form);
      }}
      onDelete={(mediaId) => deleteProductImageAction(productId, mediaId)}
      onSetMain={(mediaId) => setMainImageAction(productId, mediaId)}
    />
  );
}
