import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

/** صفحه‌ی «عدم دسترسی» — وقتی نقش کاربر مجوز لازم برای این بخش را ندارد (۴۰۳) */
export default function Forbidden() {
  return (
    <>
      <PageHeader title="دسترسی ندارید" />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-surface px-6 py-16 text-center">
        <ShieldAlert className="mb-4 size-10 text-danger" />
        <h3 className="font-semibold">مجوز لازم برای این بخش را ندارید</h3>
        <p className="mt-1 max-w-sm text-sm text-muted">
          برای دسترسی به این صفحه باید نقش شما توسط مدیر سیستم مجوز مربوطه را داشته
          باشد.
        </p>
        <Link
          href="/"
          className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          بازگشت به داشبورد
        </Link>
      </div>
    </>
  );
}
