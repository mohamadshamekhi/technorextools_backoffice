import Link from "next/link";
import type { ReactNode } from "react";

/** لینک با ظاهر دکمه — برای اکشن‌های صفحه مثل «افزودن» و «بازگشت». */
export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const cls =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : "border text-muted hover:text-foreground";
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${cls}`}
    >
      {children}
    </Link>
  );
}
