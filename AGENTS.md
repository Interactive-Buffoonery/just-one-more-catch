# Just One More Catch

- Back end: Convex functions in `convex/`. Auth comes from Clerk via `ctx.auth.getUserIdentity()`; own data by `tokenIdentifier`.
- Front end: plain TypeScript in `client/`, built with Vite. No framework; `client/app.ts` renders strings and uses event delegation.
- `client/main.ts` is the only file that talks to Clerk or Convex. Keep the `Bridge` type in `client/app.ts` as the boundary.
- `shared/` is pure TypeScript used by both sides.
- Hosting: Cloudflare Pages (`npm run deploy`). Keep the site static.
- Guest playthroughs live in localStorage and move to the account on sign-in. Keep guest mode working when Clerk fails to load.
