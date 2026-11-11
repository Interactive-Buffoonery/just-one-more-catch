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
must be sourced. See `.claude/skills/add-game/SKILL.md` before adding or
changing a pack.

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
- **Settings in Convex:** `CLERK_JWT_ISSUER_DOMAIN`, `RESEND_API_KEY` (a
  sending-only key for `mail.justonemorecatch.app`) and `CONTACT_TO` (where
  contact-form messages are emailed) on each deployment. Set them with
  `pnpm exec convex env set`, and add `--prod` for production.
- **Email:** Cloudflare Email Routing forwards `contact@justonemorecatch.app`
  to Sarah's inbox. Resend sends the contact-form notifications from
  `notify@mail.justonemorecatch.app`.
- The Clerk secret key isn't used anywhere. Keep it out of this repo.

## Run locally

```sh
pnpm install
pnpm exec convex dev  # back end; keep it running
pnpm dev              # site on http://localhost:5173
```

New worktrees: run `scripts/setup-worktree.sh`. It copies `.env.local` and
`.env.production` from the main checkout and installs dependencies. T3 Code
runs it automatically when it creates a worktree.

In development, Clerk accepts test emails like `name+clerk_test@example.com`
with the code `424242`.

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
