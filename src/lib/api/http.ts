// server-only: از next/headers استفاده می‌کند و فقط در کانتکست درخواست سرور کار می‌کند.
// اگر پکیج `server-only` نصب شد، این خط را اضافه کنید: import "server-only";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";

/**
 * کلاینت HTTP مشترک برای صدا زدن API بک‌اند.
 * فقط سمت سرور (Server Component / route handler / server action) — توکن نباید به باندل کلاینت برسد.
 * قرارداد endpointها: docs/api/  (تولیدشده از کالکشن Postman)
 */

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";
/** توکن سرویس‌به‌سرویس؛ اگر ست باشد روی هدر X-Service-Token می‌رود (مسیرهای /backoffice/*) */
const SERVICE_TOKEN = process.env.API_SERVICE_TOKEN;

export type ApiErrorBody = {
  message?: string;
  code?: string;
  /** جزئیات ساختاریِ خطا؛ شرط‌ها باید روی `details.code` باشد نه متن پیام */
  details?: { code?: string; [key: string]: unknown };
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody,
  ) {
    super(body.message ?? `API error ${status}`);
    this.name = "ApiError";
  }

  /** توکن نامعتبر/منقضی */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** دسترسی غیرمجاز (permission کافی نیست) */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** کد ساختاری خطا (`details.code` و در نبودش `code`) — مبنای شرط‌گذاری */
  get code(): string | undefined {
    return this.body.details?.code ?? this.body.code;
  }

  /** پیام فارسیِ قابل نمایش به کاربر */
  get displayMessage(): string {
    if (this.body.message) return this.body.message;
    if (this.status === 401) return "نشست شما منقضی شده است. دوباره وارد شوید.";
    if (this.status === 403) return "شما به این بخش دسترسی ندارید.";
    if (this.status === 404) return "موردی یافت نشد.";
    if (this.status >= 500) return "خطای سرور. کمی بعد دوباره تلاش کنید.";
    return "درخواست ناموفق بود.";
  }
}

/** صفحه‌بندی استاندارد لیست‌ها (skip / take) */
export type Paginated<T> = {
  items: T[];
  total: number;
  skip: number;
  take: number;
};

type RequestOptions = {
  /** query string params؛ مقادیر undefined/null حذف می‌شوند */
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  /** کنترل کش Next؛ پیش‌فرض no-store برای داده‌ی پنل */
  cache?: RequestCache;
  revalidate?: number;
  /** برای endpointهای بدون احراز هویت (auth/otp/*) */
  auth?: boolean;
  signal?: AbortSignal;
};

async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { query, body, cache = "no-store", revalidate, auth = true, signal } = opts;

  // FormData → بگذار fetch خودش `Content-Type: multipart/form-data; boundary=…` را ست کند.
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (SERVICE_TOKEN) headers["X-Service-Token"] = SERVICE_TOKEN;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body:
      body === undefined
        ? undefined
        : isForm
          ? (body as FormData)
          : JSON.stringify(body),
    signal,
    cache: revalidate === undefined ? cache : undefined,
    next: revalidate === undefined ? undefined : { revalidate },
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const parsed = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new ApiError(res.status, (parsed as ApiErrorBody) ?? {});
  }
  return parsed as T;
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "body">) =>
    request<T>("GET", path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("POST", path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PATCH", path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PUT", path, { ...opts, body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, "body">) =>
    request<T>("DELETE", path, opts),
};
