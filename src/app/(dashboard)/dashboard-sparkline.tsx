/**
 * نمودار خطی کوچک درآمد روزانه (SVG خالص، بدون کتابخانه).
 * جهت زمان راست‌به‌چپ است: قدیمی‌ترین روز سمت راست.
 */
export function DashboardSparkline({
  points,
}: {
  points: { date: string; revenue: number }[];
}) {
  if (points.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        داده‌ی کافی برای رسم نمودار نیست.
      </p>
    );
  }

  const w = 100;
  const h = 36;
  const values = points.map((p) => p.revenue);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;

  // ایندکس ۰ (قدیمی‌ترین) در x=100، آخرین روز در x=0 → جریان راست‌به‌چپ
  const coords = points.map((p, i) => {
    const x = w - (i / (points.length - 1)) * w;
    const y = h - ((p.revenue - min) / span) * (h - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const line = `M ${coords.join(" L ")}`;
  const area = `${line} L 0,${h} L ${w},${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-24 w-full"
      role="img"
      aria-label="روند درآمد ۳۰ روز اخیر"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
