# Authentication

ورود واقعی با OTP به بک‌اند وصل است. توکن‌ها در دو کوکی **httpOnly** نگه‌داری می‌شوند و
فقط در سرور اکشن‌ها و `proxy.ts` نوشته می‌شوند — هرگز از `document.cookie`.

## Moving parts

| File | Responsibility |
|---|---|
| `src/lib/auth.ts` | ثابت‌ها و ابزار **بدون** `next/headers` (امن در Edge/کلاینت): نام کوکی‌ها (`bo_access`، `bo_refresh`)، `sessionCookieOptions()`، `isTokenExpired()` (خواندن `exp` بدون اعتبارسنجی امضا). |
| `src/lib/auth-actions.ts` | `"use server"` — `sendOtpAction`، `verifyOtpAction` (فقط برای نقش کارمندی کوکی ست می‌کند؛ `isStaffRole`)، `logoutAction` (بک‌اند را صدا می‌زند، کوکی پاک، `redirect('/login')`). |
| `src/lib/session.ts` | سمت سرور: `getAccessToken()`، `hasSession()`، `getCurrentUser()` (کش‌شده با `react/cache`، `GET /auth/me`). |
| `src/proxy.ts` | میدل‌ور Next 16 (نام تابع `proxy`). access معتبر → عبور؛ منقضی/نبود ولی refresh هست → `POST /auth/refresh` و ست‌کردن جفت توکن روی پاسخ؛ بدون سشن معتبر → ریدایرکت به `/login` + پاک‌سازی کوکی؛ سشن معتبر روی `/login` → ریدایرکت به `/`. `config.matcher` استاتیک‌ها را کنار می‌گذارد. |
| `src/app/login/page.tsx` | Client. جریان دو مرحله‌ای (`"phone"` → `"otp"`) با `useTransition` روی سرور اکشن‌ها. `MOBILE_REGEX = /^09\d{9}$/`، کول‌داون از `resendAfter` پاسخ بک‌اند. |
| `src/components/auth/otp-input.tsx` | فیلد خانه‌ای OTP (prop `length`، پیش‌فرض ۵ — مطابق بک‌اند)؛ `onComplete` را با کد کامل صدا می‌زند. |
| `src/components/layout/dashboard-shell.tsx` | `handleLogout` سرور اکشن `logoutAction` را اجرا می‌کند. `user` را به‌عنوان prop از لایوت گروه می‌گیرد. |
| `src/app/(dashboard)/layout.tsx` | async Server Component: `getCurrentUser()` را صدا می‌زند؛ روی 401/403 به `/login`. |

## API مصرف‌شده (docs/api/auth.md)

- `POST /auth/otp/request` `{ mobile }` → `{ expiresIn, resendAfter, devCode? }`
- `POST /auth/otp/verify` `{ mobile, code }` → `{ accessToken, expiresIn, refreshToken, isNewUser, user }`
  - **دروازهٔ نقش:** `verifyOtpAction` فقط وقتی کوکی می‌نویسد که `user.role` نقش کارمندی باشد (هر مقداری جز `customer` و جز خالی — `isStaffRole`). در غیر این صورت خطای «دسترسی به پنل مدیریت ندارد» و بدون سشن.
- `POST /auth/refresh` `{ refreshToken }` → جفت توکن تازه (توکن قبلی باطل)
- `GET /auth/me` → `{ id, fullName, mobile, email, role, referralCode }`
- `POST /auth/logout` → 204 (همه refresh tokenها باطل)

## نکات باقی‌مانده / TODO

- اعتبار امضای توکن در لبه بررسی **نمی‌شود** (فقط `exp`)؛ اعتبار واقعی با بک‌اند است.
- CSRF و rate-limiting روی endpointهای OTP سمت بک‌اند لازم است — هنگام سخت‌سازی بررسی شود.
- `secure` روی کوکی‌ها فقط در production فعال است (`sessionCookieOptions`).

## Conventions

- احراز هویت سطح-مسیر در `proxy.ts`. صفحات فرض می‌کنند پشت آن هستند و کوکی را دوباره چک نمی‌کنند.
- هرگز توکن، کد OTP یا شماره‌ی کامل لاگ نشود.
