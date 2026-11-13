# Just One More Catch

What can I catch right now? A tracker for retro Pokémon playthroughs, from Game
Boy to 3DS.

Live at https://justonemorecatch.app

## How it fits together

- **Site:** plain TypeScript built with Vite. No framework. Hosted on
  Cloudflare as a static Worker (`wrangler.jsonc`), on the custom domain
  justonemorecatch.app.
- **Back end:** Convex stores playthroughs (one JSON state each) and contact
  messages, and handles account deletion.
- **Sign-in:** Clerk, with Google, email codes or a password. The sign-in form is Clerk's
  own UI (`@clerk/ui`), styled to match the app.
- **Guests:** playthroughs live in the browser until someone signs in, then
  move to their account. The site still works as a guest if Clerk fails to
  load.

## Where things live

- `client/app.ts`: wiring. Renders the current view, handles every click
  (event delegation on `data-*` attributes), saves, and syncs with the bridge.
- `client/main.ts`: the only file that talks to Clerk or Convex. It hands the
  UI a `Bridge` object (`client/types.ts`).
- `client/game.ts`: the open playthrough and the rules about what can be
  caught where and when. No DOM.
- `client/views/`: one file per screen, each returning an HTML string.
  `client/parts.ts` holds the pieces they share.
- `client/guest.ts`: guest playthroughs in localStorage and their move to an
  account. `client/export.ts`: the JSON and CSV downloads.
- `client/styles.css`: all CSS, including the Clerk sign-in styling.
- `public/sw.js` and `public/manifest.webmanifest`: the installable app. The
  service worker keeps the app page and static files for offline use; rename
  its `CACHE` to clear what browsers have stored.
- `convex/`: back-end functions, schema and `auth.config.ts`.
- `shared/`: TypeScript used by both sides.
- `client/packs.ts`: one pack per game (badges, items, dex sizes, boxes),
  plus the list of versions. A pack's encounter data loads only when one of
  its playthroughs is opened.
- `client/data/<pack>.ts`: generated encounter data, built from
  `data/<pack>.json`. Rebuild with:

```sh
python3 scripts/fetch_pokeapi.py   # one-time cache into .cache/pokeapi
python3 scripts/build_data.py hgss
python3 scripts/build_data.py crystal
python3 scripts/build_data.py frlg
```

Sprites, badges and item icons live in `public/sprites/<pack>/`,
`public/badges/` and `public/items/`.
A new pack needs an entry in `ART` in `scripts/fetch_sprites.py`, then:

```sh
python3 scripts/fetch_sprites.py   # downloads only missing files
```

Story gates (chapters, story steps, HM badge rules) are written by hand and
must be sourced. Start with [the game-addition checklist](docs/adding-games.md)
and `.agents/skills/add-game/SKILL.md` before adding or changing a pack.

## Accounts and settings

- **Convex:** project `just-one-more-catch`. Dev deployment
  `chatty-lyrebird-992`, production `blissful-cod-978`.
- **Clerk:** one app with a development and a production instance. Production
  uses `clerk.justonemorecatch.app` and its own Google OAuth client.
- **Cloudflare:** Worker `just-one-more-catch`. The domain's DNS is on
  Cloudflare, including Clerk's records, which must stay "DNS only".
- **Settings in files** (git-ignored, never commit them):
  - `.env.local`: Convex dev values (written by `pnpm exec convex dev`) and
    `VITE_CLERK_PUBLISHABLE_KEY` with the `pk_test_` key.
  - `.env.production`: `VITE_CLERK_PUBLISHABLE_KEY` with the `pk_live_` key.
- **Settings in Convex:** `CLERK_JWT_ISSUER_DOMAIN`, `CLERK_SECRET_KEY`
  (used by the device sign-in and device list actions), `RESEND_API_KEY` (a
  sending-only key for `mail.justonemorecatch.app`) and `CONTACT_TO` (where
  contact-form messages are emailed) on each deployment. Set them with
  `pnpm exec convex env set`, and add `--prod` for production.
- **Email:** Cloudflare Email Routing forwards `contact@justonemorecatch.app`
  to `justonemorecatch@gmail.com`. Resend sends the contact-form
  notifications from `notify@mail.justonemorecatch.app` to the same inbox
  (`CONTACT_TO`).
- The Clerk secret key lives only in Convex, on dev (`sk_test_`) and prod
  (`sk_live_`). Keep it out of this repo.

## Run locally

```sh
pnpm install
pnpm exec convex dev  # back end; keep it running
pnpm dev              # site on http://localhost:5173
```

New worktrees: `scripts/setup-worktree.sh` copies `.env.local` and
`.env.production` from the main checkout and installs dependencies. A git
hook runs it on `git worktree add` once you turn hooks on in the main
checkout: `git config core.hooksPath "$PWD/.githooks"`. Setup runs the
branch's install scripts, so for a branch you don't trust, use
`git worktree add --no-checkout` to skip the hook and review it before
installing.

In development, Clerk accepts test emails like `name+clerk_test@example.com`
with the code `424242`.

## Save imports

See [the save-import guide](docs/save-import.md) for the browser reader, release
assets, testing and how to add official games or ROM hacks.

## Deploy

```sh
pnpm run deploy
```

- Pushes Convex functions to production. Answer **y** when it asks (where it
  can't prompt, add `--yes` to the `convex deploy` command).
- Builds the site with `.env.production`. The script removes the dev Clerk key
  first, because `convex deploy` loads `.env.local`, then stops the deploy if
  the build doesn't contain the live (`pk_live_`) key.
- Uploads `dist/` to the Cloudflare Worker with `wrangler deploy`. Run
  `pnpm exec wrangler login` once first.

## Analytics

Browser event counts are approximate: verified visitors can still forge events.
Telemetry has a daily cap of 100 events per account or verified browser visitor,
with a burst limit of 10 per minute for each.
Contact counts are recorded only when a message is accepted. Raw event records
expire after 90 days; an hourly job removes expired records in batches of 100.
The stats report uses the same 90-day window. Rate-limit keys and their component
records are removed hourly after two days without activity, longer than any of
these quota windows.

## Anonymous write protection

Guest contact submissions, device pairing starts and anonymous analytics
writes require Cloudflare Turnstile. The browser loads the widget only when one of these actions starts.
The backend verifies each single-use token with Cloudflare and checks its
hostname, action and visitor value before an internal mutation writes data.
Missing configuration or failed verification rejects the request. Signed-in
requests use the verified Clerk account and do not need Turnstile.

Before releasing these changes:

- Create a Managed Turnstile widget for `justonemorecatch.app`, and a separate
  development widget for local testing.
- Add the public `VITE_TURNSTILE_SITE_KEY` to the matching `.env.production` or
  `.env.local` build settings.
- Set `TURNSTILE_SECRET_KEY` in the matching Convex deployment. Keep it out of
  frontend environment variables and source control.
- Set `TURNSTILE_HOSTNAMES` in Convex to the comma-separated exact hostnames
  allowed for that deployment: `justonemorecatch.app` for production and
  `localhost` for local development. Never allow local/test hosts in production.
- `build:prod` rejects missing Turnstile site keys and Cloudflare test keys.
- Release frontend and backend together, then verify guest contact, pairing and analytics
  with real Turnstile tokens. Existing tabs need to reload because these public
  functions changed from mutations to actions.

Contact allows two messages immediately, then replenishes three per hour per
account or verified browser visitor. Pairing allows 20 starts immediately,
then replenishes 60 per minute per account or verified browser visitor.
These callers have separate allowances. Browser visitor values are random and
persisted locally; they are not a person or device identity. Clearing storage
can rotate the value, but each anonymous write still needs a fresh successful
Turnstile check. Anonymous analytics remains approximate and rate limited. Failed analytics
verification drops the event without blocking guest play.
