# Access audit brief

You are auditing a Pokémon catch-tracker app ("Just One More Catch") for one
kind of bug: the app says a Pokémon can be caught in an area, but the player
can't physically reach that area (or that part of it) yet. A tester found one:
Natu at "Ruins Of Alph Outside" is listed as catchable at the start of the game,
but its grass may be behind water or rocks.

Repo: the path given in your task.
This is READ-ONLY research. Do not edit any repo file. Write only your output file.

## Your input

Your chunk file (path in your task) is a JSON list. Each entry is one PokeAPI
encounter area for one game pack:

- `pack`: crystal (Pokémon Crystal), hgss (HeartGold/SoulSilver) or frlg (FireRed/LeafGreen)
- `area`: the area name the app uses
- `chapter`: the story chapter the app puts it in, and what that chapter already requires
- `page` / `wiki`: the Bulbapedia page for it, saved locally as wikitext (relative to the repo).
  Several areas share a page. Pages cover several games: read only the parts about your entry's game.
- `species`: what the app lists there, as "Name (method)"
- `area_needs`: what the app already requires for the whole area, on top of the chapter
- `row_needs`: per-Pokémon requirements already in the app

## What to decide, per entry

Can a player who has just met the chapter's requirements reach every
encounter listed for this area? Things that already count and must NOT be
reported:
- The chapter's own needs.
- Encounter methods: surf encounters already require Surf, fishing requires the rod,
  headbutt requires Headbutt, rock-smash requires Rock Smash. Only report Surf etc. when
  the player must use it to GET TO the spot (grass across water, a floor behind a waterfall).
- `area_needs` and `row_needs` already listed.
- A badge that only exists to let an HM be used outside battle. The app
  adds that badge to every HM need (`hm` in client/packs.ts), so "needs Surf
  and the Fog Badge" is just `surf`.
- Anything the chapter's needs already imply. A later chapter has every badge
  before it, so Cut in Johto-pack Kanto (Hive Badge) is already open.

Report an extra requirement when the page shows the area, a floor, or the part
with that grass/water is behind: water (surf), a whirlpool, a waterfall, a
breakable rock (rock-smash), a boulder (strength), a story event, or a badge.

Allowed need values for each pack (use these exact strings):
- Badges: Zephyr, Hive, Plain, Fog, Storm, Mineral, Glacier, Rising (Johto);
  Boulder, Cascade, Thunder, Rainbow, Soul, Marsh, Volcano, Earth (Kanto); "Elite Four".
- crystal / hgss kit: old-rod, headbutt, rock-smash, surf, strength, good-rod, whirlpool, waterfall, super-rod
- frlg kit: old-rod, good-rod, surf, strength, rock-smash, super-rod, waterfall
- Events: the ids listed in the repo's data/<pack>.json under "events" (read that file).
If the blocker is something not in these lists (Cut, Flash, Rock Climb, an item
or event the app doesn't model), still report it with `needs` naming it in plain
words and set `unmodeled: true`.

## Output

Write a JSON array to your output file, one object per input entry, same order:

```json
{
  "pack": "hgss",
  "area": "Ruins Of Alph Outside",
  "verdict": "ok" | "gate" | "chapter" | "unclear",
  "needs": ["surf"],
  "species": null,
  "quote": "exact text copied from the wiki file",
  "inferred": false,
  "unmodeled": false,
  "note": "one plain sentence"
}
```

- `ok`: nothing extra is needed. `needs` empty, quote may be empty.
- `gate`: extra needs. `species`: null if the whole area is blocked, else the list of
  species names (as in input, without the method) that are behind the blocker.
- `chapter`: the chapter itself looks wrong (reachable earlier or only later). Explain in `note`.
- `unclear`: the page doesn't say where the encounters are or how to reach them, but there's
  reason for doubt. Explain what a tester should check in `note`.
- `quote`: REQUIRED for gate and chapter. Copy a contiguous span of at least 6 words
  verbatim from the wiki file (wikitext markup like [[ ]] and {{m|Surf}} may be
  included as-is). A script checks the quote is really in the file; findings whose
  quote isn't found are thrown away.
- `inferred: true` when the quote supports the gate only indirectly (for example an item
  note "north of the pond (requires Surf)" next to where the grass is), not a direct
  statement about the area or its encounters.

Be precise and conservative. Don't report from memory of the games; every gate
must rest on the page. When an area's species are mostly radio/swarm/time-limited
extras, that's not an access problem. Work through every entry; don't stop early.
Finish with a one-line summary: counts per verdict.
