# Ultra Sun and Ultra Moon ambush audit

Compared with `origin/main` at `9d5af6e8`, using the terrain correction in
Sun/Moon PR #104 (`9d450ffc`) as the reference. Encounter evidence comes from
the cached Bulbapedia USUM location tables linked in `data/usum.json`.

## Corrected encounters

| Place | Species | Method |
| --- | --- | --- |
| Route 2 North/South | Drowzee, Dunsparce, Ekans, Makuhita | Rustling grass |
| Route 3 North | Spearow, Rufflet, Vullaby | Flying shadow |
| Routes 5/7, Diglett's Tunnel | Diglett | Dirt cloud |
| Route 10 | Fearow, Pineco, Skarmory | Rustling tree |
| Verdant Cavern Trial Site | Rattata, Yungoos | Dirt cloud |
| Dividing Peak Tunnel | Kecleon | Cave shadow |
| Haina Desert | Dugtrio, Krokorok, Trapinch | Sand cloud |
| Haina Desert | Baltoy, Castform, Gabite, Golett | SOS |
| Lush Jungle South/West | Oranguru, Passimian, Steenee | Rustling grass |
| Lush Jungle South/West | Trumbeak | SOS |
| Poni Coast, Vast Poni Canyon Inside | Dugtrio | Dirt cloud |
| Poni Plains Center | Gumshoos, Pyroar, Raticate | Rustling grass |
| Poni Plains Center | Chansey, Cottonee, Petilil, Scyther | Rustling bush |
| Poni Plains Center | Blissey | SOS |
| Poni Plains North | Braviary, Fearow, Mandibuzz | Flying shadow |
| Poni Plains West | Aipom, Emolga, Primeape | Rustling tree |
| Poni Plains West | Ambipom | SOS |
| Hano Beach | Tentacool | Water splash |
| Poni Breaker Coast | Wailord, Dragalge, Clawitzer | Water splash |

All requested land rows were corrected, with none added or dropped from that
list. The four water splash rows are additional corrections following SM's
approach: they require Lapras, while real fishing bubbles and fishing SOS
still require the rod. Land ambush methods have no kit requirement. No
existing shared method changes meaning. Route 7's override only matches
Diglett; its real fishing rows retain the rod. Route 5 Diglett retains Firium.

The 44 land ambush rows and eight land SOS rows become terrain methods and
plain SOS respectively. Six SOS duplicates merge (Haina Baltoy, Castform,
Gabite and Golett; Trumbeak in each Lush Jungle area). Levels and odds continue
to use the existing builder's merging rules. No species or locations are
removed.

## Machamp

USUM walkthrough Part 21 sails to Poni after Aether. Part 22 registers Machamp
on Ancient Poni Path: "her grandmother registers Machamp Shove to your Ride
Pager before you go". The Lush Jungle cave could previously open before
Aether when Machamp was manually selected. All four Machamp area definitions
now require the existing `aether` flag as SM does. Ten generated rows gain it:
Golbat, Dugtrio, Crobat, Larvesta, Volcarona, Salandit and Salazzle in Lush
Jungle East Cave, plus Tapu Lele, Tapu Bulu and Tapu Fini in their shrines.
The Poni chapter already required Aether. Ruins of Abundance has no earlier
ordinary encounter rows; the shrine rows retain their Champion requirement.

## Evidence limits

Haina's Gabite and Castform SOS rows now carry their weather conditions; see
`sources/usum.md`. Lush Jungle's ambush block appears under PokeAPI South and West,
which matches Bulbapedia's shared Central and north table, so both stay.
Wailmer's Poni Breaker Coast bubble row mixes fishing and splash
levels/odds, so it remains unchanged pending a sourced split.
These issues are recorded in `sources/usum.md#open-questions`.

## Verification

- `python3 scripts/build_data.py usum`: 807 species, 1,117 rows (previously 1,123).
- Rebuilt all seven other packs; all eight other generated TypeScript files
  (including sprite-fit) remained byte-for-byte unchanged.
- `node scripts/check_usum.mjs`: passed terrain, real fishing, splash, SOS,
  Route 5 and Machamp availability regressions using the actual runtime rules.
- `pnpm check`: passed.
- `pnpm build`: passed.
- `pnpm test:convex`: eight files, 88 tests passed.
- Browser behavior was not exercised; this change was checked through sources,
  generated rows and runtime availability rules.
