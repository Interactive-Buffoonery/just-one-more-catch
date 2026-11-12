# Emerald validation

Pack and version: `emerald`; encounter code `e`; original Game Boy Advance.

The pack contains 386 species (202 regional entries), 755 encounter rows,
112 display areas and 14 chapters. Data comes from the cached PokeAPI pipeline;
hand-written access and metadata sources are listed in `SOURCES.md` and linked
from `data/emerald.json`. Sprites include all 386 regular and shiny images.

The implementation retains the existing picker and playthrough UI. It reuses
`public/covers/e.jpg`, adds the Hoenn badges and travel tools, and builds the
static `/emerald/` game page and sitemap entry. Ruby/Sapphire remain Coming Soon.
Emerald save imports use reader identity `E`, bounded to National Dex IDs 1–386.
See [save-import validation](save-import.md) for verified formats and limits.

## Automated checks

- Generated data: `python3 scripts/build_data.py emerald`.
- Full checks and build: `pnpm check`, `pnpm build`.
- Shared version/import compatibility: `pnpm test:convex` (88 tests) and
  `pnpm exec tsc --noEmit -p convex/tsconfig.json`.
- `scripts/check_emerald.mjs` checks historical pre-evolutions and types,
  desert gates, roaming selection, Beldum/Rayquaza/Bagon requirements,
  special methods, excluded source artifacts, version codes and sprite files.
- Reader 0.1.2 and the website import harness passed native/raw-bit checks,
  the real WASM worker and 13 guest-browser scenarios: 128 KiB files, valid
  64 KiB caught/empty/rotated files with a recovery warning, five damaged
  64 KiB cases, unsupported Ruby/Sapphire and cancellation. Inputs and an
  existing playthrough stayed unchanged, and no upload requests occurred.
- All checks passed after the access corrections below, including the real
  row-status checks for Dynamo/Rock Smash, Mind/Dive and Feebas with any rod.

## Access review

- Checked the PokeAPI Emerald rows separately from other versions. Excluded
  the Ruby Team Magma Hideout duplicate, unused Cave of Origin basements and
  bonus-distribution Pokémon Center rows. Retained Cave of Origin Entrance/1F.
- Read pinned pret scripts for gifts, fossils, the Briney voyage, TV choice,
  eastern-ocean blocker, Sky Pillar door and HM badges. Checked walkthrough
  progression, separate floor access and postgame rewards. This is source
  evidence, not an in-game playthrough.
- The local Bulbapedia raw-page cache was absent. The automated access-audit
  command could not run without its `titles.json`; no Cloudflare bypass was
  attempted. Web-readable walkthroughs supplied supplementary evidence.
- An independent Codex reviewer scanned all 112 display areas. Claude's
  requested first pass could not start because of its five-hour API limit;
  Sarah authorized Codex as the replacement. The coordinator cross-checked
  each finding against primary scripts or walkthrough evidence. This did not
  provide the usual two-model-family cached-wiki audit.
- Fixed Weather Institute access for Fortree/Route 120; removed summit-only
  bike/smash requirements from the aggregated Mirage Tower wild encounters;
  kept the populated New Mauville entrance available before its inner key
  door; added Strength for Victory Road B2F; and made Southern Island's
  static Lati the opposite TV choice to the roamer.
- Resolved Route 123 using the primary map, metatile attributes and collision
  data: even an optimistic flood from the west cannot reach any encounter
  tiles. The Berry Master section ends at x=41; grass starts at x=49.
  Kept encounter rows behind the later Route 122 approach, with Devon Scope.
- The unresolved Victory Road B2F access question is tracked in
  [OPEN_QUESTIONS.md](../OPEN_QUESTIONS.md#emerald).

## Known limitations

- Cave of Origin encounters close again after awakening Rayquaza. The current
  additive journey model records their earliest availability and cannot hide
  a previously open area. Confirm catches during that story visit.
- Historical event islands require distribution items; the Old Sea Map was
  Japanese-only. The events are explicit opt-ins, not promises of present-day
  distribution availability. No bonus-disc Pokémon Center rows are included.
- No local Emerald official guide PDF was available. Access-review source
  coverage and the substitute independent review are recorded above.

## Manual checks still needed

- Pick Emerald on mobile/desktop; inspect its cover and confirmation.
- As a guest, create/reload a playthrough, choose a starter, mark a catch and
  reopen it. Check that Clerk loading failure preserves guest use.
- Verify Rock Smash's Dynamo requirement, Go-Goggles desert unlock, the Aqua
  Hideout ocean blocker, Dive's Mind requirement and pre-League Rayquaza.
- Check the Weather Institute gift, postgame Beldum and selected TV roamer;
  check Safari bike areas, expanded Safari and Mirage Island when applicable.
- Inspect regular/shiny sprites, dex numbering, 14 × 30 boxes and the
  `/emerald/` public page's title, canonical URL, cover and links.
- Signed-in account sync is not covered by these checks. Save-import fixture
  checks are recorded separately in [the import guide](save-import.md).

The game pack was merged and deployed in PR #92. The manual game-tracking
checks above remain open; the save-import checks cover the import flow only.
