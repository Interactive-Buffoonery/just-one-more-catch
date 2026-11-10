# Just One More Catch

Track your Pokémon playthroughs and see where to catch what you're missing at
your point in the story. HeartGold and SoulSilver for now.

- `convex/`: playthroughs (one JSON state each), contact messages, account deletion.
- `client/app.ts`: the whole UI, string-rendered with event delegation.
- `client/main.ts`: Clerk sign-in and Convex calls, handed to the UI through the bridge.
- `client/data/hgss.ts`: generated encounter data. Rebuild with:

```sh
python3 scripts/fetch_pokeapi.py   # one-time cache into .cache/pokeapi
python3 scripts/build_data.py
```

## Run locally

```sh
npm install
npx convex dev        # backend; first run links the Convex project
npm run dev           # site on http://localhost:5173
```

`.env.local` needs `VITE_CLERK_PUBLISHABLE_KEY` (Clerk development key).
Convex needs `CLERK_JWT_ISSUER_DOMAIN` (`npx convex env set ...`).

## Deploy

```sh
npm run deploy
```

Pushes Convex functions to production, builds with `.env.production`
(`VITE_CLERK_PUBLISHABLE_KEY` live key), and uploads `dist/` to the
`just-one-more-catch` Cloudflare Pages project, served at
https://justonemorecatch.app.
