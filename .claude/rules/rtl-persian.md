# RTL & Persian localization

The entire application is `lang="fa" dir="rtl"` (set on `<html>` in `src/app/layout.tsx`). This is a hard product constraint, not a preference.

## Language

- Every user-visible string is Persian. Every code comment and JSDoc block is Persian — match the tone of the existing files.
- Use Persian punctuation in prose strings: `،` `؛` `»«` rather than `,` `;` `""`.
- Keep a consistent register: formal-but-plain («وارد کنید»، «ثبت شد»), not colloquial.
- No hard-coded strings that should be dynamic (counts, names, dates) — interpolate.
- There is no i18n framework; if one is ever added, strings move to message catalogs — until then, inline Persian is correct.

## Direction & layout

- Mental model: **start = right, end = left.** The desktop sidebar is on the right (`border-l`), the mobile drawer enters from `right-0`.
- Prefer logical Tailwind utilities: `ps-*`/`pe-*`, `ms-*`/`me-*`, `start-*`/`end-*`, `text-start`/`text-end`. Use physical `left`/`right`/`pl`/`pr` only when the effect is genuinely physical (e.g. an absolutely-positioned decorative icon) and comment why.
- Directional icons follow reading order: "back" points **right** (`ArrowRight`), "forward"/"next" points left. See `src/app/login/page.tsx`.
- Chevrons, carousels, progress steppers, and animations all run right-to-left.

## Numerals & LTR islands

- Content that is inherently left-to-right — phone numbers, OTP codes, emails, URLs, IDs, code snippets, Latin-digit prices — gets `dir="ltr"` on its own element. Examples in `src/app/login/page.tsx`: the mobile `<input dir="ltr">` and the `<span dir="ltr">{mobile}</span>`.
- Decide deliberately between Persian digits (۱۲۳) and Latin digits (123) per context and stay consistent; input fields that feed a regex/API use Latin digits.

## Typography

- Font stack (`src/app/globals.css`): `Vazirmatn → IRANSans → Tahoma → Segoe UI → sans-serif`. No web font file is bundled yet.
- To ship Vazirmatn: add it via `next/font/local` in `src/app/layout.tsx` and apply the generated class to `<body>` — do not `@import` from a CDN.
- Persian text needs a touch more `line-height` than Latin defaults; keep the existing comfortable spacing.
