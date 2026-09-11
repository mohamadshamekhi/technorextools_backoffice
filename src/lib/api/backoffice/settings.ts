import { api } from "../http";

/**
 * تنظیمات سایت — docs/api/backoffice.md § Settings.
 * ذخیره به‌صورت جفت key/value؛ PUT کل مجموعه‌ی entries را جایگزین می‌کند.
 */

export type SettingEntry = {
  key: string;
  value: string;
};

export type PutSettingsInput = {
  entries: SettingEntry[];
};

/** GET /backoffice/settings */
export const list = () => api.get<SettingEntry[]>("/backoffice/settings");

/** PUT /backoffice/settings */
export const put = (input: PutSettingsInput) =>
  api.put<SettingEntry[]>("/backoffice/settings", input);
