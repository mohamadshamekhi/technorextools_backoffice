"use client";

import {
  uploadSparePartImageAction,
  deleteSparePartImageAction,
  setSparePartMainImageAction,
} from "./actions";
import { MediaGallery } from "@/components/ui/media-gallery";
import type { MediaView } from "@/lib/api/backoffice/media";

/** گالری تصاویر قطعه‌ی یدکی — آپلود با `ownerType=SPARE_PART` و `purpose=GALLERY`. */
export function SparePartGallery({
  sparePartId,
  initial,
}: {
  sparePartId: string;
  initial: MediaView[];
}) {
  return (
    <MediaGallery
      ownerType="SPARE_PART"
      ownerId={sparePartId}
      initial={initial}
      emptyMessage="هنوز تصویری برای این قطعه بارگذاری نشده است؛ بدون تصویر، قطعه در فروشگاه بدون عکس نمایش داده می‌شود."
      imageAlt="تصویر قطعه یدکی"
      onUpload={(file, sortOrder) => {
        const form = new FormData();
        form.set("file", file);
        form.set("sortOrder", String(sortOrder));
        return uploadSparePartImageAction(sparePartId, form);
      }}
      onDelete={(mediaId) => deleteSparePartImageAction(sparePartId, mediaId)}
      onSetMain={(mediaId) => setSparePartMainImageAction(sparePartId, mediaId)}
    />
  );
}
