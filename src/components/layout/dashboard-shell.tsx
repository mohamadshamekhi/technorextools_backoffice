"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  LogOut,
  PanelsTopLeft,
  Loader2,
} from "lucide-react";
import { navItems, type NavItem } from "@/lib/navigation";
import { logoutAction } from "@/lib/auth-actions";
import type { SessionUser } from "@/lib/api/auth";

/** حروف اول نام برای آواتار — حداکثر دو حرف */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] ?? "") + (parts[1][0] ?? "");
}

function isItemActive(item: NavItem, pathname: string): boolean {
  return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
}

/** آیتم‌های هم‌بخش (پشت‌سرهم با `section` یکسان) را زیر یک گروه جمع می‌کند. */
function groupBySection(
  items: NavItem[]
): { section: string; items: NavItem[] }[] {
  const groups: { section: string; items: NavItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.section === item.section) last.items.push(item);
    else groups.push({ section: item.section, items: [item] });
  }
  return groups;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = useMemo(() => groupBySection(navItems), []);
  const activeSection = navItems.find((item) =>
    isItemActive(item, pathname)
  )?.section;
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(activeSection ? [activeSection] : [])
  );
  // با ناوبری به بخش جدید، همان بخش را باز نگه‌دار (بدون بستن بخش‌هایی که کاربر خودش باز کرده).
  // طبق الگوی توصیه‌شده‌ی React برای «هم‌گام‌سازی state با تغییر یک مقدار حین رندر»، نه useEffect.
  const [trackedSection, setTrackedSection] = useState(activeSection);
  if (activeSection !== trackedSection) {
    setTrackedSection(activeSection);
    if (activeSection && !openSections.has(activeSection)) {
      setOpenSections(new Set(openSections).add(activeSection));
    }
  }

  function toggleSection(section: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive
        ? "bg-primary-surface font-medium text-primary"
        : "text-muted hover:bg-surface-muted hover:text-foreground"
    }`;

  return (
    <div className="flex h-full flex-col bg-surface text-foreground">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <PanelsTopLeft className="size-5" />
        </span>
        <span className="text-[15px] font-bold leading-tight">پنل مدیریت</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {groups.map((group) => {
          // بخش تک‌آیتمی (مثل «اصلی») به‌صورت لینک ساده نمایش داده می‌شود، نه آکاردئون
          if (group.items.length === 1) {
            const item = group.items[0];
            const isActive = isItemActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={linkClass(isActive)}
              >
                <item.icon className="size-[18px] shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          }

          const isOpen = openSections.has(group.section);
          const hasActiveChild = group.items.some((item) =>
            isItemActive(item, pathname)
          );
          const HeaderIcon = group.items[0].icon;

          return (
            <div key={group.section}>
              <button
                type="button"
                onClick={() => toggleSection(group.section)}
                aria-expanded={isOpen}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  hasActiveChild
                    ? "font-medium text-primary"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <HeaderIcon className="size-[18px] shrink-0" />

                <span className="flex-1 truncate text-start">
                  {group.section}
                </span>
                <ChevronDown
                  className={`size-4 shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-0.5 space-y-0.5 ps-7">
                  {group.items.map((item) => {
                    const isActive = isItemActive(item, pathname);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={isActive ? "page" : undefined}
                        className={linkClass(isActive)}
                      >
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  /** خروج: باطل کردن سشن سمت سرور و بازگشت به لاگین (ریدایرکت داخل اکشن) */
  function handleLogout() {
    startTransition(() => {
      void logoutAction();
    });
  }

  // بستن کشوی موبایل با کلید Escape
  useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen">
      {/* سایدبار دسکتاپ */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-l bg-surface lg:block xl:w-72">
        <SidebarContent />
      </aside>

      {/* سایدبار موبایل */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          mobileOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 right-0 w-72 bg-surface shadow-2xl transition-transform duration-200 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* هدر */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-md lg:px-8">
          <button
            className="rounded-lg p-2 text-muted hover:bg-border/50 hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="باز کردن منو"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2.5 rounded-full border py-1 pe-3 ps-1">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary-surface text-sm font-bold text-primary">
              {initials(user.fullName ?? user.mobile)}
            </span>
            <span className="hidden text-sm font-medium sm:inline">
              {user.fullName ?? user.mobile}
            </span>
          </div>

          <button
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-danger-surface hover:text-danger disabled:opacity-50"
            onClick={handleLogout}
            disabled={isPending}
            aria-label="خروج"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <LogOut className="size-5" />
            )}
            <span className="hidden sm:inline">خروج</span>
          </button>
        </header>

        {/* محتوای صفحه */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
