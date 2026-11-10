# Just One More Catch

Track your Pokémon runs and see where to catch what you're missing at your
point in the story. HeartGold and SoulSilver for now.

- `server/index.ts`: runs (one JSON state per run), contact messages, account deletion.
- `client/app.ts`: the whole UI, string-rendered with event delegation.
- `pages/index.tsx`: mounts the UI and bridges auth, queries and mutations.
- `client/data/hgss.ts`: generated encounter data. Rebuild with:

```sh
python3 scripts/fetch_pokeapi.py   # one-time cache into .cache/pokeapi
python3 scripts/build_data.py
```

Run locally with `sf dev`, deploy with `sf publish`.
