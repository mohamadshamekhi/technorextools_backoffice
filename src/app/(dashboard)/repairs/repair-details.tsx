"use client";

import { useState, useTransition } from "react";
import { Eye, FileText, Paperclip, Wrench } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { ImageLightbox, type LightboxImage } from "@/components/ui/image-lightbox";
import {
  TextInput,
  TextArea,
  SelectInput,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { formatDateTime, formatToman } from "@/lib/format";
import {
  REPAIR_STATUSES,
  REPAIR_STATUS_LABELS,
  type RepairStatus,
} from "@/lib/api/backoffice/moderation";
import {
  isImageAttachment,
  REPAIR_STATUS_TONE,
  type RepairRequest,
} from "@/lib/api/backoffice/repair";
import { setRepairStatusAction, updateRepairAction } from "./actions";
import type { ActionResult } from "@/lib/forms";

/** یک سطر «برچسب / مقدار» در کارت خلاصه */
function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      {value ? (
        <span
          dir={mono ? "ltr" : undefined}
          className={`text-sm font-medium ${mono ? "font-mono text-xs" : ""}`}
        >
          {value}
        </span>
      ) : (
        <span className="text-sm text-muted">—</span>
      )}
    </div>
  );
}

/** بخش‌بندی مودال با عنوان و آیکن */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

/** جزئیات کامل یک درخواست تعمیر در مودال: مشخصات، پیوست‌ها، یافته‌های تکنسین و تغییر وضعیت */
export function RepairDetails({ repair }: { repair: RepairRequest }) {
  const [open, setOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [status, setStatus] = useState<RepairStatus>(repair.status);
  const [statusNote, setStatusNote] = useState("");
  const [technicianNote, setTechnicianNote] = useState(repair.technicianNote ?? "");
  const [estimatedCost, setEstimatedCost] = useState(
    repair.estimatedCost != null ? String(repair.estimatedCost) : "",
  );
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const images: LightboxImage[] = repair.attachments
    .filter(isImageAttachment)
    .map((a) => ({ id: a.id, url: a.url, alt: a.originalName }));
  const files = repair.attachments.filter((a) => !isImageAttachment(a));
  const statusLabel = repair.statusLabel || REPAIR_STATUS_LABELS[repair.status];

  function handleStatusSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      setResult(await setRepairStatusAction(repair.id, status, statusNote));
      setStatusNote("");
    });
  }

  function handleFindingsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    const cost = estimatedCost.trim();
    if (cost && !Number.isFinite(Number(cost))) {
      setResult({ ok: false, message: "هزینه‌ی تخمینی باید عدد باشد." });
      return;
    }
    startTransition(async () => {
      setResult(
        await updateRepairAction(repair.id, {
          technicianNote: technicianNote.trim() || undefined,
          estimatedCost: cost ? Number(cost) : undefined,
        }),
      );
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs text-muted hover:bg-background hover:text-foreground"
      >
        <Eye className="size-3.5" />
        جزئیات
      </button>

      {open && (
        <Modal
          title="جزئیات درخواست تعمیر"
          description={
            <span className="flex flex-wrap items-center gap-2">
              <Badge tone={REPAIR_STATUS_TONE[repair.status]}>{statusLabel}</Badge>
              <span>ثبت‌شده در {formatDateTime(repair.createdAt)}</span>
            </span>
          }
          onClose={() => setOpen(false)}
        >
          <div className="space-y-7">
            <Section title="مشخصات درخواست" icon={<FileText className="size-4 text-muted" />}>
              <dl className="grid gap-x-6 gap-y-4 rounded-xl border bg-background p-4 sm:grid-cols-2">
                <Field label="مشتری" value={repair.user?.name ?? null} />
                <Field label="شماره تماس" value={repair.user?.mobile ?? null} mono />
                <Field
                  label="سریال گارانتی"
                  value={repair.warranty?.serialNumber ?? null}
                  mono
                />
                <Field label="شناسه سفارش" value={repair.warranty?.orderId ?? null} mono />
                <Field label="شناسه درخواست" value={repair.id} mono />
                <Field
                  label="آخرین به‌روزرسانی"
                  value={repair.updatedAt ? formatDateTime(repair.updatedAt) : null}
                />
              </dl>
            </Section>

            <Section title="شرح مشکل">
              {repair.issueDescription ? (
                <p className="whitespace-pre-wrap rounded-xl border bg-background p-4 text-sm leading-7">
                  {repair.issueDescription}
                </p>
              ) : (
                <p className="text-sm text-muted">مشتری شرحی ثبت نکرده است.</p>
              )}
            </Section>

            <Section
              title={`پیوست‌ها${repair.attachments.length ? ` (${repair.attachments.length})` : ""}`}
              icon={<Paperclip className="size-4 text-muted" />}
            >
              {repair.attachments.length === 0 ? (
                <p className="text-sm text-muted">پیوستی ثبت نشده است.</p>
              ) : (
                <div className="space-y-3">
                  {images.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {images.map((img, i) => (
                        <li key={img.id}>
                          <button
                            type="button"
                            onClick={() => setLightboxIndex(i)}
                            aria-label={`نمایش بزرگ ${img.alt ?? "پیوست"}`}
                            className="block overflow-hidden rounded-xl border transition-colors hover:border-primary"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={img.alt ?? "پیوست درخواست تعمیر"}
                              className="size-20 bg-background object-contain"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {files.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {files.map((file) => (
                        <li key={file.id}>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-primary hover:text-primary"
                          >
                            <Paperclip className="size-3.5" />
                            {file.originalName ?? "دانلود پیوست"}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </Section>

            <Section title="تغییر وضعیت">
              <form
                onSubmit={handleStatusSubmit}
                className="grid gap-3 rounded-xl border bg-background p-4 sm:grid-cols-[13rem_minmax(0,1fr)_auto] sm:items-end"
              >
                <label className="flex flex-col gap-1.5 text-xs text-muted">
                  وضعیت تازه
                  <SelectInput
                    value={status}
                    disabled={isPending}
                    onChange={(e) => setStatus(e.target.value as RepairStatus)}
                  >
                    {REPAIR_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {REPAIR_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </SelectInput>
                </label>
                <label className="flex flex-col gap-1.5 text-xs text-muted">
                  یادداشت (اختیاری)
                  <TextInput
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="مثلاً: قطعه معیوب تعویض شد"
                  />
                </label>
                <SubmitButton pending={isPending}>ثبت وضعیت</SubmitButton>
              </form>
            </Section>

            <Section title="یافته‌های تکنسین" icon={<Wrench className="size-4 text-muted" />}>
              <form
                onSubmit={handleFindingsSubmit}
                className="space-y-3 rounded-xl border bg-background p-4"
              >
                <label className="flex flex-col gap-1.5 text-xs text-muted">
                  یادداشت تکنسین
                  <TextArea
                    value={technicianNote}
                    onChange={(e) => setTechnicianNote(e.target.value)}
                    placeholder="مثلاً: برد اصلی سوخته و باید تعویض شود"
                    rows={3}
                  />
                </label>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <label className="flex flex-col gap-1.5 text-xs text-muted">
                    هزینه تخمینی (تومان)
                    {repair.estimatedCost != null && (
                      <span className="text-xs text-muted">
                        ثبت‌شده: {formatToman(repair.estimatedCost)}
                      </span>
                    )}
                    <TextInput
                      type="number"
                      min={0}
                      dir="ltr"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      placeholder="0"
                      className="w-52"
                    />
                  </label>
                  <SubmitButton pending={isPending}>ذخیره یافته‌ها</SubmitButton>
                </div>
              </form>
            </Section>

            {result?.ok && <FormMessage tone="success">ثبت شد.</FormMessage>}
            {result && !result.ok && <FormMessage tone="danger">{result.message}</FormMessage>}
          </div>
        </Modal>
      )}

      {lightboxIndex !== null && images.length > 0 && (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
