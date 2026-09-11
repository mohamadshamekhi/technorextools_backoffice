# backoffice — پنل مدیریت

پنل ادمین وبسایت، ساخته‌شده با **Next.js (App Router) + TypeScript + Tailwind CSS v4**.

## اجرا

```bash
npm install
cp .env.example .env.local   # آدرس API بک‌اند
npm run dev      # اجرای محیط توسعه روی http://localhost:3000
npm run build    # بیلد پروداکشن
npm run lint     # چک ESLint
npm run gen:api  # بازتولید docs/api/ از کالکشن Postman
```

## متغیرهای محیطی

| متغیر | توضیح |
|---|---|
| `API_BASE_URL` | آدرس پایه‌ی API بک‌اند شامل نسخه (پیش‌فرض `http://localhost:4000/api/v1`) |

نمونه در `.env.example`. فایل `.env.local` را بسازید (در `.gitignore` است).

## API بک‌اند

قرارداد کامل API در کالکشن Postman خارج از این ریپو است (`../api/postman/`). مرجع فشرده‌ی خوانا در `docs/api/` تولید می‌شود (`npm run gen:api`) — از `docs/api/INDEX.md` شروع کنید. کلاینت تایپ‌دار سمت سرور: `src/lib/api/`.

## ساختار پروژه

```
src/
├── app/
│   ├── layout.tsx              # لایوت ریشه (RTL + زبان فارسی)
│   ├── globals.css             # توکن‌های رنگ و تم (Tailwind v4)
│   ├── login/page.tsx          # صفحه ورود (خارج از لایوت داشبورد)
│   └── (dashboard)/            # همه صفحات داخل این گروه، داخل شِل داشبورد رندر می‌شوند
│       ├── layout.tsx          # سایدبار + هدر
│       ├── page.tsx            # داشبورد (صفحه اصلی)
│       ├── users/              # لیست + جزئیات/ویرایش کاربر (page، loading، [userId]، actions)
│       ├── products/           # لیست + جزئیات/ویرایش محصول
│       ├── orders/             # لیست + جزئیات سفارش + تغییر وضعیت
│       └── settings/           # فرم تنظیمات کلید/مقدار
├── components/
│   ├── layout/
│   │   └── dashboard-shell.tsx # سایدبار (ریسپانسیو) + هدر + خروج
│   └── ui/
│       ├── page-header.tsx     # تیتر و توضیحات صفحه + دکمه‌های اکشن
│       ├── card.tsx            # کارت عمومی
│       ├── empty-state.tsx     # حالت خالی
│       ├── data-table.tsx      # جدول تایپ‌شده‌ی سبک
│       ├── pagination.tsx      # صفحه‌بندی skip/take روی query string
│       ├── search-field.tsx    # جستجوی سروری با debounce
│       ├── badge.tsx           # بج وضعیت (توکن‌های معنایی)
│       ├── form-controls.tsx   # کنترل‌های فرم یکدست
│       ├── error-view.tsx      # نمای خطای مشترک error.tsx
│       └── skeleton.tsx        # اسکلت لودینگ
├── lib/
│   ├── navigation.ts           # آیتم‌های منوی سایدبار (منبع واحد)
│   ├── auth.ts                 # نام و تنظیمات کوکی‌های سشن + خواندن انقضای JWT (client-safe)
│   ├── session.ts              # لایه‌ی سشن سمت سرور (getCurrentUser، getAccessToken)
│   ├── auth-actions.ts         # سرور اکشن‌های ورود/خروج (نوشتن کوکی httpOnly)
│   ├── format.ts               # فرمت‌کننده‌های فارسی (عدد، تومان، تاریخ)
│   ├── pagination.ts           # خواندن پارامترهای صفحه‌بندی از searchParams
│   └── api/                    # کلاینت تایپ‌دار API (فقط سمت سرور)
│       ├── http.ts             # fetch wrapper + ApiError + Paginated
│       ├── auth.ts             # بخش auth
│       └── backoffice/         # تفکیک بر دامنه: users، products، orders، settings، reports
└── proxy.ts                    # میدل‌ور احراز هویت Next 16 + نوسازی خودکار توکن

docs/api/       # مرجع API تولیدشده از Postman (npm run gen:api)
scripts/        # ابزارهای توسعه (gen-api-docs.mjs)
.claude/        # راهنمای Claude Code: CLAUDE.md + rules/
```

## افزودن صفحه جدید

1. داخل `src/app/(dashboard)/` یک فولدر جدید بسازید (مثلاً `reports/page.tsx`).
2. در `src/lib/navigation.ts` یک آیتم به `navItems` اضافه کنید تا در سایدبار ظاهر شود.

## نکات

- **زبان و جهت:** کل اپ فارسی و RTL است (`lang="fa" dir="rtl"`).
- **فونت:** استک `Vazirmatn → Tahoma`؛ اگر فونت وب خواستید، فایل وزیرمتن را در `layout.tsx` با `next/font/local` اضافه کنید.
- **رنگ‌ها:** توکن‌های تم در `globals.css` تعریف شده‌اند (`background`, `surface`, `primary`, `muted`, `border`).
- **احراز هویت:** ورود با OTP از `POST /auth/otp/request` و `/auth/otp/verify`. توکن‌ها در دو کوکی httpOnly (`bo_access`، `bo_refresh`) نگه‌داری می‌شوند و فقط در سرور اکشن‌ها و `proxy.ts` نوشته می‌شوند. `proxy.ts` توکن منقضی را با `POST /auth/refresh` به‌صورت خودکار می‌چرخاند؛ در صورت شکست، کوکی پاک و کاربر به `/login` هدایت می‌شود. اعتبار امضای توکن با خود بک‌اند است.
