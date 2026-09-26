import { api } from "../http";

/**
 * رسانه — docs/api/backoffice.md § Media. Perm: `media.manage`.
 * آپلود چندبخشی (`multipart/form-data`) روی `POST /backoffice/media/upload`.
 * تصاویر JPEG/PNG سمت سرور به WebP تبدیل می‌شوند.
 */

export type MediaPurpose =
  | "GALLERY"
  | "COVER"
  | "LOGO"
  | "DATASHEET"
  | "MODEL_3D"
  | "EXPLODED_VIEW"
  | "ATTACHMENT"
  | "OG_IMAGE";

export type MediaOwnerType =
  | "PRODUCT"
  | "PRODUCT_VARIANT"
  | "BUNDLE"
  | "BRAND"
  | "ARTICLE"
  | "CATEGORY"
  | "TICKET_MESSAGE"
  | "REPAIR_REQUEST"
  | "SPARE_PART";

export type MediaView = {
  id: string;
  url: string;
  key: string;
  contentType: string;
  size: number;
  originalName: string | null;
  kind: "IMAGE" | "MODEL" | "DOCUMENT" | "OTHER";
  ownerType: MediaOwnerType | null;
  ownerId: string | null;
  purpose: MediaPurpose;
  alt: string | null;
  isMain: boolean;
  sortOrder: number;
  createdAt: string;
};

export type UploadFields = {
  purpose?: MediaPurpose;
  folder?: string;
  alt?: string;
  ownerType?: MediaOwnerType;
  ownerId?: string;
  isMain?: boolean;
  sortOrder?: number;
};

/** POST /backoffice/media/upload — `file` (raw) + فیلدهای اختیاری. */
export function upload(file: File, fields: UploadFields = {}): Promise<MediaView> {
  const form = new FormData();
  form.set("file", file);
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== "") {
      form.set(key, String(value));
    }
  }
  return api.post<MediaView>("/backoffice/media/upload", form);
}

/** GET /backoffice/media?ownerType=&ownerId= */
export const listByOwner = (ownerType: MediaOwnerType, ownerId: string) =>
  api.get<MediaView[]>("/backoffice/media", { query: { ownerType, ownerId } });

export type UpdateMediaInput = Partial<
  Pick<MediaView, "alt" | "isMain" | "sortOrder" | "purpose">
>;

/** PATCH /backoffice/media/{id} */
export const update = (id: string, input: UpdateMediaInput) =>
  api.patch<MediaView>(`/backoffice/media/${id}`, input);

/** DELETE /backoffice/media/{id} */
export const remove = (id: string) =>
  api.delete<void>(`/backoffice/media/${id}`);
