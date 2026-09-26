"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  CheckboxField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { ImageUploader, uploadOwnedImage } from "@/components/ui/image-uploader";
import { createBrandAction, updateBrandAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import { SLUG_HINT, SLUG_INVALID_MESSAGE, SLUG_PATTERN, sanitizeSlugInput } from "@/lib/slug";
import type { BackofficeBrand } from "@/lib/api/backoffice/brands";

export function BrandForm({ brand }: { brand?: BackofficeBrand }) {
  const router = useRouter();
  const isEdit = Boolean(brand);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [title, setTitle] = useState(brand?.title ?? "");
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl ?? "");
  // در حالت ساخت هنوز شناسه‌ای نیست؛ فایل نگه داشته می‌شود تا بعد از ساخت برند آپلود شود
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [isExclusive, setIsExclusive] = useState(
    brand?.isExclusiveDistributor ?? false,
  );
  const [note, setNote] = useState(brand?.authenticityNote ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان برند الزامی است.";
    if (!slug.trim()) errs.slug = "اسلاگ الزامی است.";
    else if (!SLUG_PATTERN.test(slug.trim())) errs.slug = SLUG_INVALID_MESSAGE;
    if (Object.keys(errs).length > 0) {
      setResult(invalid(errs));
      return;
    }
    setResult(null);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      isExclusiveDistributor: isExclusive,
      authenticityNote: note.trim() || null,
    };
    startTransition(async () => {
      if (brand) {
        setResult(await updateBrandAction(brand.id, payload));
        return;
      }

      // برند باید اول ساخته شود تا لوگو با ownerId آپلود شود
      const existingId = createdId;
      let brandId = existingId;
      if (!brandId) {
        const res = await createBrandAction(payload);
        if (!res.ok) {
          setResult(res);
          return;
        }
        brandId = res.data?.id ?? null;
        setCreatedId(brandId);
      } else {
        const res = await updateBrandAction(brandId, payload);
        if (!res.ok) {
          setResult(res);
          return;
        }
      }
      if (!brandId) return;

      if (logoFile) {
        const up = await uploadOwnedImage(logoFile, {
          purpose: "LOGO",
          folder: "brands",
          alt: title.trim() || "لوگوی برند",
          ownerType: "BRAND",
          ownerId: brandId,
        });
        if (!up.ok) {
          setResult({
            ok: false,
            message: `برند ثبت شد اما بارگذاری لوگو ناموفق بود: ${up.message}`,
          });
          return;
        }
        setLogoFile(null);
        setLogoUrl(up.url);
      }

      setResult({ ok: true });
      router.push(`/brands/${brandId}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="عنوان برند"
          name="title"
          value={title}
          onChange={setTitle}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="اسلاگ"
          name="slug"
          dir="ltr"
          hint={SLUG_HINT}
          value={slug}
          onChange={(v) => setSlug(sanitizeSlugInput(v))}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>
      <div className="space-y-1">
        <span className="block text-sm font-medium">لوگو</span>
        <ImageUploader
          value={logoUrl || null}
          onChange={(url) => {
            setLogoUrl(url ?? "");
            clearError("logoUrl");
          }}
          onFileSelect={setLogoFile}
          owner={
            brand
              ? { type: "BRAND", id: brand.id }
              : createdId
                ? { type: "BRAND", id: createdId }
                : null
          }
          purpose="LOGO"
          folder="brands"
          alt={title || "لوگوی برند"}
        />
      </div>
      <CheckboxField
        id="isExclusive"
        label="نماینده انحصاری"
        checked={isExclusive}
        onChange={setIsExclusive}
      />
      <TextField
        label="یادداشت اصالت"
        name="authenticityNote"
        value={note}
        onChange={setNote}
        errors={errors}
        onErrorClear={clearError}
      />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>
          {isEdit ? "ذخیره تغییرات" : "ساخت برند"}
        </SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
