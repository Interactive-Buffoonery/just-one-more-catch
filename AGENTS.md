# Just One More Catch

- Back end: Convex functions in `convex/`. Auth comes from Clerk via `ctx.auth.getUserIdentity()`; own data by `tokenIdentifier`.
- Front end: plain TypeScript in `client/`, built with Vite. No framework; `client/app.ts` renders strings and uses event delegation.
- `client/main.ts` is the only file that talks to Clerk or Convex. Keep the `Bridge` type in `client/app.ts` as the boundary.
- `shared/` is pure TypeScript used by both sides.
- Hosting: a static Cloudflare Worker (`wrangler.jsonc`, `npm run deploy`). Keep the site static. See README.md for the full setup.
- Guest playthroughs live in localStorage and move to the account on sign-in. Keep guest mode working when Clerk fails to load.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
