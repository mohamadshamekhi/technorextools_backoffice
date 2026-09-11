"use client";

import { useState, useTransition } from "react";
import { TextField, SelectField, SubmitButton, FormMessage } from "@/components/ui/form-controls";
import { replaceAttributeValuesAction } from "./actions";
import { clearFieldError, type ActionResult } from "@/lib/forms";
import type { AttributeGroup } from "@/lib/api/backoffice/categories";
import type { ProductAttributeValue } from "@/lib/api/backoffice/products";

/**
 * مشخصات فنی محصول بر اساس گروه‌های ویژگی دسته‌بندی آن؛ با
 * `PUT /backoffice/products/{id}/attribute-values` کل مجموعه مقادیر جایگزین می‌شود.
 */
export function ProductSpecs({
  productId,
  groups,
  initialValues,
}: {
  productId: string;
  groups: AttributeGroup[];
  initialValues: ProductAttributeValue[];
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  const initialMap = Object.fromEntries(initialValues.map((v) => [v.attributeId, v.value]));
  const [values, setValues] = useState<Record<string, string>>(initialMap);

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  function setValue(attributeId: string, value: string) {
    setValues((prev) => ({ ...prev, [attributeId]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    const payload = Object.entries(values)
      .filter(([, value]) => value.trim() !== "")
      .map(([attributeId, value]) => ({ attributeId, value: value.trim() }));
    startTransition(async () => {
      setResult(await replaceAttributeValuesAction(productId, payload));
    });
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted">
        این دسته‌بندی هیچ گروه ویژگی‌ای ندارد؛ از صفحه‌ی دسته‌بندی می‌توانید ویژگی تعریف کنید.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {groups.map((group) => (
        <div key={group.id} className="space-y-3">
          <p className="text-sm font-medium">{group.title}</p>
          {group.attributes.length === 0 ? (
            <p className="text-xs text-muted">این گروه هنوز ویژگی‌ای ندارد.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {group.attributes.map((attr) => {
                const value = values[attr.id] ?? "";
                const label = attr.unit ? `${attr.title} (${attr.unit})` : attr.title;
                if (attr.inputType === "select") {
                  return (
                    <SelectField
                      key={attr.id}
                      label={label}
                      name={attr.id}
                      value={value}
                      onChange={(v) => { setValue(attr.id, v); clearError(attr.id); }}
                      errors={errors}
                    >
                      <option value="">— انتخاب کنید —</option>
                      {attr.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </SelectField>
                  );
                }
                if (attr.inputType === "boolean") {
                  return (
                    <SelectField
                      key={attr.id}
                      label={label}
                      name={attr.id}
                      value={value}
                      onChange={(v) => { setValue(attr.id, v); clearError(attr.id); }}
                      errors={errors}
                    >
                      <option value="">— نامشخص —</option>
                      <option value="true">دارد</option>
                      <option value="false">ندارد</option>
                    </SelectField>
                  );
                }
                return (
                  <TextField
                    key={attr.id}
                    label={label}
                    name={attr.id}
                    type={attr.inputType === "number" ? "number" : "text"}
                    dir={attr.inputType === "number" ? "ltr" : undefined}
                    value={value}
                    onChange={(v) => setValue(attr.id, v)}
                    errors={errors}
                    onErrorClear={clearError}
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center gap-3 border-t pt-4">
        <SubmitButton pending={isPending}>ذخیره مشخصات فنی</SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && <FormMessage tone="danger">{result.message}</FormMessage>}
      </div>
    </form>
  );
}
