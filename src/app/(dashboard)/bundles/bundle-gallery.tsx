"use client";

import { MediaGallery } from "@/components/ui/media-gallery";
import {
  uploadBundleImageAction,
  deleteBundleImageAction,
  setBundleMainImageAction,
} from "./actions";
import type { MediaView } from "@/lib/api/backoffice/media";

/** تصاویر پکیج — آپلود با `ownerType=BUNDLE` و `purpose=GALLERY`؛ تصویر اصلی همان کاور پکیج است. */
export function BundleGallery({
  bundleId,
  initial,
}: {
  bundleId: string;
  initial: MediaView[];
}) {
  return (
    <MediaGallery
      ownerType="BUNDLE"
      ownerId={bundleId}
      initial={initial}
      emptyMessage="هنوز تصویری برای این پکیج بارگذاری نشده است؛ اولین تصویر به‌عنوان کاور پکیج استفاده می‌شود."
      imageAlt="تصویر پکیج"
      onUpload={(file, sortOrder) => {
        const form = new FormData();
        form.set("file", file);
        form.set("sortOrder", String(sortOrder));
        return uploadBundleImageAction(bundleId, form);
      }}
      onDelete={(mediaId) => deleteBundleImageAction(bundleId, mediaId)}
      onSetMain={(mediaId) => setBundleMainImageAction(bundleId, mediaId)}
    />
  );
}
