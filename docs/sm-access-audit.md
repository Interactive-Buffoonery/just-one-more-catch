# Sun / Moon access inventory

Implementation source review; independent audit pending. Pack `sm`, versions `sun`/`moon`.

The cached PokeAPI preflight found 102 matching areas and 891 Sun / 890 Moon encounter-detail records. Two Sun records at Hoenn’s New Mauville (Voltorb/Electrode) are dropped, leaving 101 retained areas and 889 / 890 raw details. The generator merges these into 890 rows across versions. Every retained area resolves to a cached Bulbapedia location page. This inventory is a reviewer work list, not proof that each terrain boundary was independently traced.

Sources and gate excerpts live in `data/sm.json` and `SOURCES.md`; unresolved terrain and cache limitations live in `OPEN_QUESTIONS.md`. Rebuild the work list with `python3 scripts/access_audit.py areas sm`.

## Area work list

| PokeAPI area | Chapter | Extra area needs | Location source |
| --- | --- | --- | --- |
| Aether Paradise 2F | 14: Champion of Alola (needs ['Elite Four']) | — | [Aether Paradise](https://bulbapedia.bulbagarden.net/wiki/Aether_Paradise) |
| Akala Outskirts | 6: Diglett's Tunnel to Konikoni (needs ['Grassium']) | — | [Akala Outskirts](https://bulbapedia.bulbagarden.net/wiki/Akala_Outskirts) |
| Altar Of The Moone | 12: The altar and Nebby (needs ['Dragonium']) | — | [Altar of the Moone](https://bulbapedia.bulbagarden.net/wiki/Altar_of_the_Moone) |
| Altar Of The Sunne | 12: The altar and Nebby (needs ['Dragonium']) | — | [Altar of the Sunne](https://bulbapedia.bulbagarden.net/wiki/Altar_of_the_Sunne) |
| Ancient Poni Path | 10: Poni Island (needs ['Darkinium', 'sm-aether']) | — | [Ancient Poni Path](https://bulbapedia.bulbagarden.net/wiki/Ancient_Poni_Path) |
| Berry Fields | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Berry fields](https://bulbapedia.bulbagarden.net/wiki/Berry_fields) |
| Blush Mountain | 8: Routes 11 to 15 (needs ['Electrium']) | — | [Blush Mountain](https://bulbapedia.bulbagarden.net/wiki/Blush_Mountain) |
| Brooklet Hill Main | 3: Akala: Paniola and Brooklet Hill (needs ['Fightinium']) | — | [Brooklet Hill](https://bulbapedia.bulbagarden.net/wiki/Brooklet_Hill) |
| Brooklet Hill North | 3: Akala: Paniola and Brooklet Hill (needs ['Fightinium']) | — | [Brooklet Hill](https://bulbapedia.bulbagarden.net/wiki/Brooklet_Hill) |
| Brooklet Hill South | 3: Akala: Paniola and Brooklet Hill (needs ['Fightinium']) | — | [Brooklet Hill](https://bulbapedia.bulbagarden.net/wiki/Brooklet_Hill) |
| Brooklet Hill Totems Den | 3: Akala: Paniola and Brooklet Hill (needs ['Fightinium']) | Waterium | [Brooklet Hill](https://bulbapedia.bulbagarden.net/wiki/Brooklet_Hill) |
| Digletts Tunnel | 6: Diglett's Tunnel to Konikoni (needs ['Grassium']) | — | [Diglett's Tunnel](https://bulbapedia.bulbagarden.net/wiki/Diglett's_Tunnel) |
| Exeggutor Island | 10: Poni Island (needs ['Darkinium', 'sm-aether']) | — | [Exeggutor Island](https://bulbapedia.bulbagarden.net/wiki/Exeggutor_Island) |
| Haina Desert | 9: Haina Desert to Route 17 (needs ['Ghostium']) | Ghostium | [Haina Desert](https://bulbapedia.bulbagarden.net/wiki/Haina_Desert) |
| Hano Beach | 7: Hano Beach and Ula'ula (needs ['Rockium']) | — | [Hano Beach](https://bulbapedia.bulbagarden.net/wiki/Hano_Beach) |
| Hauoli Cemetery | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Hau'oli Cemetery](https://bulbapedia.bulbagarden.net/wiki/Hau'oli_Cemetery) |
| Hauoli City Main | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Hau'oli City](https://bulbapedia.bulbagarden.net/wiki/Hau'oli_City) |
| Hauoli City Shopping District | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Hau'oli City](https://bulbapedia.bulbagarden.net/wiki/Hau'oli_City) |
| Iki Town | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Iki Town](https://bulbapedia.bulbagarden.net/wiki/Iki_Town) |
| Kalae Bay | 1: Route 3 and Melemele Meadow (needs ['Normalium']) | surf | [Kala'e Bay](https://bulbapedia.bulbagarden.net/wiki/Kala'e_Bay) |
| Konikoni City | 6: Diglett's Tunnel to Konikoni (needs ['Grassium']) | — | [Konikoni City](https://bulbapedia.bulbagarden.net/wiki/Konikoni_City) |
| Lake Of The Moone | 9: Haina Desert to Route 17 (needs ['Ghostium']) | sm-sharpedo | [Lake of the Moone](https://bulbapedia.bulbagarden.net/wiki/Lake_of_the_Moone) |
| Lake Of The Sunne | 9: Haina Desert to Route 17 (needs ['Ghostium']) | sm-sharpedo | [Lake of the Sunne](https://bulbapedia.bulbagarden.net/wiki/Lake_of_the_Sunne) |
| Lush Jungle All Areas | 5: Route 8 and Lush Jungle (needs ['Firium']) | Grassium | [Lush Jungle](https://bulbapedia.bulbagarden.net/wiki/Lush_Jungle) |
| Lush Jungle East Cave | 5: Route 8 and Lush Jungle (needs ['Firium']) | Grassium, machamp, sm-aether | [Lush Jungle](https://bulbapedia.bulbagarden.net/wiki/Lush_Jungle) |
| Lush Jungle North | 5: Route 8 and Lush Jungle (needs ['Firium']) | Grassium | [Lush Jungle](https://bulbapedia.bulbagarden.net/wiki/Lush_Jungle) |
| Lush Jungle South | 5: Route 8 and Lush Jungle (needs ['Firium']) | Grassium | [Lush Jungle](https://bulbapedia.bulbagarden.net/wiki/Lush_Jungle) |
| Lush Jungle West | 5: Route 8 and Lush Jungle (needs ['Firium']) | Grassium | [Lush Jungle](https://bulbapedia.bulbagarden.net/wiki/Lush_Jungle) |
| Malie City Main | 7: Hano Beach and Ula'ula (needs ['Rockium']) | — | [Malie City](https://bulbapedia.bulbagarden.net/wiki/Malie_City) |
| Malie City Outer Cape | 7: Hano Beach and Ula'ula (needs ['Rockium']) | — | [Malie City](https://bulbapedia.bulbagarden.net/wiki/Malie_City) |
| Malie Garden | 7: Hano Beach and Ula'ula (needs ['Rockium']) | — | [Malie Garden](https://bulbapedia.bulbagarden.net/wiki/Malie_Garden) |
| Melemele Meadow | 1: Route 3 and Melemele Meadow (needs ['Normalium']) | — | [Melemele Meadow](https://bulbapedia.bulbagarden.net/wiki/Melemele_Meadow) |
| Melemele Sea | 1: Route 3 and Melemele Meadow (needs ['Normalium']) | surf | [Melemele Sea](https://bulbapedia.bulbagarden.net/wiki/Melemele_Sea) |
| Memorial Hill | 6: Diglett's Tunnel to Konikoni (needs ['Grassium']) | — | [Memorial Hill](https://bulbapedia.bulbagarden.net/wiki/Memorial_Hill) |
| Mount Hokulani Main | 7: Hano Beach and Ula'ula (needs ['Rockium']) | — | [Mount Hokulani](https://bulbapedia.bulbagarden.net/wiki/Mount_Hokulani) |
| Mount Lanakila Cave | 13: Mount Lanakila (needs ['Dragonium', 'sm-nebby']) | — | [Mount Lanakila](https://bulbapedia.bulbagarden.net/wiki/Mount_Lanakila) |
| Mount Lanakila Outside | 13: Mount Lanakila (needs ['Dragonium', 'sm-nebby']) | — | [Mount Lanakila](https://bulbapedia.bulbagarden.net/wiki/Mount_Lanakila) |
| Paniola Ranch | 3: Akala: Paniola and Brooklet Hill (needs ['Fightinium']) | — | [Paniola Ranch](https://bulbapedia.bulbagarden.net/wiki/Paniola_Ranch) |
| Paniola Town | 3: Akala: Paniola and Brooklet Hill (needs ['Fightinium']) | — | [Paniola Town](https://bulbapedia.bulbagarden.net/wiki/Paniola_Town) |
| Poke Pelago Elite Four Defeated | 14: Champion of Alola (needs ['Elite Four']) | — | [Poké Pelago](https://bulbapedia.bulbagarden.net/wiki/Poké_Pelago) |
| Poke Pelago Poni Island Reached | 10: Poni Island (needs ['Darkinium', 'sm-aether']) | — | [Poké Pelago](https://bulbapedia.bulbagarden.net/wiki/Poké_Pelago) |
| Poke Pelago Ulaula Island Reached | 7: Hano Beach and Ula'ula (needs ['Rockium']) | sm-ulaula | [Poké Pelago](https://bulbapedia.bulbagarden.net/wiki/Poké_Pelago) |
| Poni Breaker Coast | 10: Poni Island (needs ['Darkinium', 'sm-aether']) | — | [Poni Breaker Coast](https://bulbapedia.bulbagarden.net/wiki/Poni_Breaker_Coast) |
| Poni Coast | 14: Champion of Alola (needs ['Elite Four']) | — | [Poni Coast](https://bulbapedia.bulbagarden.net/wiki/Poni_Coast) |
| Poni Gauntlet | 14: Champion of Alola (needs ['Elite Four']) | — | [Poni Gauntlet](https://bulbapedia.bulbagarden.net/wiki/Poni_Gauntlet) |
| Poni Grove | 14: Champion of Alola (needs ['Elite Four']) | — | [Poni Grove](https://bulbapedia.bulbagarden.net/wiki/Poni_Grove) |
| Poni Meadow | 14: Champion of Alola (needs ['Elite Four']) | — | [Poni Meadow](https://bulbapedia.bulbagarden.net/wiki/Poni_Meadow) |
| Poni Plains Center | 14: Champion of Alola (needs ['Elite Four']) | — | [Poni Plains](https://bulbapedia.bulbagarden.net/wiki/Poni_Plains) |
| Poni Plains East | 14: Champion of Alola (needs ['Elite Four']) | — | [Poni Plains](https://bulbapedia.bulbagarden.net/wiki/Poni_Plains) |
| Poni Plains North | 14: Champion of Alola (needs ['Elite Four']) | — | [Poni Plains](https://bulbapedia.bulbagarden.net/wiki/Poni_Plains) |
| Poni Plains West | 14: Champion of Alola (needs ['Elite Four']) | — | [Poni Plains](https://bulbapedia.bulbagarden.net/wiki/Poni_Plains) |
| Poni Wilds | 10: Poni Island (needs ['Darkinium', 'sm-aether']) | — | [Poni Wilds](https://bulbapedia.bulbagarden.net/wiki/Poni_Wilds) |
| Resolution Cave | 14: Champion of Alola (needs ['Elite Four']) | mudsdale | [Resolution Cave](https://bulbapedia.bulbagarden.net/wiki/Resolution_Cave) |
| Route 1 East | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Alola Route 1](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_1) |
| Route 1 Hauoli Outskirts | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Alola Route 1](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_1) |
| Route 1 South | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | tauros | [Alola Route 1](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_1) |
| Route 1 West | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Alola Route 1](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_1) |
| Route 10 | 7: Hano Beach and Ula'ula (needs ['Rockium']) | — | [Alola Route 10](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_10) |
| Route 11 | 8: Routes 11 to 15 (needs ['Electrium']) | — | [Alola Route 11](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_11) |
| Route 12 | 8: Routes 11 to 15 (needs ['Electrium']) | mudsdale | [Alola Route 12](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_12) |
| Route 13 | 8: Routes 11 to 15 (needs ['Electrium']) | — | [Alola Route 13](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_13) |
| Route 14 | 8: Routes 11 to 15 (needs ['Electrium']) | — | [Alola Route 14](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_14) |
| Route 15 Aether House | 8: Routes 11 to 15 (needs ['Electrium']) | — | [Alola Route 15](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_15) |
| Route 15 Main | 8: Routes 11 to 15 (needs ['Electrium']) | — | [Alola Route 15](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_15) |
| Route 16 Main | 9: Haina Desert to Route 17 (needs ['Ghostium']) | sm-sharpedo | [Alola Route 16](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_16) |
| Route 17 All Areas | 9: Haina Desert to Route 17 (needs ['Ghostium']) | sm-sharpedo | [Alola Route 17](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_17) |
| Route 17 Northeast | 9: Haina Desert to Route 17 (needs ['Ghostium']) | sm-sharpedo | [Alola Route 17](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_17) |
| Route 17 West | 9: Haina Desert to Route 17 (needs ['Ghostium']) | sm-sharpedo | [Alola Route 17](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_17) |
| Route 2 Main | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Alola Route 2](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_2) |
| Route 2 North | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Alola Route 2](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_2) |
| Route 2 South | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Alola Route 2](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_2) |
| Route 3 Main | 1: Route 3 and Melemele Meadow (needs ['Normalium']) | — | [Alola Route 3](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_3) |
| Route 3 North | 1: Route 3 and Melemele Meadow (needs ['Normalium']) | — | [Alola Route 3](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_3) |
| Route 3 South | 1: Route 3 and Melemele Meadow (needs ['Normalium']) | — | [Alola Route 3](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_3) |
| Route 4 | 3: Akala: Paniola and Brooklet Hill (needs ['Fightinium']) | — | [Alola Route 4](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_4) |
| Route 5 | 3: Akala: Paniola and Brooklet Hill (needs ['Fightinium']) | — | [Alola Route 5](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_5) |
| Route 6 North | 4: Route 6 to Wela Volcano Park (needs ['Waterium']) | — | [Alola Route 6](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_6) |
| Route 6 South | 4: Route 6 to Wela Volcano Park (needs ['Waterium']) | — | [Alola Route 6](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_6) |
| Route 7 | 4: Route 6 to Wela Volcano Park (needs ['Waterium']) | — | [Alola Route 7](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_7) |
| Route 8 Fossil Restoration Center | 5: Route 8 and Lush Jungle (needs ['Firium']) | — | [Alola Route 8](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_8) |
| Route 8 Main | 5: Route 8 and Lush Jungle (needs ['Firium']) | — | [Alola Route 8](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_8) |
| Route 9 Main | 6: Diglett's Tunnel to Konikoni (needs ['Grassium']) | — | [Alola Route 9](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_9) |
| Ruins Of Abundance | 9: Haina Desert to Route 17 (needs ['Ghostium']) | Ghostium, machamp, sm-aether | [Ruins of Abundance](https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Abundance) |
| Ruins Of Conflict | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | — | [Ruins of Conflict](https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Conflict) |
| Ruins Of Hope | 10: Poni Island (needs ['Darkinium', 'sm-aether']) | machamp, sm-aether | [Ruins of Hope](https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Hope) |
| Ruins Of Life | 6: Diglett's Tunnel to Konikoni (needs ['Grassium']) | machamp, sm-aether | [Ruins of Life](https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Life) |
| Seafolk Village Huntail Boat | 10: Poni Island (needs ['Darkinium', 'sm-aether']) | — | [Seafolk Village](https://bulbapedia.bulbagarden.net/wiki/Seafolk_Village) |
| Seafolk Village Main | 10: Poni Island (needs ['Darkinium', 'sm-aether']) | — | [Seafolk Village](https://bulbapedia.bulbagarden.net/wiki/Seafolk_Village) |
| Seaward Cave | 1: Route 3 and Melemele Meadow (needs ['Normalium']) | — | [Seaward Cave](https://bulbapedia.bulbagarden.net/wiki/Seaward_Cave) |
| Secluded Shore | 8: Routes 11 to 15 (needs ['Electrium']) | — | [Ula'ula Beach](https://bulbapedia.bulbagarden.net/wiki/Ula'ula_Beach) |
| Tapu Village | 8: Routes 11 to 15 (needs ['Electrium']) | — | [Tapu Village](https://bulbapedia.bulbagarden.net/wiki/Tapu_Village) |
| Ten Carat Hill Farthest Hollow | 2: Ten Carat Hill (needs ['Fightinium']) | tauros | [Ten Carat Hill](https://bulbapedia.bulbagarden.net/wiki/Ten_Carat_Hill) |
| Ten Carat Hill Inside | 2: Ten Carat Hill (needs ['Fightinium']) | tauros | [Ten Carat Hill](https://bulbapedia.bulbagarden.net/wiki/Ten_Carat_Hill) |
| Thrifty Megamart Abandoned Site | 8: Routes 11 to 15 (needs ['Electrium']) | Ghostium | [Royal Avenue](https://bulbapedia.bulbagarden.net/wiki/Royal_Avenue) |
| Ulaula Meadow | 9: Haina Desert to Route 17 (needs ['Ghostium']) | sm-sharpedo | [Ula'ula Meadow](https://bulbapedia.bulbagarden.net/wiki/Ula'ula_Meadow) |
| Vast Poni Canyon Inside | 11: Vast Poni Canyon (needs ['Groundium']) | — | [Vast Poni Canyon](https://bulbapedia.bulbagarden.net/wiki/Vast_Poni_Canyon) |
| Vast Poni Canyon Northwest | 11: Vast Poni Canyon (needs ['Groundium']) | — | [Vast Poni Canyon](https://bulbapedia.bulbagarden.net/wiki/Vast_Poni_Canyon) |
| Vast Poni Canyon Outside | 11: Vast Poni Canyon (needs ['Groundium']) | tauros | [Vast Poni Canyon](https://bulbapedia.bulbagarden.net/wiki/Vast_Poni_Canyon) |
| Verdant Cavern  Trial Site | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | Normalium | [Verdant Cavern](https://bulbapedia.bulbagarden.net/wiki/Verdant_Cavern) |
| Verdant Cavern Trial Site | 0: Melemele: Iki Town to Verdant Cavern (needs nothing) | Normalium | [Verdant Cavern](https://bulbapedia.bulbagarden.net/wiki/Verdant_Cavern) |
| Wela Volcano Park | 4: Route 6 to Wela Volcano Park (needs ['Waterium']) | — | [Wela Volcano Park](https://bulbapedia.bulbagarden.net/wiki/Wela_Volcano_Park) |

## Automated scenarios

`scripts/check_sm.mjs` executes the application’s actual row-availability rules for each UB mission, Necrozma after the final report, altar rescue, and early SOS; it also checks version-exclusive rows and the dropped New Mauville artifact. `scripts/check_clock.ts` checks Moon’s hour shift, preserved console weekday, literal manual time and SM’s 06:00/18:00 boundaries. These checks do not establish game accuracy independently of the cited data.

## Manual checklist (not run)

- For Sun and Moon: picker, covers, starter selection, guest create/reload/reopen/catch persistence.
- Ilima SOS unlock; Lapras before Lana versus Fishing Rod after; Hala/Tauros, Route 12/Mudsdale, Route 15/Sharpedo and Poni/Machamp.
- Correct SM grand-trial order: Nanu, then Hapu, then canyon Dragonium; no Mina trial.
- Solgaleo/Lunala before the League; Tapus/Type: Null/Porygon after Champion; each UB mission, then Necrozma.
- Version-exclusive rows and traded fossil ownership; Island Scan/SOS missing conditions called out in the open questions.
- Sprites/shiny/forms visually, regional/national dex limits and boxes, Moon device/manual clock display.
- Generated `/sun-moon/` title, covers, canonical, chapter content and links; account sync separately.

No save-file reader mapping, deployment or release is part of this review correction.

## Validation receipt

- `python3 scripts/build_data.py sm`: 802 species, 890 merged encounter rows (two duplicate Haina SOS rows merge after terrain correction).
- Regional dex: 302 entries; 254 species have direct cached encounters.
- 101 retained raw areas normalize to 100 distinct row place names and 71
  chapter place groups; 15 chapters, 17 events, 69 catalogued forms.
- `uv run scripts/fetch_sprites.py`: completed; 1,742 SM PNG assets
  (regular/shiny species and forms). Existing sprite-fit JSON entries unchanged.
- `pnpm check`: passed, including the new Sun/Moon runtime scenarios and clock checks.
- `pnpm build`: passed; generated `/sun-moon/` (254 encountered species,
  15 chapters, 71 chapter places). Existing large Clerk chunk warnings remain.
- `pnpm test:convex`: 8 test files, 88 tests passed.
- `pnpm exec tsc --noEmit -p convex/tsconfig.json`: passed.
- `git diff --check`: passed. The initial pack did not change generator
  behaviour; the review corrections below add opt-in area method overrides.

## PR #104 review corrections

Cached SM location tables confirm 32 land ambush rows: Route 2 and Poni Plains
Center rustling grass; Route 3/Poni Plains North flying shadows; Verdant Cavern,
Routes 5/7, Diglett's Tunnel, Vast Poni Canyon Inside and Poni Coast dirt clouds;
Haina Desert sand clouds; Route 10, Lush Jungle West and Poni Plains West
rustling trees; Scyther/Cottonee/Petilil in Poni Plains Center rustling bushes.
`data/sm.json` records each location source and its literal encounter-table quote.
Place/species overrides run before row gates; new terrain method labels have no
kit requirement. Haina Castform/Gabite use plain SOS, retaining the cache's
weather-condition limitation. Real fishing bubbles and their SOS retain the rod.
Hano Beach Tentacool and the direct Poni Wilds Wailord row are water-splash
ambushes and require Lapras instead. Wailord fishing SOS keeps its rod gate.

Walkthrough Part 21 registers Machamp on Ancient Poni Path after the Part 20
Aether rescue. Every Machamp area now also requires the existing `sm-aether`
event. The preceding Darkinium rule remains a redundant milestone; it cannot
open a Machamp area before Aether. No new story event or shared HM behavior is
needed. Regression scenarios exercise all terrain labels, Route 2 without rod
or Waterium, real bubbles with rod/Waterium, Haina SOS, Hano Lapras and all
Machamp rows before/after Aether.

### USUM follow-up candidates (unchanged)

These existing USUM rows still use fishing-bubble methods for land ambushes.
The owner can decide a separate correction; this PR changes no USUM data.

| Place | Rows |
| --- | --- |
| Diglett's Tunnel | Diglett |
| Dividing Peak Tunnel | Kecleon |
| Haina Desert | Baltoy (SOS), Castform (SOS), Dugtrio, Gabite (SOS), Golett (SOS), Krokorok, Trapinch |
| Lush Jungle South | Oranguru, Passimian, Steenee, Trumbeak (SOS) |
| Lush Jungle West | Oranguru, Passimian, Steenee, Trumbeak (SOS) |
| Poni Coast | Dugtrio |
| Poni Plains Center | Blissey (SOS), Chansey, Cottonee, Gumshoos, Petilil, Pyroar, Raticate, Scyther |
| Poni Plains North | Braviary, Fearow, Mandibuzz |
| Poni Plains West | Aipom, Ambipom (SOS), Emolga, Primeape |
| Route 10 | Fearow, Pineco, Skarmory |
| Route 2 North | Drowzee, Dunsparce, Ekans, Makuhita |
| Route 2 South | Drowzee, Dunsparce, Ekans, Makuhita |
| Route 3 North | Rufflet, Spearow, Vullaby |
| Route 5 | Diglett |
| Route 7 | Diglett, Gyarados (SOS), Magikarp, Starmie (SOS), Staryu, Wishiwashi |
| Vast Poni Canyon Inside | Dugtrio |
| Verdant Cavern Trial Site | Rattata, Yungoos |

### Review-fix validation

- `python3 scripts/build_data.py sm`: passed; 802 species, 890 rows.
- `node scripts/check_sm.mjs`: passed, including the new terrain/ride cases.
- `pnpm check`: passed.
- `pnpm build`: passed; existing Clerk chunk-size/directive warnings remain.
- `pnpm test:convex`: 8 files, 88 tests passed.
- Isolated regeneration of all nine packs against the combined local PokeAPI
  caches: SM matches its new output; Crystal, Emerald, FRLG, GS, HGSS, RB,
  USUM and Yellow each match their existing generated files byte-for-byte.
  The first comparison lacked Emerald's cache; combining existing local
  caches resolved it without fetching or altering any encounter data.
- `git diff --check`: passed. Browser/gameplay checks remain unrun.
