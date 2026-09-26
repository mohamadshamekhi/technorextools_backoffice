import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_FALLBACK_TTL,
  REFRESH_TOKEN_TTL,
  sessionCookieOptions,
  isTokenExpired,
} from "@/lib/auth";

/**
 * احراز هویت لبه‌ای (Next 16 middleware — نام تابع باید `proxy` باشد).
 *
 * - توکن access معتبر → عبور
 * - access منقضی/نبود ولی refresh هست → نوسازی از بک‌اند و ست‌کردن کوکی روی پاسخ
 * - بدون سشن معتبر روی مسیر محافظت‌شده → ریدایرکت به /login (و پاک‌سازی کوکی)
 * - سشن معتبر روی /login → ریدایرکت به /
 *
 * اعتبار امضای توکن اینجا بررسی نمی‌شود؛ صرفاً انقضا. اعتبار واقعی با خود بک‌اند است.
 */

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  let authed = Boolean(accessToken) && !isTokenExpired(accessToken);
  let refreshed: RefreshedTokens | null = null;

  if (!authed && refreshToken) {
    refreshed = await tryRefresh(refreshToken);
    authed = refreshed !== null;
  }

  if (!authed) {
    if (isLoginPage) return NextResponse.next();
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete(ACCESS_TOKEN_COOKIE);
    res.cookies.delete(REFRESH_TOKEN_COOKIE);
    return res;
  }

  const res = isLoginPage
    ? NextResponse.redirect(new URL("/", request.url))
    : NextResponse.next();

  if (refreshed) {
    res.cookies.set(
      ACCESS_TOKEN_COOKIE,
      refreshed.accessToken,
      sessionCookieOptions(refreshed.expiresIn ?? ACCESS_TOKEN_FALLBACK_TTL),
    );
    res.cookies.set(
      REFRESH_TOKEN_COOKIE,
      refreshed.refreshToken,
      sessionCookieOptions(REFRESH_TOKEN_TTL),
    );
  }

  return res;
}

type RefreshedTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
};

async function tryRefresh(refreshToken: string): Promise<RefreshedTokens | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<RefreshedTokens>;
    if (!data.accessToken || !data.refreshToken) return null;
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    };
  } catch {
    return null;
  }
}

export const config = {
  // همه مسیرها به‌جز استاتیک‌ها
  matcher: [
    "/((?!api/health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
