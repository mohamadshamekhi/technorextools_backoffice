import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // فعال‌سازی forbidden() / unauthorized() برای نمایش صفحه‌ی اختصاصی «عدم دسترسی»
    authInterrupts: true,
    // سقف حجم بدنه‌ی سرور اکشن‌ها — آپلود تصویر/فایل با پیش‌فرض ۱ مگابایت رد می‌شد
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
