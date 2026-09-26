"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_FALLBACK_TTL,
  REFRESH_TOKEN_TTL,
  sessionCookieOptions,
} from "@/lib/auth";
import { authApi, ApiError } from "@/lib/api";

/**
 * سرور اکشن‌های احراز هویت. کوکی‌های httpOnly فقط اینجا (و در proxy) نوشته می‌شوند —
 * هرگز از `document.cookie` سمت کلاینت.
 */

export type SendOtpState =
  | { status: "idle" }
  | { status: "sent"; resendAfter: number }
  | { status: "error"; message: string };

export type VerifyOtpState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string };

/** مرحله ۱: درخواست کد تایید */
export async function sendOtpAction(mobile: string): Promise<SendOtpState> {
  try {
    const res = await authApi.requestOtp({ mobile });
    return { status: "sent", resendAfter: res.resendAfter };
  } catch (error) {
    return { status: "error", message: toMessage(error) };
  }
}

/** مرحله ۲: تایید کد و برقراری سشن */
export async function verifyOtpAction(
  mobile: string,
  code: string,
): Promise<VerifyOtpState> {
  try {
    const res = await authApi.verifyOtp({ mobile, code });

    // پنل مدیریت فقط برای نقش‌های بالاتر از «مشتری» است. کاربر عادی (یا بدون نقش)
    // کد را درست وارد کرده ولی سشن نمی‌گیرد؛ کوکی‌ای نوشته نمی‌شود.
    if (!isStaffRole(res.user.role)) {
      return {
        status: "error",
        message: "این حساب دسترسی به پنل مدیریت ندارد.",
      };
    }

    await writeSession(res.accessToken, res.refreshToken, res.expiresIn);
    return { status: "ok" };
  } catch (error) {
    return { status: "error", message: toMessage(error) };
  }
}

/** نقش کارمندی = هر نقشی جز «مشتری» و جز بدون‌نقش. */
function isStaffRole(role: string | null | undefined): boolean {
  return typeof role === "string" && role.trim() !== "" && role !== "customer";
}

/** خروج: باطل کردن توکن سمت سرور (best-effort) و پاک کردن کوکی‌ها */
export async function logoutAction(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // حتی اگر باطل‌سازی سمت سرور شکست خورد، کوکی محلی پاک می‌شود
  }
  await clearSession();
  redirect("/login");
}

async function writeSession(
  accessToken: string,
  refreshToken: string,
  expiresIn?: number,
): Promise<void> {
  const store = await cookies();
  store.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    sessionCookieOptions(expiresIn ?? ACCESS_TOKEN_FALLBACK_TTL),
  );
  store.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    sessionCookieOptions(REFRESH_TOKEN_TTL),
  );
}

async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

function toMessage(error: unknown): string {
  if (error instanceof ApiError) return error.displayMessage;
  return "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.";
}
