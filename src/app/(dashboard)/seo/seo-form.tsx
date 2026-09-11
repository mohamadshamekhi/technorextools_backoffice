"use client";

import { useState, useTransition } from "react";
import {
  TextField,
  TextAreaField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { ImageUploader } from "@/components/ui/image-uploader";
import { upsertSeoAction } from "./actions";
import { clearFieldError, type ActionResult } from "@/lib/forms";
import type { SeoEntityType, SeoMeta } from "@/lib/api/backoffice/content";

export function SeoForm({
  entityType,
  entityId,
  initial,
}: {
  entityType: SeoEntityType;
  entityId: string;
  initial: SeoMeta | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.metaDescription ?? "",
  );
  const [ogImage, setOgImage] = useState(initial?.ogImage ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      setResult(
        await upsertSeoAction({
          entityType,
          entityId,
          metaTitle: metaTitle.trim() || null,
          metaDescription: metaDescription.trim() || null,
          ogImage: ogImage.trim() || null,
          canonicalUrl: canonicalUrl.trim() || null,
        }),
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="عنوان متا"
        name="metaTitle"
        value={metaTitle}
        onChange={setMetaTitle}
        errors={errors}
        onErrorClear={clearError}
      />
      <TextAreaField
        label="توضیح متا"
        name="metaDescription"
        rows={3}
        value={metaDescription}
        onChange={setMetaDescription}
        errors={errors}
        onErrorClear={clearError}
      />
      <div className="space-y-1">
        <span className="block text-sm font-medium">تصویر OG</span>
        <ImageUploader
          value={ogImage || null}
          onChange={(url) => {
            setOgImage(url ?? "");
            clearError("ogImage");
          }}
          purpose="OG_IMAGE"
          folder="seo"
        />
      </div>
      <TextField
        label="Canonical URL"
        name="canonicalUrl"
        dir="ltr"
        value={canonicalUrl}
        onChange={setCanonicalUrl}
        errors={errors}
        onErrorClear={clearError}
      />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>ذخیره سئو</SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
