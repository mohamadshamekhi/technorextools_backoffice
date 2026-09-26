import { brandsApi, categoriesApi } from "@/lib/api";
import type { RefOption } from "./product-form";

/** برند و دسته‌بندی برای انتخابگرهای فرم محصول (سمت سرور). */
export async function loadProductRefs(): Promise<{
  brands: RefOption[];
  categories: RefOption[];
}> {
  const [brands, categories] = await Promise.all([
    brandsApi.list().catch(() => []),
    categoriesApi.list({ take: 100 }).then((r) => r.items).catch(() => []),
  ]);
  return {
    brands: brands.map((b) => ({ id: b.id, title: b.title })),
    categories: categories.map((c) => ({ id: c.id, title: c.title })),
  };
}
