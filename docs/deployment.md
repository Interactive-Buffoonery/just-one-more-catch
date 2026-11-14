# Deployment

How justonemorecatch.app is set up and deployed.

## Accounts and settings

- **Convex:** project `just-one-more-catch`, with a dev and a production
  deployment.
- **Clerk:** one app with a development and a production instance. Production
  uses `clerk.justonemorecatch.app` and its own Google OAuth client.
- **Cloudflare:** Worker `just-one-more-catch`. The domain's DNS is on
  Cloudflare, including Clerk's records, which must stay "DNS only".
- **Settings in files** (git-ignored, never commit them):
  - `.env.local`: Convex dev values (written by `pnpm exec convex dev`),
    `VITE_CLERK_PUBLISHABLE_KEY` with the `pk_test_` key and the development
    `VITE_TURNSTILE_SITE_KEY`.
  - `.env.production`: `VITE_CLERK_PUBLISHABLE_KEY` with the `pk_live_` key
    and the production `VITE_TURNSTILE_SITE_KEY`.
- **Settings in Convex**, on each deployment: `CLERK_JWT_ISSUER_DOMAIN`,
  `CLERK_SECRET_KEY` (used by the device sign-in and device list actions),
  `RESEND_API_KEY` (a sending-only key for `mail.justonemorecatch.app`),
  `CONTACT_TO` (where contact-form messages are emailed),
  `TURNSTILE_SECRET_KEY` and `TURNSTILE_HOSTNAMES`. Set them with
  `pnpm exec convex env set`, and add `--prod` for production.
- **Email:** Cloudflare Email Routing forwards `contact@justonemorecatch.app`
  to the project inbox. Resend sends the contact-form notifications from
  `notify@mail.justonemorecatch.app` to the same inbox (`CONTACT_TO`).
- Secret keys (Clerk `sk_`, Resend, Turnstile) live only in Convex. Keep them
  out of this repo.

## Turnstile

Guest contact messages, device pairing and guest analytics need a Cloudflare
Turnstile check. Signed-in requests skip it.

- Use a Managed Turnstile widget for `justonemorecatch.app` and a separate
  development widget for local testing.
- Set `TURNSTILE_HOSTNAMES` to the exact hostnames allowed for that
  deployment: `justonemorecatch.app` for production and `localhost` for
  development. Never allow local or test hosts in production.
- `build:prod` rejects missing Turnstile site keys and Cloudflare test keys.

Rate limits are in [contact.md](contact.md) and `convex/contactSpam.ts`.

## Deploy

```sh
pnpm run deploy
```

- Pushes Convex functions to production. Answer **y** when it asks (where it
  can't prompt, add `--yes` to the `convex deploy` command).
- Builds the site with `.env.production`. The script removes development Clerk
  and Turnstile keys first, because `convex deploy` loads `.env.local`, then
  stops the deploy if the build doesn't contain the live (`pk_live_`) key.
- Uploads `dist/` to the Cloudflare Worker with `wrangler deploy`. Run
  `pnpm exec wrangler login` once first.

Before deploying, add a dated entry to `public/whats-new/index.html` for
anything players would notice. Game data fixes get one line per game with its
box art; skip fixes players would not notice. A maintainer approves the
wording before it ships.

After deploying, note the deployed commit SHA, the top line of
`pnpm exec wrangler deployments list` and any merged PRs that are not deployed
yet. If the deploy touched Clerk, `convex/auth.config.ts` or sign-in code, sign
in on https://justonemorecatch.app and make one signed-in change, such as the
theme.
