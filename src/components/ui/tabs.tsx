"use client";

import { useState, type ReactNode } from "react";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

/**
 * تب‌های ساده برای تقسیم یک صفحه‌ی شلوغ (مثلاً فرم محصول) به بخش‌های جداگانه.
 * پنل‌ها با `hidden` مخفی می‌شوند نه حذف — state هر تب حین جابه‌جایی از بین نمی‌رود.
 */
export function Tabs({ tabs, defaultTab }: { tabs: TabItem[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      <div role="tablist" className="-mx-5 flex gap-1 overflow-x-auto border-b px-5">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" hidden={active !== tab.id} className="pt-5">
          {tab.content}
        </div>
      ))}
    </div>
  );
}
