import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // فعال‌سازی forbidden() / unauthorized() برای نمایش صفحه‌ی اختصاصی «عدم دسترسی»
    authInterrupts: true,
  },
};

export default nextConfig;
