# Workflow & version control

## Branching

- `main` is the integration branch. Never commit directly to it — branch first.
- Branch names: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `refactor/<slug>`.

## Commits

- Conventional Commits: `type(scope): summary` — types `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`.
- Summary in imperative mood, English, ≤ 72 chars. Body (optional) explains *why*, wrapped at 72.
- One logical change per commit. Don't mix a refactor with a feature.
- Only commit or push when the user asks.
- End commit messages created from Claude Code with:
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`

## Pull requests

- Title follows the same Conventional Commits format.
- Description: what changed, why, how to test, screenshots for UI (both RTL rendering and mobile viewport).
- Must pass `npm run lint` and `npm run build`.
- End PR descriptions created from Claude Code with:
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

## Definition of done

Full checklist and bug-fix/design/security scope: `quality-gates.md`. Run this once, when the task or PR is actually wrapping up — not after each edit (`token-economy.md`).

- [ ] `npm run lint` clean, no new warnings
- [ ] `npm run build` succeeds
- [ ] Persian strings + Persian comments; RTL verified visually
- [ ] Mobile (`< lg`) and desktop layouts both checked
- [ ] `loading.tsx` / `error.tsx` added where the route does async work
- [ ] No `console.log`, dead code, unused imports, or hard-coded colors/strings
- [ ] New nav pages wired into `src/lib/navigation.ts`
- [ ] If the Postman collection changed: `npm run gen:api` run and `docs/api/` diff reviewed
- [ ] If a structural change was made (new pattern, new domain, new convention): one line appended to `cloud.md` in the same turn

## Pre-existing repo hygiene

- `.gitignore`, `next.config.ts`, and tooling config are committed; `.next/` and `node_modules/` are not.
- Do not commit `.env*` files. Reference required env vars in `README.md` instead.
