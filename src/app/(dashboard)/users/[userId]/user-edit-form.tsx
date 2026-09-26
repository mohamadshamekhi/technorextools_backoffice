"use client";

import { useState, useTransition } from "react";
import {
  TextField,
  SelectField,
  CheckboxField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { updateUserAction } from "../actions";
import { clearFieldError, type ActionResult } from "@/lib/forms";
import type { BackofficeUser, Role } from "@/lib/api/backoffice/users";

export function UserEditForm({
  user,
  roles,
}: {
  user: BackofficeUser;
  roles: Role[];
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [roleId, setRoleId] = useState(user.role?.id ?? "");
  const [isActive, setIsActive] = useState(user.isActive);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      setResult(
        await updateUserAction(user.id, {
          fullName: fullName.trim() || undefined,
          email: email.trim() || undefined,
          roleId: roleId || undefined,
          isActive,
        }),
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <TextField
        label="نام کامل"
        name="fullName"
        value={fullName}
        onChange={setFullName}
        errors={errors}
        onErrorClear={clearError}
      />

      <TextField
        label="ایمیل"
        name="email"
        type="email"
        dir="ltr"
        value={email}
        onChange={setEmail}
        errors={errors}
        onErrorClear={clearError}
      />

      <SelectField
        label="نقش"
        name="roleId"
        value={roleId}
        onChange={setRoleId}
        errors={errors}
        onErrorClear={clearError}
      >
        <option value="">— بدون نقش —</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.title}
          </option>
        ))}
      </SelectField>

      <CheckboxField
        id="isActive"
        label="حساب فعال است"
        checked={isActive}
        onChange={setIsActive}
      />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending} />
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
