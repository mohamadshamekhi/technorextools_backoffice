import type {
  ReactNode,
  SelectHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Loader2 } from "lucide-react";
import type { FieldErrors } from "@/lib/forms";

/**
 * کنترل‌های فرم با ظاهر یکدست. صرفاً markup استایل‌خورده‌اند؛
 * در کامپوننت‌های کلاینت (فرم‌های دارای state) استفاده می‌شوند.
 */

const CONTROL =
  "w-full rounded-lg border bg-surface px-3 py-2.5 text-sm shadow-sm outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 group-data-[invalid=true]:border-danger group-data-[invalid=true]:focus:ring-danger/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  /** پیام خطای فیلد؛ نمایش داده می‌شود زیر کنترل و کادر ورودی را قرمز می‌کند */
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="group space-y-1" data-invalid={error ? true : undefined}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL} ${props.className ?? ""}`} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${CONTROL} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={5}
      {...props}
      className={`${CONTROL} resize-y ${props.className ?? ""}`}
    />
  );
}

/** props مشترکِ اتصال یک کنترل به خطای فیلدیِ فرم */
type FieldErrorProps = {
  /** نام فیلد؛ همان کلیدی که در `FieldErrors` برگشتی از سرور اکشن استفاده می‌شود */
  name: string;
  errors?: FieldErrors;
  /** با تایپ کاربر صدا زده می‌شود تا خطای قبلیِ همین فیلد پاک شود */
  onErrorClear?: (name: string) => void;
};

/** ترکیب Field + TextInput با اتصال خودکار به خطای فیلدی — برای اکثر ورودی‌های متنی از این استفاده کنید */
export function TextField({
  label,
  name,
  hint,
  value,
  onChange,
  errors,
  onErrorClear,
  ...rest
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
} & FieldErrorProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name" | "value" | "onChange">) {
  return (
    <Field label={label} htmlFor={name} hint={hint} error={errors?.[name]}>
      <TextInput
        id={name}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onErrorClear?.(name);
        }}
        {...rest}
      />
    </Field>
  );
}

/** ترکیب Field + TextArea با اتصال خودکار به خطای فیلدی */
export function TextAreaField({
  label,
  name,
  hint,
  value,
  onChange,
  errors,
  onErrorClear,
  ...rest
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
} & FieldErrorProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "name" | "value" | "onChange">) {
  return (
    <Field label={label} htmlFor={name} hint={hint} error={errors?.[name]}>
      <TextArea
        id={name}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onErrorClear?.(name);
        }}
        {...rest}
      />
    </Field>
  );
}

/** ترکیب Field + SelectInput با اتصال خودکار به خطای فیلدی */
export function SelectField({
  label,
  name,
  hint,
  value,
  onChange,
  errors,
  onErrorClear,
  children,
  ...rest
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
} & FieldErrorProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "name" | "value" | "onChange">) {
  return (
    <Field label={label} htmlFor={name} hint={hint} error={errors?.[name]}>
      <SelectInput
        id={name}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onErrorClear?.(name);
        }}
        {...rest}
      >
        {children}
      </SelectInput>
    </Field>
  );
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border accent-primary"
      />
      {label}
    </label>
  );
}

export function SubmitButton({
  pending,
  children = "ذخیره تغییرات",
}: {
  pending: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function FormMessage({
  tone,
  children,
}: {
  tone: "success" | "danger";
  children: ReactNode;
}) {
  return (
    <p className={tone === "success" ? "text-sm text-success" : "text-sm text-danger"}>
      {children}
    </p>
  );
}
