"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { createRoleAction, updateRoleAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import type {
  BackofficeRole,
  PermissionGroup,
} from "@/lib/api/backoffice/access";

export function RoleForm({
  role,
  groups,
}: {
  role?: BackofficeRole;
  groups: PermissionGroup[];
}) {
  const router = useRouter();
  const isEdit = Boolean(role);
  const isSystem = role?.isSystem ?? false;
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [title, setTitle] = useState(role?.title ?? "");
  const [slug, setSlug] = useState(role?.slug ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [perms, setPerms] = useState<Set<string>>(
    new Set(role?.permissions ?? []),
  );

  function toggle(code: string) {
    setPerms((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function toggleGroup(group: PermissionGroup, on: boolean) {
    setPerms((prev) => {
      const next = new Set(prev);
      for (const p of group.permissions) {
        if (on) next.add(p.code);
        else next.delete(p.code);
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان نقش الزامی است.";
    if (!slug.trim()) errs.slug = "اسلاگ الزامی است.";
    if (Object.keys(errs).length > 0) {
      setResult(invalid(errs));
      return;
    }
    setResult(null);
    const permissions = [...perms];
    startTransition(async () => {
      const res = role
        ? await updateRoleAction(role.id, {
            title: title.trim(),
            description: description.trim() || null,
            permissions,
          })
        : await createRoleAction({
            title: title.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            permissions,
          });
      setResult(res);
      if (res.ok && !isEdit && "data" in res && res.data) {
        router.push(`/roles/${res.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="عنوان نقش"
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
            hint="بعد از ساخت قابل تغییر نیست"
            value={slug}
            readOnly={isEdit}
            onChange={setSlug}
            errors={errors}
            onErrorClear={clearError}
            className={isEdit ? "bg-border/30" : ""}
          />
        </div>
        <TextField
          label="توضیح"
          name="description"
          value={description}
          onChange={setDescription}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">دسترسی‌ها</p>
        {isSystem && (
          <p className="text-xs text-warning">
            این نقش سیستمی است؛ تغییر دسترسی‌ها ممکن است اثر کامل نداشته باشد.
          </p>
        )}
        {groups.map((group) => {
          const allOn = group.permissions.every((p) => perms.has(p.code));
          return (
            <div key={group.group} className="rounded-lg border p-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={allOn}
                  onChange={(e) => toggleGroup(group, e.target.checked)}
                  className="size-4 rounded border accent-primary"
                />
                {group.title}
              </label>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {group.permissions.map((p) => (
                  <label
                    key={p.code}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <input
                      type="checkbox"
                      checked={perms.has(p.code)}
                      onChange={() => toggle(p.code)}
                      className="size-4 rounded border accent-primary"
                    />
                    {p.title}
                    <span className="text-xs" dir="ltr">
                      ({p.code})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>
          {isEdit ? "ذخیره تغییرات" : "ساخت نقش"}
        </SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
