# Just One More Catch

- Convex back end in `convex/`. Clerk auth through `ctx.auth.getUserIdentity()`; own data by `tokenIdentifier`.
- Plain TypeScript front end in `client/` (Vite, no framework). `client/views/` render strings and `client/app.ts` wires up events. Only `client/main.ts` talks to Clerk or Convex, through the `Bridge` type in `client/types.ts`. `shared/` is pure TypeScript used by both.
- The site stays static (a Cloudflare Worker). Guest mode must keep working when Clerk fails to load.
- Run `pnpm check` before finishing, and `pnpm check && git push` to push. For CSS changes, also run `pnpm check:styles` and make sure every difference is one you meant.
- Game data: never write gates, times, locations or story steps from memory. Cite every hand-written row in `sources/<pack>.md`, or add it to that file's Open questions. Bulbapedia blocks scripts, so use the `read-guide`, `audit-access` and `add-game` skills.
- Before mocking up a UI change, screenshot the live page at 390px and desktop widths.
- Deploying: follow [docs/deployment.md](docs/deployment.md).

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
