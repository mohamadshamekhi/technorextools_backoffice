# Token economy

Default operating mode for this repository. Spend the minimum tokens that still produce correct, complete work. This is about discipline, not cutting corners.

## Context intake
- Read only files the task requires. Reach for `Grep`/`Glob` with specific patterns before opening a file; use `offset`/`limit` on files over ~400 lines.
- Never open generated or vendored paths: `package-lock.json`, `.next/`, `node_modules/`, `next-env.d.ts`, `public/` binaries.
- Never read `../api/postman/*.json` (huge). For API contract use `docs/api/INDEX.md` then one `docs/api/<section>.md` — see `api.md`.
- Batch independent reads and searches into a single tool call. Prefer one precise query over several broad ones.
- Do not re-read a file immediately after writing or editing it — the edit already confirmed its state.
- These `.claude/rules/*` files are load-on-demand. Open one only when the task enters its domain (see the routing table in `CLAUDE.md`). Never bulk-load them.

## Response style
- No preamble ("Sure", "Let me…"), no restating the request, no narration of intended steps.
- Lead with the answer or the result. Add rationale only when it changes what the user should do.
- Never re-summarize or echo back a file you just read or wrote this turn — reference it by `path:line` instead.
- Skip change summaries for diffs under ~5 lines. For larger changes, a 1–3 line summary with `file:line` refs is enough.
- Quote code only when it is being added or changed. Never paste back unchanged context.
- Chat replies may be in English for brevity; **all code comments and UI strings stay Persian** (see `rtl-persian.md`).

## Execution
- Trust the TypeScript compiler / editor for type checks. Do not run `npm run build` to "verify types" — only build when the user asks for a real build or a build error is being diagnosed.
- Run `npm run lint` when you have touched more than a trivial amount of code, or when asked. Don't run it after every micro-edit.
- Do not spawn subagents for single-file or small multi-file changes. Handle those inline.
- Make the change the user asked for and stop. No opportunistic refactors, dependency bumps, or reformatting of untouched lines.
- If a task is ambiguous in a way that changes the outcome, ask one sharp question rather than exploring every branch.
