"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  TextAreaField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { RichTextField } from "@/components/ui/rich-text-editor";
import { ImageUploader } from "@/components/ui/image-uploader";
import { createArticleAction, updateArticleAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import type { BackofficeArticle } from "@/lib/api/backoffice/content";

export function ArticleForm({ article }: { article?: BackofficeArticle }) {
  const router = useRouter();
  const isEdit = Boolean(article);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [publishedAt, setPublishedAt] = useState(
    article?.publishedAt ? article.publishedAt.slice(0, 10) : "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان الزامی است.";
    if (!slug.trim()) errs.slug = "اسلاگ الزامی است.";
    if (!body.trim()) errs.body = "متن مقاله الزامی است.";
    if (Object.keys(errs).length > 0) {
      setResult(invalid(errs));
      return;
    }
    setResult(null);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      coverImage: coverImage || null,
      body,
      publishedAt: publishedAt || null,
    };
    startTransition(async () => {
      const res = article
        ? await updateArticleAction(article.id, payload)
        : await createArticleAction(payload);
      setResult(res);
      if (res.ok && !isEdit && "data" in res && res.data) {
        router.push(`/articles/${res.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="عنوان"
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
        value={slug}
        onChange={setSlug}
        errors={errors}
        onErrorClear={clearError}
      />
      <TextAreaField
        label="خلاصه"
        name="excerpt"
        rows={2}
        value={excerpt}
        onChange={setExcerpt}
        errors={errors}
        onErrorClear={clearError}
      />
      <div className="space-y-1">
        <span className="block text-sm font-medium">تصویر کاور</span>
        <ImageUploader
          value={coverImage || null}
          onChange={(url) => {
            setCoverImage(url ?? "");
            clearError("coverImage");
          }}
          purpose="COVER"
          folder="articles"
          alt={title || "کاور مقاله"}
        />
      </div>
      <RichTextField
        label="متن مقاله"
        name="body"
        value={body}
        onChange={setBody}
        errors={errors}
        onErrorClear={clearError}
      />
      <TextField
        label="تاریخ انتشار (YYYY-MM-DD)"
        name="publishedAt"
        type="date"
        dir="ltr"
        hint="خالی = پیش‌نویس"
        value={publishedAt}
        onChange={setPublishedAt}
        errors={errors}
        onErrorClear={clearError}
      />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>
          {isEdit ? "ذخیره تغییرات" : "ساخت مقاله"}
        </SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
