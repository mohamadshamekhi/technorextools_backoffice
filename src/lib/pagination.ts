/** ابزار خواندن پارامترهای صفحه‌بندی از searchParams صفحات لیستی */

export const DEFAULT_TAKE = 20;

export type PageParams = { skip: number; take: number };

export function parsePageParams(
  input: { skip?: string | string[]; take?: string | string[] } = {},
): PageParams {
  const skip = toInt(input.skip, 0);
  const take = clamp(toInt(input.take, DEFAULT_TAKE), 1, 100);
  return { skip: Math.max(0, skip), take };
}

function toInt(value: string | string[] | undefined, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
