import { forbidden, notFound, redirect } from "next/navigation";
import { ApiError } from "./http";

/**
 * دور فراخوانی‌های API در **صفحات سرور** بپیچید تا خطاهای احراز هویت/دسترسی
 * به‌جای مرز خطای عمومی، صفحه‌ی درست را نشان دهند:
 *
 * - `401` → ریدایرکت به `/login` (نشست مرده که از میدل‌ور رد شده)
 * - `403` → `forbidden()` → `app/(dashboard)/forbidden.tsx`
 * - بقیه‌ی خطاها → همان‌طور پرتاب می‌شوند (به `error.tsx`)
 *
 * در سرور اکشن‌ها استفاده نکنید؛ آن‌جا `ApiError.displayMessage` را در فرم نشان دهید.
 *
 * ```ts
 * const { items, total } = await guarded(productsApi.list({ skip, take }));
 * ```
 */
export async function guarded<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login");
      if (error.status === 403) forbidden();
    }
    throw error;
  }
}

/**
 * مثل `guarded` ولی برای صفحات جزئیات: `404` را هم به `notFound()` تبدیل می‌کند.
 *
 * ```ts
 * const order = await guardedResource(ordersApi.get(orderNumber));
 * ```
 */
export async function guardedResource<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login");
      if (error.status === 403) forbidden();
      if (error.status === 404) notFound();
    }
    throw error;
  }
}
