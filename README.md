# Just One More Catch

Track your Pokémon playthroughs and see where to catch what you're missing at
your point in the story. HeartGold and SoulSilver for now.

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

- `client/app.ts`: the whole UI, rendered as strings with event delegation.
- `client/main.ts`: the only file that talks to Clerk or Convex. It hands the
  UI a `Bridge` object.
- `client/styles.ts`: all CSS, including the Clerk sign-in styling.
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

Sprites and badges live in `public/sprites/<pack>/` and `public/badges/`.
A new pack needs an entry in `ART` in `scripts/fetch_sprites.py`, then:

```sh
python3 scripts/fetch_sprites.py   # downloads only missing files
```

## Accounts and settings

- **Convex:** project `just-one-more-catch`. Dev deployment
  `chatty-lyrebird-992`, production `blissful-cod-978`.
- **Clerk:** one app with a development and a production instance. Production
  uses `clerk.justonemorecatch.app` and its own Google OAuth client.
- **Cloudflare:** Worker `just-one-more-catch`. The domain's DNS is on
  Cloudflare, including Clerk's records, which must stay "DNS only".
- **Settings in files** (git-ignored, never commit them):
  - `.env.local`: Convex dev values (written by `npx convex dev`) and
    `VITE_CLERK_PUBLISHABLE_KEY` with the `pk_test_` key.
  - `.env.production`: `VITE_CLERK_PUBLISHABLE_KEY` with the `pk_live_` key.
- **Settings in Convex:** `CLERK_JWT_ISSUER_DOMAIN`, `RESEND_API_KEY` (a
  sending-only key for `mail.justonemorecatch.app`) and `CONTACT_TO` (where
  contact-form messages are emailed) on each deployment. Set them with
  `npx convex env set`, and add `--prod` for production.
- **Email:** Cloudflare Email Routing forwards `contact@justonemorecatch.app`
  to Sarah's inbox. Resend sends the contact-form notifications from
  `notify@mail.justonemorecatch.app`.
- The Clerk secret key isn't used anywhere. Keep it out of this repo.

## Run locally

```sh
npm install
npx convex dev        # back end; keep it running
npm run dev           # site on http://localhost:5173
```

In development, Clerk accepts test emails like `name+clerk_test@example.com`
with the code `424242`.

## Deploy

```sh
npm run deploy
```

- Pushes Convex functions to production. Answer **y** when it asks (where it
  can't prompt, add `--yes` to the `convex deploy` command).
- Builds the site with `.env.production`. The script removes the dev Clerk key
  first, because `convex deploy` loads `.env.local`.
- Uploads `dist/` to the Cloudflare Worker with `wrangler deploy`. Run
  `npx wrangler login` once first.
