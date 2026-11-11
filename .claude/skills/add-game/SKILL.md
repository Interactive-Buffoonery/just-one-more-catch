---
name: add-game
description: Use when adding a new game (pack) to Just One More Catch, or when changing any hand-written game data in data/<pack>.json or client/packs.ts (chapters, badge or item gates, story events, per-Pokémon gates, HM badge rules, clock times, starters, Safari areas). Covers where each fact must come from so nothing is guessed.
---

# Adding or changing a game

Encounter data comes from PokeAPI. Everything else about a game's story is
written by hand, and every hand-written fact needs a source. Ruins of Alph
was once gated behind the Zephyr Badge from memory; you can reach it before
Falkner through Route 36. Do not repeat that.

## What comes from where

| Data | Lives in | Source |
| --- | --- | --- |
| Species, encounters, levels, odds, time-of-day and weekday conditions | `client/data/<pack>.ts`, generated | PokeAPI via `scripts/fetch_pokeapi.py` and `scripts/build_data.py`. Never edit by hand. |
| Chapters: titles, `places`, `needs`, `kit` (HM or item) | `data/<pack>.json` | Bulbapedia walkthrough and location pages |
| Area gates: top-level `needs` (area prefix to needs) | `data/<pack>.json` | Bulbapedia location pages (which floors or parts need Surf, Strength, Whirlpool, Waterfall, Rock Smash, Flash, and so on) |
| Story events: `events` | `data/<pack>.json` | Bulbapedia walkthrough, item and character pages |
| Per-Pokémon gates: `row_needs` | `data/<pack>.json` | Bulbapedia gift, legendary and location pages (tiebreakers in `SOURCES.md`) |
| `hm`: badge that lets each HM be used outside battle | `client/packs.ts` | Bulbapedia `Badge` page for that game |
| `rename`, `drop`, `drop_methods`, `methods` | `data/<pack>.json` | PokeAPI area names, checked against the game |
| `forms`: the form a species takes in this game (`"rattata-alola"`), for its types and sprite. Every form's encounters count either way. | `data/<pack>.json` | PokeAPI form names, checked against Bulbapedia |
| Badges and leaders, HM items, `start`, `starters`, `safari`, `nightFrom`, dex sizes, box counts | `client/packs.ts` | Bulbapedia game, gym and mechanic pages (time of day, PC boxes) |

## Data format

A **need** is one of: a badge name from `client/packs.ts` (`"Zephyr"`,
`"Elite Four"`; badges start with a capital letter), a kit id (`"surf"`,
`"strength"`), or an event id from the pack's `events`. Chapter `needs`, area
`needs` and `row_needs` all take any mix of these, and every need must be met.

Record the source next to a new gate. An area need can be
`{"needs": ["surf"], "src": "<Bulbapedia URL>", "quote": "<words from the page>"}`
instead of a plain list, and a `row_needs` entry can carry the same `src` and
`quote` keys. The build ignores them; they're there for the next reviewer.

The app applies the HM rule itself: a kit id listed in the pack's `hm` only
counts once the player has that badge too. Don't add the badge next to every
HM need. This only covers kit ids in `hm`: an HM modelled as an event (FRLG's
Cut) needs its badge listed next to it by hand.

**`events`** are story milestones the player ticks in Your journey, or answers
in the Story check card:

```json
{"id": "clair", "label": "Beat Clair", "q": "Did you beat Clair at the Blackthorn Gym?",
 "chap": 6, "after": ["squirt-bottle"], "by": "Rising"}
```

- `id`: lowercase slug. It must not match a kit id.
- `label`: a checklist step ("Get the SquirtBottle", "Meet Bill in Ecruteak").
  Rows blocked by the event show it as-is, so it must read as a to-do.
- `q`: one plain yes/no question a player can answer from memory.
- `chap`: the chapter it's grouped and asked in. The Story check only asks
  once that chapter is unlocked, so an event can't be in a chapter that needs
  it. Pick the chapter where the player can first do it.
- `after` (optional): events that must come first. Ticking this one counts
  them as done.
- `by` (optional): a badge or event the game can't reach without this event
  having happened, so owning it proves the event. The app treats `by` as proof:
  once the player has it, the event shows as done and can't be unticked. Only
  set it when every route to the `by` passes through this event, with a source
  that says so. Leave it off if a trade, another route or a skippable step can
  get around it (FRLG Cut can be traded in, so the Thunder Badge doesn't prove
  the S.S. Anne). Optional side events never get a `by`.

**`row_needs`** gate one Pokémon inside an open area (gifts, legendaries,
statics, roamers):

```json
{"place": "Dragons Den", "n": 147, "m": "gift", "needs": ["Rising", "dragonbreath"]}
```

`place` matches the area name as `nice()` in `scripts/build_data.py` writes it
(title case, no `-area` suffix or region prefix, so `dragons-den-area` is
`"Dragons Den"`), before `rename`, by prefix, just like area `needs`. `n` is the national dex number and `m` (optional) the method
after `methods` mapping. These needs add to the area's.

When a row needs a postgame event, put `"Elite Four"` first in its needs so the
row reads "After the Elite Four" until then.

PokeAPI has no story progression. Any fact about when a place can be reached
is hand-written, so it needs a source.

## Rules

- **Never write a gate from memory.** For each place, find the earliest point
  in the story the player can physically get there, and what it takes. Check
  each part separately: cave floors behind an HM, route segments before or
  after a blocker (Sudowoodo, Snorlax, Rocket gates), side entrances, and
  buildings that open after an event.
- **Check HM badge rules per game.** The badge needed to use each HM outside
  battle differs between generations.
- **Earliest reachable wins.** A place goes in the first chapter where it can
  be reached, not the chapter where the walkthrough happens to mention it.
  When one PokeAPI area covers several parts (cave floors, two ends of a
  route), it opens with its earliest part.
- **An HM needs its badge.** Getting the HM item isn't enough; the player also
  needs the badge that lets them use it outside battle. Fill in the pack's
  `hm` table from the game's Badge page; the app checks it for every kit need.
- **Gifts, legendaries and events are their own gate.** A place being open
  doesn't mean everything in it is. Check each gift, static encounter and
  roamer for the event that unlocks it (Dratini in Dragon's Den, Eevee at
  Bill's house, Ho-Oh, Lugia, Celebi).
- **Cite as you go.** Keep a scratch list of `place -> chapter / gate -> URL +
  quote`. Put the links in the PR description.
- **Can't source it? Say so.** Leave it as-is, list it as unverified in the PR,
  and ask Sarah. Don't guess.
- **Prefer a real event over a badge proxy.** If a place opens after a story
  event (SecretPotion delivered, Sudowoodo moved), add an event instead of
  gating on the nearest badge.
- **Don't gate encounter methods per place.** The app already requires the
  right rod, Surf, Headbutt or Rock Smash for each encounter method
  (`METHOD` in `client/app.ts`). Area `needs` only cover getting to a place.

Sources, in order: Bulbapedia (`Appendix:<Game>_walkthrough` and location
pages), then StrategyWiki, the official guides and Serebii to break ties.
`SOURCES.md` lists the pages and guide files for each game; add new ones there. Make sure a location page that covers
several games is describing the one you're working on.

For a second source from a scanned strategy guide, use the `read-guide` skill.

Bulbapedia blocks scripted fetches. To read its pages, use the `audit-access`
skill's cache (`scripts/access_audit.py`).

## Steps

1. Add the pack to `client/packs.ts` (the pack, its `kit` and `hm`, and a
   `VERSIONS` entry) and `shared/versions.ts`. Source each value as listed
   above. Every kit id a need uses must be in the pack's `kit`.
2. Write `data/<pack>.json`. Copy the shape of an existing pack.
3. `python3 scripts/fetch_pokeapi.py`, then `python3 scripts/build_data.py <pack>`.
   `fetch_pokeapi.py` and `pretty()` in `build_data.py` are
   written for the Johto and Kanto games; a new generation may need them
   extended. A new encounter method needs a `METHOD` entry in `client/app.ts`.
   The build fails on:
   - an area that no chapter claims, or an area `needs` or `row_needs` that
     matches nothing
   - an event id that isn't a lowercase slug, is repeated, or clashes with an
     item icon; a `chap` out of range; an unknown `after` id
   - an event loop, or an event that can never be asked because its chapter
     needs it first
   - a need or kit id with no icon in `public/items/`

   Fix each one with a sourced chapter, not just whichever chapter is closest.
   The build doesn't check badge names or `by` values against `packs.ts`, so
   check those by hand: a typo locks content for good.
4. Add sprites: an `ART` entry in `scripts/fetch_sprites.py` (plus `ITEMS` for
   a new kit icon and `BADGES` for a new region), then run it.
5. Verify with a second pass that doesn't trust the first: run the
   `audit-access` skill for the pack.
6. When changing an existing pack, rebuild and compare the old and new
   `client/data/<pack>.ts` row by row (save the old file first). Only the rows
   you meant to move should change chapter or needs.
7. `npx tsc --noEmit -p .` and `npm run build`.
