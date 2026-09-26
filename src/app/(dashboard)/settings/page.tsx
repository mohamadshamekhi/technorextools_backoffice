import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { settingsApi, guarded } from "@/lib/api";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "تنظیمات" };

export default async function SettingsPage() {
  const entries = await guarded(settingsApi.list());

  return (
    <>
      <PageHeader
        title="تنظیمات"
        description="پیکربندی کلی پنل و وبسایت (جفت‌های کلید/مقدار)"
      />
      <Card title="تنظیمات عمومی">
        <SettingsForm initial={entries} />
      </Card>
    </>
  );
}
