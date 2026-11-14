---
name: audit-access
description: Use when checking whether every encounter area in a Just One More Catch pack can really be reached when the app says it can (tester reports like "Natu is behind water", a new pack, or a periodic re-audit). Caches Bulbapedia location pages, has one model flag missing gates with verbatim quotes, has a second model confirm them, and merges the confirmed ones into data/<pack>.json.
---

# Auditing area access

The app shows an area's Pokémon once the area's chapter is open (plus any
area `needs` and `row_needs`). This skill finds places where that's too early,
such as grass behind water, a floor behind a boulder, or a static that needs
an event. The rules for what a gate means and how to write one are in the
`add-game` skill. Read it first.

## 1. Cache the pages

Bulbapedia's Cloudflare check blocks curl, headless Chrome and the API.
Don't try to get around it. A normal browser tab passes, so:

1. Run `python3 scripts/access_audit.py serve` in the background. It listens
   on 127.0.0.1:8765. A GET returns every candidate title, and a POST to
   `/<Title>` saves `.cache/bulbapedia/<Title>.wiki` (`/titles.json` for the
   title map). The cache is gitignored, so keep it between runs.
2. Open bulbapedia.bulbagarden.net in the Playwright MCP browser. With
   `browser_run_code_unsafe`, fetch the candidate list from the server, then
   from the page resolve them in batches with
   `/w/api.php?action=query&redirects=1&format=json&titles=A|B|...`. POST
   `{candidate: resolvedTitle|null}` to `/titles.json`, then fetch each page with
   `/w/index.php?action=raw&title=<Title>` and POST it to the server. Node's
   `fetch` reaches the local server; `page.evaluate(fetch)` reaches Bulbapedia.
3. Close the browser and stop the server when done.

If an area lands on a disambiguation or overview page, map it to the right
page in `SPECIFIC` or `candidates()` in the script, fetch that page, and add
it to `titles.json`. Known cases:
- Victory Road and Pokémon Mansion use the "(Kanto)" pages.
- Underground Path uses "Underground Path (Kanto Routes 5–6)".
- Power Plant uses "Kanto Power Plant".
- The Mt. Silver floors use "Mt. Silver Cave".

## 2. First pass: flag

1. `python3 scripts/access_audit.py areas <pack> > areas-<pack>.json` in the
   scratchpad. Each entry has:
   - the chapter and what it needs
   - the area and row needs
   - the species with their methods
   - `wiki`, a trimmed copy of the page without anime, trivia or music
2. Split each list into chunks of about 25 to 30 areas, keeping areas that
   share a page in the same chunk. Add `"pack"` to each entry.
3. Send one read-only agent per chunk, all at once. Give it
   [reviewer-brief.md](reviewer-brief.md), the repo path, and its chunk and
   output paths.
4. `python3 scripts/access_audit.py check findings-*.json > findings.json`.
   This drops any gate or chapter flag whose quote isn't really on the page,
   and lists areas no agent covered. Rerun the dropped or missing ones.

## 3. Second pass: confirm

Gather every finding that isn't `ok`, with its `wiki`, `chapter`, `area_needs`
and `row_needs`. Give them to a different model family for a second opinion. Use
[second-opinion-brief.md](second-opinion-brief.md). In the first run (Nov
2026), the second pass rejected about a quarter of the flags. Most were needs
already implied by the chapter or the HM badge rule.

## 4. Merge

Only change data for flags both passes agree on, where every need is
something the app models (a badge, a kit id, or an event in the pack's
`events`).
- A whole area: add a top-level `needs` entry with its source,
  `{"needs": [...], "src": "<url>", "quote": "..."}`. Keys match by prefix
  and the first match wins, so put a more specific key (`"Icefall Cave
  Waterfall"`) before a shorter one (`"Icefall Cave"`).
- Some species in an area: add `row_needs` entries with `src` and `quote`.
- Save `client/data/<pack>.ts` first, rebuild with
  `python3 scripts/build_data.py <pack>`, and diff it. Only the rows you meant
  to gate should change.

Don't merge these. List them in the PR, and add any still open to `sources/<pack>.md#open-questions`:
- Flags that need something unmodeled (Johto-pack Cut, Flash, Rock Climb,
  Bicycle, Safari layout unlocks, Primo codes, "all three beasts caught").
  Adding a new event or kit item is a product decision.
- Flags where the two passes disagree, or either one said unclear. These go
  on a tester checklist with what to look for in the game.
- Chapter moves. Check them against the walkthrough by hand.

To check a flag against a scanned strategy guide, use the `read-guide` skill.

The URL for a page is `https://bulbapedia.bulbagarden.net/wiki/<Title>` with
spaces as underscores.
