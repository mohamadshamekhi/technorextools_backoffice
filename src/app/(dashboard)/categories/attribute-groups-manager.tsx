"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, X } from "lucide-react";
import {
  TextInput,
  SelectInput,
  FormMessage,
} from "@/components/ui/form-controls";
import {
  createAttributeAction,
  createAttributeGroupAction,
  deleteAttributeAction,
  deleteAttributeGroupAction,
} from "./actions";
import { fieldError, type ActionResult } from "@/lib/forms";
import type {
  AttributeGroup,
  AttributeInputType,
} from "@/lib/api/backoffice/categories";

const INPUT_TYPES: { value: AttributeInputType; label: string }[] = [
  { value: "text", label: "متن" },
  { value: "number", label: "عدد" },
  { value: "select", label: "انتخابی" },
  { value: "boolean", label: "بله/خیر" },
];

const INPUT_TYPE_LABEL: Record<AttributeInputType, string> = Object.fromEntries(
  INPUT_TYPES.map((t) => [t.value, t.label]),
) as Record<AttributeInputType, string>;

export function AttributeGroupsManager({
  categoryId,
  groups,
}: {
  categoryId: string;
  groups: AttributeGroup[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<ActionResult | null>(null);
  const [addingGroup, setAddingGroup] = useState(false);

  function run(fn: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && !error.ok && <FormMessage tone="danger">{error.message}</FormMessage>}

      {groups.length === 0 && !addingGroup && (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted">
          هنوز گروه ویژگی‌ای برای این دسته تعریف نشده است.
        </p>
      )}

      <div className="space-y-3">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            categoryId={categoryId}
            group={group}
            disabled={isPending}
            onDeleteGroup={() =>
              run(() => deleteAttributeGroupAction(categoryId, group.id))
            }
            onDeleteAttribute={(attrId) =>
              run(() => deleteAttributeAction(categoryId, attrId))
            }
          />
        ))}
      </div>

      {addingGroup ? (
        <NewGroupForm
          disabled={isPending}
          onCancel={() => setAddingGroup(false)}
          onCreate={async (title) => {
            const res = await createAttributeGroupAction(categoryId, title);
            if (res.ok) {
              setAddingGroup(false);
              router.refresh();
            }
            return res;
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAddingGroup(true)}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-border/40"
        >
          <Plus className="size-4" />
          گروه ویژگی جدید
        </button>
      )}
    </div>
  );
}

function NewGroupForm({
  disabled,
  onCancel,
  onCreate,
}: {
  disabled: boolean;
  onCancel: () => void;
  onCreate: (title: string) => Promise<ActionResult>;
}) {
  const [title, setTitle] = useState("");
  const [isCreating, startCreating] = useTransition();
  const [error, setError] = useState<ActionResult | null>(null);

  return (
    <div className="space-y-1 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <TextInput
          autoFocus
          aria-label="عنوان گروه جدید"
          placeholder="مثلاً: مشخصات فنی"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(fieldError(error, "title")) || undefined}
          className={`max-w-xs ${fieldError(error, "title") ? "border-danger" : ""}`}
        />
        <button
          type="button"
          disabled={disabled || isCreating || !title.trim()}
          onClick={() =>
            startCreating(async () => {
              const res = await onCreate(title.trim());
              if (!res.ok) setError(res);
            })
          }
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          ثبت گروه
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="انصراف"
          className="rounded-lg p-2 text-muted hover:bg-border/40"
        >
          <X className="size-4" />
        </button>
      </div>
      {error && !error.ok && (
        <p role="alert" className="text-xs text-danger">
          {fieldError(error, "title") ?? error.message}
        </p>
      )}
    </div>
  );
}

function GroupCard({
  categoryId,
  group,
  disabled,
  onDeleteGroup,
  onDeleteAttribute,
}: {
  categoryId: string;
  group: AttributeGroup;
  disabled: boolean;
  onDeleteGroup: () => void;
  onDeleteAttribute: (attributeId: string) => void;
}) {
  const router = useRouter();
  const [addingAttribute, setAddingAttribute] = useState(false);

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{group.title}</p>
        <button
          type="button"
          onClick={onDeleteGroup}
          disabled={disabled}
          aria-label={`حذف گروه ${group.title}`}
          className="rounded-lg p-2 text-muted hover:bg-danger-surface hover:text-danger"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {group.attributes.length > 0 ? (
        <ul className="mt-3 divide-y rounded-lg border">
          {group.attributes.map((attr) => (
            <li
              key={attr.id}
              className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span>{attr.title}</span>
                {attr.unit && <span className="text-xs text-muted">({attr.unit})</span>}
                <span className="rounded-full bg-border/50 px-2 py-0.5 text-xs text-muted">
                  {INPUT_TYPE_LABEL[attr.inputType]}
                  {attr.inputType === "select" && attr.options.length > 0
                    ? `: ${attr.options.join("، ")}`
                    : ""}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onDeleteAttribute(attr.id)}
                disabled={disabled}
                aria-label={`حذف ویژگی ${attr.title}`}
                className="shrink-0 text-muted hover:text-danger"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">این گروه هنوز ویژگی‌ای ندارد.</p>
      )}

      {addingAttribute ? (
        <NewAttributeForm
          disabled={disabled}
          onCancel={() => setAddingAttribute(false)}
          onCreate={async (input) => {
            const res = await createAttributeAction(categoryId, group.id, input);
            if (res.ok) {
              setAddingAttribute(false);
              router.refresh();
            }
            return res;
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAddingAttribute(true)}
          disabled={disabled}
          className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          افزودن ویژگی
        </button>
      )}
    </div>
  );
}

function NewAttributeForm({
  disabled,
  onCancel,
  onCreate,
}: {
  disabled: boolean;
  onCancel: () => void;
  onCreate: (input: {
    title: string;
    unit: string | null;
    inputType: AttributeInputType;
    options: string[];
  }) => Promise<ActionResult>;
}) {
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("");
  const [inputType, setInputType] = useState<AttributeInputType>("text");
  const [optionsText, setOptionsText] = useState("");
  const [isCreating, startCreating] = useTransition();
  const [error, setError] = useState<ActionResult | null>(null);

  const options = optionsText
    .split("،")
    .map((o) => o.trim())
    .filter(Boolean);
  const needsOptions = inputType === "select";

  return (
    <div className="mt-3 space-y-2 rounded-lg border bg-background p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <TextInput
          autoFocus
          aria-label="عنوان ویژگی"
          placeholder="عنوان ویژگی — مثلاً رنگ"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(fieldError(error, "title")) || undefined}
          className={fieldError(error, "title") ? "border-danger" : ""}
        />
        <TextInput
          aria-label="واحد (اختیاری)"
          placeholder="واحد — مثلاً کیلوگرم (اختیاری)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
        <SelectInput
          aria-label="نوع ورودی"
          value={inputType}
          onChange={(e) => setInputType(e.target.value as AttributeInputType)}
        >
          {INPUT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </SelectInput>
        {needsOptions && (
          <TextInput
            aria-label="گزینه‌ها (با ، جدا شوند)"
            placeholder="گزینه‌ها، با ، جدا شوند"
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            aria-invalid={Boolean(fieldError(error, "options")) || undefined}
            className={fieldError(error, "options") ? "border-danger" : ""}
          />
        )}
      </div>
      {needsOptions && (
        <p className="text-xs text-muted">برای نوع «انتخابی» حداقل یک گزینه لازم است.</p>
      )}
      {error && !error.ok && (
        <p role="alert" className="text-xs text-danger">
          {fieldError(error, "options") ?? fieldError(error, "title") ?? error.message}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={
            disabled || isCreating || !title.trim() || (needsOptions && options.length === 0)
          }
          onClick={() =>
            startCreating(async () => {
              const res = await onCreate({
                title: title.trim(),
                unit: unit.trim() || null,
                inputType,
                options: needsOptions ? options : [],
              });
              if (!res.ok) setError(res);
            })
          }
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          ثبت ویژگی
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-border/40"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
