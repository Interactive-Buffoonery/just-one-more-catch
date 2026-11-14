# Just One More Catch

_What can I catch right now?_

Just One More Catch is a tracker for Pokémon playthroughs. Our current focus is
retro Pokémon games, from the original Game Boy games through 3DS, plus the two
Switch LeafGreen and FireRed re-releases. Eventually we hope to add newer
Pokémon games and maybe even some of the more popular or unique ROM hacks. If
you'd like us to add another game, you can
[open an issue here](https://github.com/Interactive-Buffoonery/just-one-more-catch/issues/new).

This repository is the source code for https://justonemorecatch.app.

Pokémon artwork belongs to Nintendo, Creatures and GAME FREAK and we make
absolutely no claim to this artwork. Please see [NOTICE](NOTICE) for our full
disclaimer.

## How the site backend works

- **Site:** plain TypeScript built with Vite. No framework. Hosted on
  Cloudflare as a static Worker (`wrangler.jsonc`), with the custom domain
  justonemorecatch.app.
- **Back end:** Convex stores playthroughs (one JSON state each) and contact
  messages, and handles account deletion.
- **Sign-in:** Clerk, with Google, email codes or a password. The sign-in form is Clerk's
  own UI (`@clerk/ui`), styled to match the app.
- **Guests:** playthroughs live in the browser until someone signs in, then
  move to their account.

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

## Run locally

You need Node 22.18 or later, pnpm and Python 3. To run this as written,
you'll also need to set up a local Convex development instance.

```sh
pnpm install
pnpm exec convex dev --once   # log in and create a free dev deployment
pnpm exec convex env set CLERK_JWT_ISSUER_DOMAIN https://example.clerk.accounts.dev
pnpm exec convex dev          # keep it running
pnpm dev                      # in a second terminal: http://localhost:5173
```

The first `convex dev --once` creates the deployment and writes
`VITE_CONVEX_URL` to `.env.local`, then stops because the Clerk setting is
missing. The placeholder lets it deploy without a Clerk account.

Sign-in is optional. Without a Clerk key the site runs in guest mode and
playthroughs stay in the browser. To try sign-in, create a Clerk development
instance, add `VITE_CLERK_PUBLISHABLE_KEY` to `.env.local`, and replace the
placeholder: set `CLERK_JWT_ISSUER_DOMAIN` and `CLERK_SECRET_KEY` with
`pnpm exec convex env set`. In development, Clerk accepts test emails like
`name+clerk_test@example.com` with the code `424242`.

As a guest, the contact form and device pairing also need Cloudflare
Turnstile keys (see [Turnstile](docs/deployment.md#turnstile)).
Without them, both show "Verification unavailable". Everything else works.

Run `pnpm check` before opening a pull request. For CSS changes, also run
`pnpm check:styles`.

New worktrees: `scripts/setup-worktree.sh` copies `.env.local` from the main
checkout, links `.env.production` to it, and installs dependencies. A git
hook runs it on `git worktree add` once you turn hooks on in the main
checkout: `git config core.hooksPath "$PWD/.githooks"`. Setup runs the
branch's install scripts, so for a branch you don't trust, use
`git worktree add --no-checkout` to skip the hook and review it before
installing.

## Save imports

See [the save-import guide](docs/save-import.md) for the browser reader, release
assets, testing and how to add official games or ROM hacks.

## Running the live site

Accounts, settings and deploy steps for justonemorecatch.app are in
[docs/deployment.md](docs/deployment.md).

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
