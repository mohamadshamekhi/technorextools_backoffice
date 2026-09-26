"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

/**
 * جستجوی سروری: مقدار را با تأخیر روی پارامتر `search` می‌نویسد و `skip` را صفر می‌کند.
 * صفحه‌ی سرور با خواندن searchParams دوباره fetch می‌کند.
 */

export function SearchField({
  placeholder = "جستجو…",
  paramName = "search",
}: {
  placeholder?: string;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get(paramName) ?? "");
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (value.trim()) next.set(paramName, value.trim());
      else next.delete(paramName);
      next.delete("skip");
      startTransition(() => {
        router.replace(next.toString() ? `${pathname}?${next}` : pathname);
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border bg-surface py-2 pe-9 ps-3 text-sm outline-none focus:border-primary"
      />
      {isPending && (
        <Loader2 className="absolute end-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted" />
      )}
    </div>
  );
}
