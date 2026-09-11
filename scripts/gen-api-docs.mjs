/**
 * تولید مرجع فشرده‌ی API از کالکشن Postman.
 *
 *   node scripts/gen-api-docs.mjs
 *
 * ورودی:  ../api/postman/abzar-api.postman_collection.json  (بیرون از این ریپو)
 * خروجی:  docs/api/INDEX.md  +  docs/api/<section>.md
 *
 * هدف: به‌جای خواندن کل JSON (~۳۵هزار توکن)، Claude فقط INDEX کوچک و
 * سپس فایل بخش مربوطه را می‌خواند.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "../api/postman/abzar-api.postman_collection.json");
const ENV = resolve(root, "../api/postman/abzar-api.postman_environment.json");
const OUT = resolve(root, "docs/api");

const col = JSON.parse(readFileSync(SRC, "utf8"));
const env = JSON.parse(readFileSync(ENV, "utf8"));

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** برگ‌های یک شاخه را با مسیر گروه‌ها برمی‌گرداند */
function leaves(items, trail = []) {
  const out = [];
  for (const it of items) {
    if (it.item) out.push(...leaves(it.item, [...trail, it.name]));
    else out.push({ trail, ...it });
  }
  return out;
}

function urlOf(req) {
  const u = req?.url;
  if (!u) return "";
  const raw = typeof u === "string" ? u : u.raw || "";
  return raw.replace("{{apiBase}}", "");
}

function queryOf(req) {
  const u = req?.url;
  if (!u || typeof u === "string" || !Array.isArray(u.query)) return [];
  return u.query
    .filter((q) => !q.disabled)
    .map((q) => `${q.key}=${q.value ?? ""}${q.description ? ` — ${q.description}` : ""}`);
}

function authOf(req) {
  const t = req?.auth?.type;
  if (t === "noauth") return "none";
  if (t === "bearer") {
    const tok = req.auth.bearer?.[0]?.value || "";
    return `Bearer ${tok}`;
  }
  const h = (req?.header || []).find((x) => x.key?.toLowerCase() === "authorization");
  return h ? h.value : "(inherits collection default: Bearer {{accessToken}})";
}

const groups = new Map();
for (const lf of leaves(col.item)) {
  const section = lf.trail[0] || "Misc";
  const sub = lf.trail.slice(1).join(" / ");
  if (!groups.has(section)) groups.set(section, []);
  groups.get(section).push({ ...lf, sub });
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// INDEX
const idx = ["# API index", "", "همه‌ی endpointها. جزئیات هر بخش در فایل هم‌نام.", ""];
for (const [section, eps] of groups) {
  idx.push(`## ${section} — \`${slug(section)}.md\` (${eps.length})`, "");
  for (const ep of eps) {
    const r = ep.request || {};
    idx.push(`- \`${r.method} ${urlOf(r)}\` — ${ep.name}`);
  }
  idx.push("");
}
writeFileSync(resolve(OUT, "INDEX.md"), idx.join("\n"));

// per-section
for (const [section, eps] of groups) {
  const md = [`# ${section} API`, ""];
  let lastSub = null;
  for (const ep of eps) {
    const r = ep.request || {};
    if (ep.sub && ep.sub !== lastSub) {
      md.push(`## ${ep.sub}`, "");
      lastSub = ep.sub;
    }
    md.push(`### ${r.method} ${urlOf(r)}`, "");
    md.push(`**${ep.name}**`, "");
    if (r.description) md.push(r.description.trim(), "");
    md.push(`- auth: ${authOf(r)}`);
    const q = queryOf(r);
    if (q.length) md.push(`- query:`, ...q.map((x) => `  - \`${x}\``));
    const body = r.body?.mode === "raw" ? r.body.raw?.trim() : null;
    if (body) md.push("", "```json", body, "```");
    md.push("");
  }
  writeFileSync(resolve(OUT, `${slug(section)}.md`), md.join("\n"));
}

// README with env vars
const envLines = (env.values || [])
  .filter((v) => v.enabled !== false)
  .map((v) => `- \`{{${v.key}}}\`${v.value ? ` = \`${v.value}\`` : ""}`);
writeFileSync(
  resolve(OUT, "README.md"),
  [
    "# API reference (generated)",
    "",
    "منبع: `../api/postman/abzar-api.postman_collection.json` — **این فایل‌ها را دستی ویرایش نکنید.**",
    "",
    "بازتولید:",
    "",
    "```bash",
    "node scripts/gen-api-docs.mjs",
    "```",
    "",
    `تعداد endpointها: ${[...groups.values()].reduce((a, b) => a + b.length, 0)}`,
    "",
    "## Base URLs",
    "",
    "- `baseUrl` = `http://localhost:4000`",
    "- `apiBase` = `http://localhost:4000/api/v1` (همه‌ی مسیرها در INDEX نسبت به این‌اند)",
    "",
    "## متغیرهای محیطی Postman",
    "",
    ...envLines,
    "",
  ].join("\n")
);

console.log(`OK → ${OUT} (${[...groups.keys()].join(", ")})`);
