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
- `client/data/hgss.ts`: generated encounter data. Rebuild with:

```sh
python3 scripts/fetch_pokeapi.py   # one-time cache into .cache/pokeapi
python3 scripts/build_data.py
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
- **Settings in Convex:** `CLERK_JWT_ISSUER_DOMAIN` on each deployment (set
  with `npx convex env set`, add `--prod` for production).
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

- Pushes Convex functions to production. Answer **y** when it asks.
- Builds the site with `.env.production`. The script removes the dev Clerk key
  first, because `convex deploy` loads `.env.local`.
- Uploads `dist/` to the Cloudflare Worker with `wrangler deploy`. Run
  `npx wrangler login` once first.
