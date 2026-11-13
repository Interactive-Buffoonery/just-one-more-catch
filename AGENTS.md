# Just One More Catch

- Back end: Convex functions in `convex/`. Auth comes from Clerk via `ctx.auth.getUserIdentity()`; own data by `tokenIdentifier`.
- Front end: plain TypeScript in `client/`, built with Vite. No framework; `client/views/` render strings and `client/app.ts` wires them up with event delegation.
- `client/main.ts` is the only file that talks to Clerk or Convex. Keep the `Bridge` type in `client/types.ts` as the boundary.
- Run `pnpm check` (types plus the `scripts/check_*` checks) before finishing.
- Push only after `pnpm check` passes. Chain them with `&&` (`pnpm check && git push`), never `;`.
- For CSS changes, also run `pnpm check:styles`. It compares computed styles against `origin/main`; any difference should be one you meant to make.
- `shared/` is pure TypeScript used by both sides.
- Hosting: a static Cloudflare Worker (`wrangler.jsonc`, `pnpm run deploy`). Keep the site static. See README.md for the full setup.
- Guest playthroughs live in localStorage and move to the account on sign-in. Keep guest mode working when Clerk fails to load.
- Game data: never write gates, times, locations or story steps from memory. Every hand-written row needs a source listed in SOURCES.md; if the sources don't settle it, add it to OPEN_QUESTIONS.md instead. Use the `add-game`, `audit-access` and `read-guide` skills.
- Bulbapedia blocks automated fetches. Use the `read-guide` skill or Serebii instead, and list anything left unverified in your report.
- Before mocking up a UI change, screenshot the live page at 390px and desktop widths and build the mockup from those screenshots.
- Before `pnpm run deploy`, add a dated entry to public/whats-new/index.html for anything players would notice. Game data fixes get one line per game with its box art; skip fixes players would not notice.
- Deploys are manual. After `pnpm run deploy`, report the deployed commit SHA and the top line of `pnpm exec wrangler deployments list`, and name any merged PRs that are not deployed yet.
- After a deploy that touches Clerk, `convex/auth.config.ts` or sign-in code, sign in on https://justonemorecatch.app and make one signed-in change, such as the theme, before reporting done.
- Save fixtures need .NET 10. Install it per user with Microsoft's `dotnet-install.sh --channel 10.0` (into `~/.dotnet`), not the Homebrew cask, which stops at a password prompt.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
