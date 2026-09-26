import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "پنل مدیریت | تکنورکس",
    template: "%s | پنل مدیریت",
  },
  description: "بک‌آفیس و پنل مدیریت وبسایت",
  // پنل داخلی است؛ هیچ صفحه‌ای نباید ایندکس شود (nginx هم X-Robots-Tag می‌فرستد)
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: افزونه‌های مرورگر (مثل LanguageTool) پیش از هایدریت‌شدن
    // React اتریبیوت به <html> اضافه می‌کنند و هشدار mismatch می‌دهند
    <html
      lang="fa"
      dir="rtl"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
