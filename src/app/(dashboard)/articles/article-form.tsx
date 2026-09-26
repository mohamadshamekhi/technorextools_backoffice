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
import { ImageUploader, uploadOwnedImage } from "@/components/ui/image-uploader";
import { createArticleAction, updateArticleAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import { SLUG_HINT, SLUG_INVALID_MESSAGE, SLUG_PATTERN, sanitizeSlugInput } from "@/lib/slug";
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
  // در حالت ساخت هنوز شناسه‌ای نیست؛ فایل نگه داشته می‌شود تا بعد از ساخت مقاله آپلود شود
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [body, setBody] = useState(article?.body ?? "");
  const [publishedAt, setPublishedAt] = useState(
    article?.publishedAt ? article.publishedAt.slice(0, 10) : "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان الزامی است.";
    if (!slug.trim()) errs.slug = "اسلاگ الزامی است.";
    else if (!SLUG_PATTERN.test(slug.trim())) errs.slug = SLUG_INVALID_MESSAGE;
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
      body,
      publishedAt: publishedAt || null,
    };
    startTransition(async () => {
      if (article) {
        setResult(await updateArticleAction(article.id, payload));
        return;
      }

      // مقاله باید اول ساخته شود تا کاور با ownerId آپلود شود
      let articleId = createdId;
      if (!articleId) {
        const res = await createArticleAction(payload);
        if (!res.ok) {
          setResult(res);
          return;
        }
        articleId = res.data?.id ?? null;
        setCreatedId(articleId);
      } else {
        const res = await updateArticleAction(articleId, payload);
        if (!res.ok) {
          setResult(res);
          return;
        }
      }
      if (!articleId) return;

      if (coverFile) {
        const up = await uploadOwnedImage(coverFile, {
          purpose: "COVER",
          folder: "articles",
          alt: title.trim() || "کاور مقاله",
          ownerType: "ARTICLE",
          ownerId: articleId,
        });
        if (!up.ok) {
          setResult({
            ok: false,
            message: `مقاله ثبت شد اما بارگذاری کاور ناموفق بود: ${up.message}`,
          });
          return;
        }
        setCoverFile(null);
        setCoverImage(up.url);
      }

      setResult({ ok: true });
      router.push(`/articles/${articleId}`);
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
        hint={SLUG_HINT}
        value={slug}
        onChange={(v) => setSlug(sanitizeSlugInput(v))}
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
          onFileSelect={setCoverFile}
          owner={
            article
              ? { type: "ARTICLE", id: article.id }
              : createdId
                ? { type: "ARTICLE", id: createdId }
                : null
          }
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
