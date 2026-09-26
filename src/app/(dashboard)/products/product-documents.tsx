"use client";

import { useRef, useState, useTransition } from "react";
import { FileText, Loader2, Plus, X } from "lucide-react";
import {
  Field,
  TextInput,
  SelectInput,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import {
  addProductDocumentAction,
  updateProductDocumentAction,
  deleteProductDocumentAction,
} from "./actions";
import type { ActionResult } from "@/lib/forms";
import type { ProductDocument } from "@/lib/api/backoffice/products";
import {
  PRODUCT_DOCUMENT_TYPES,
  PRODUCT_DOCUMENT_TYPE_LABELS,
  PRODUCT_DOCUMENT_LOCALES,
  PRODUCT_DOCUMENT_LOCALE_LABELS,
  type ProductDocumentType,
} from "@/lib/api/backoffice/product-documents";
import { formatNumber } from "@/lib/format";

/** حجم سند را از kB به متن خوانا تبدیل می‌کند */
function formatSizeKb(sizeKb: number | null): string {
  if (sizeKb === null || !Number.isFinite(sizeKb)) return "—";
  if (sizeKb < 1024) return `${formatNumber(Math.round(sizeKb))} کیلوبایت`;
  return `${formatNumber(Math.round(sizeKb / 102.4) / 10)} مگابایت`;
}

/**
 * مدارک محصول (کاتالوگ، دفترچه، دیتاشیت، گواهی‌نامه). فایل PDF اول روی
 * `POST /backoffice/media/upload` می‌رود و بعد `mediaId` به
 * `POST /backoffice/products/{id}/documents` فرستاده می‌شود؛ هر تغییر،
 * لیست کامل و تازه‌ی اسناد را برمی‌گرداند.
 */
export function ProductDocuments({
  productId,
  initialDocuments,
}: {
  productId: string;
  initialDocuments: ProductDocument[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<ProductDocument[]>(initialDocuments);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<ProductDocument[]> | null>(null);

  // فرم افزودن
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProductDocumentType>("catalog");
  const [locale, setLocale] = useState<string>("fa");

  /** ردیفی که در حال ویرایش است (عنوان/نوع/زبان/ترتیب) */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<ProductDocumentType>("catalog");
  const [editLocale, setEditLocale] = useState<string>("fa");
  const [editSortOrder, setEditSortOrder] = useState("0");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    if (!file) {
      setResult({ ok: false, message: "فایل PDF سند را انتخاب کنید." });
      return;
    }
    const form = new FormData();
    form.set("file", file);
    startTransition(async () => {
      const res = await addProductDocumentAction(productId, form, {
        title,
        type,
        locale,
        sortOrder: documents.length,
      });
      setResult(res);
      if (res.ok && res.data) {
        setDocuments(res.data);
        setFile(null);
        setTitle("");
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  function startEdit(doc: ProductDocument, index: number) {
    setResult(null);
    setEditingId(doc.id);
    setEditTitle(doc.title);
    setEditType(doc.type);
    setEditLocale(doc.locale ?? "fa");
    setEditSortOrder(String(index));
  }

  function handleSaveEdit(documentId: string) {
    setResult(null);
    const sortOrder = Number(editSortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setResult({ ok: false, message: "ترتیب نمایش باید عدد صحیح و نامنفی باشد." });
      return;
    }
    startTransition(async () => {
      const res = await updateProductDocumentAction(productId, documentId, {
        title: editTitle,
        type: editType,
        locale: editLocale,
        sortOrder,
      });
      setResult(res);
      if (res.ok && res.data) {
        setDocuments(res.data);
        setEditingId(null);
      }
    });
  }

  function handleDelete(documentId: string) {
    setResult(null);
    startTransition(async () => {
      const res = await deleteProductDocumentAction(productId, documentId);
      setResult(res);
      if (res.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
        if (editingId === documentId) setEditingId(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="rounded-lg border p-4">
        <p className="text-sm font-medium">افزودن سند تازه</p>
        <p className="mt-1 text-xs text-muted">
          فقط فایل PDF، حداکثر ۲۰ مگابایت. حذف سند، فایل آپلودشده را پاک نمی‌کند.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="فایل سند (PDF)" htmlFor="document-file">
            <input
              ref={fileRef}
              id="document-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                setResult(null);
                setFile(e.target.files?.[0] ?? null);
              }}
              className="w-full rounded-lg border bg-surface px-3 py-2 text-sm file:me-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1 file:text-sm"
            />
          </Field>

          <Field label="عنوان سند" htmlFor="document-title">
            <TextInput
              id="document-title"
              value={title}
              onChange={(e) => {
                setResult(null);
                setTitle(e.target.value);
              }}
              placeholder="کاتالوگ فارسی"
            />
          </Field>

          <Field label="نوع سند" htmlFor="document-type">
            <SelectInput
              id="document-type"
              value={type}
              onChange={(e) => setType(e.target.value as ProductDocumentType)}
            >
              {PRODUCT_DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PRODUCT_DOCUMENT_TYPE_LABELS[t]}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="زبان سند" htmlFor="document-locale">
            <SelectInput
              id="document-locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
            >
              {PRODUCT_DOCUMENT_LOCALES.map((l) => (
                <option key={l} value={l}>
                  {PRODUCT_DOCUMENT_LOCALE_LABELS[l]}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SubmitButton pending={isPending}>
            <Plus className="size-4" />
            افزودن سند
          </SubmitButton>
          {result?.ok && <FormMessage tone="success">انجام شد.</FormMessage>}
          {result && !result.ok && <FormMessage tone="danger">{result.message}</FormMessage>}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="px-2 py-2 text-start font-medium">عنوان</th>
              <th className="px-2 py-2 text-start font-medium">نوع</th>
              <th className="px-2 py-2 text-start font-medium">زبان</th>
              <th className="px-2 py-2 text-start font-medium">حجم</th>
              <th className="w-px px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-2 py-6 text-center text-muted">
                  هنوز سندی برای این محصول ثبت نشده است.
                </td>
              </tr>
            )}
            {documents.map((doc, index) =>
              editingId === doc.id ? (
                <tr key={doc.id} className="border-t align-top">
                  <td className="px-2 py-2">
                    <TextInput
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      aria-label="عنوان سند"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectInput
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as ProductDocumentType)}
                      aria-label="نوع سند"
                    >
                      {PRODUCT_DOCUMENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {PRODUCT_DOCUMENT_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </SelectInput>
                  </td>
                  <td className="px-2 py-2">
                    <SelectInput
                      value={editLocale}
                      onChange={(e) => setEditLocale(e.target.value)}
                      aria-label="زبان سند"
                    >
                      {PRODUCT_DOCUMENT_LOCALES.map((l) => (
                        <option key={l} value={l}>
                          {PRODUCT_DOCUMENT_LOCALE_LABELS[l]}
                        </option>
                      ))}
                    </SelectInput>
                  </td>
                  <td className="px-2 py-2">
                    <TextInput
                      type="number"
                      min={0}
                      step={1}
                      dir="ltr"
                      value={editSortOrder}
                      onChange={(e) => setEditSortOrder(e.target.value)}
                      aria-label="ترتیب نمایش سند"
                      className="w-20"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(doc.id)}
                        disabled={isPending}
                        className="rounded-lg border px-2 py-1 text-xs hover:bg-background disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : "ذخیره"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg px-2 py-1 text-xs text-muted hover:text-foreground"
                      >
                        انصراف
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={doc.id} className="border-t align-top">
                  <td className="px-2 py-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <FileText className="size-4 shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </a>
                  </td>
                  <td className="px-2 py-2">{PRODUCT_DOCUMENT_TYPE_LABELS[doc.type]}</td>
                  <td className="px-2 py-2">
                    {doc.locale ? PRODUCT_DOCUMENT_LOCALE_LABELS[doc.locale] ?? doc.locale : "—"}
                  </td>
                  <td className="px-2 py-2 text-muted">{formatSizeKb(doc.sizeKb)}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(doc, index)}
                        className="rounded-lg border px-2 py-1 text-xs hover:bg-background"
                      >
                        ویرایش
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        disabled={isPending}
                        aria-label={`حذف سند ${doc.title}`}
                        className="rounded-md p-1.5 text-muted hover:bg-danger-surface hover:text-danger disabled:opacity-50"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
