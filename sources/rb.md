# Red and Blue (`rb`)

## Sources

Original international Red and Blue, not Japanese Blue, Yellow or FRLG.
Source inspection: pret/pokered revision
`130ac3fa5493fb29a8005e8439fd31b4826e46af` (read only; not built).
All pret paths below are relative to:
https://github.com/pret/pokered/tree/130ac3fa5493fb29a8005e8439fd31b4826e46af

### Temporary dock access evidence

- https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/scripts/VermilionDock.asm#L1-L40
  Lines 5–11 check `EVENT_GOT_HM01`, destination warp 1 and
  `EVENT_SS_ANNE_LEFT` before calling the departure script; line 40 sets
  `EVENT_SS_ANNE_LEFT`. This confirms the departure trigger, without
  establishing a new positive encounter prerequisite. The shared model
  needs an availability-ending condition before these rows can be hidden
  after departure. No encounter rows change on this evidence alone.

### Static reachability trace (Red/Blue)

Decoded the pinned `.blk` maps into 16×16-pixel movement squares using the
4×4-tile blocksets, sampling the lower-left collision tile. A scratch Python
BFS followed numbered warps, gate-house exits and directional ledges, kept
objects blocking, and applied tile-pair elevation restrictions. Coordinates
below are zero-based movement squares, not 32×32-pixel map blocks. This is
static source tracing, not gameplay or emulator verification.

- Common decoder evidence: [collision tiles](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/tilesets/collision_tile_ids.asm),
  [tile-pair restrictions](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/tilesets/pair_collision_tile_ids.asm),
  [ledge directions](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/tilesets/ledge_tiles.asm),
  [grass IDs](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/tilesets/tileset_headers.asm),
  [map dimensions](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/constants/map_constants.asm),
  [overworld blockset](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/gfx/blocksets/overworld.bst) and
  [cavern blockset](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/gfx/blocksets/cavern.bst).
- **Route 12 — settled, existing encounter gates confirmed.**
  [Map](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/maps/Route12.blk),
  [connections](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/headers/Route12.asm),
  [objects/warps](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/Route12.asm#L17-L41),
  [gate warps](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/Route12Gate1F.asm),
  [Cut block swaps](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/tilesets/cut_tree_blocks.asm)
  and adjoining `maps/Route11.blk` / `maps/Route13.blk`: BFS from Lavender,
  Route 11 and the matching Route 13 connection squares (10,107)/(11,107)
  reaches zero grass squares on foot without Cut, even with Snorlax removed.
  With Cut and Snorlax removed, all three approaches reach all 32 grass
  squares (for example (4,100)); the southern approach reaches them with
  Cut while Route 12 Snorlax remains. Its ordinary story route from Fuchsia
  still requires passing Route 16 Snorlax. Thus retain the Flute row gates
  and chapter's Cut requirement. North-approach fishing already reaches
  shores without removing Snorlax; keep fishing independent of the grass gate.
  Southern-approach check: on
  [Route 16's map](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/maps/Route16.blk),
  the Celadon edge enters a one-square corridor on row 10 that
  [Snorlax at (26,10)](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/Route16.asm#L35)
  closes before the gate warp (24,10). The Cut tree at (34,9) only opens
  the northern gate and Fly house pocket, which has no path to Route 17.
  Reaching Route 13 from Fuchsia therefore also needs the Flute.
- **Route 2 — direct approach confirmed; alternative gate remains open.**
  [Map](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/maps/Route2.blk),
  [objects/warps](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/Route2.asm#L8-L14)
  and [gate exits](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/Route2Gate.asm):
  from the cave exit (12,10), walk east to x18, south to y20, then west to
  (15,20) and north into house warp (15,19), without Cut or Surf. Western
  entrances from Viridian, Pewter and both forest gates cannot reach it
  without Cut; allowing the Cut block swaps opens those approaches. Bill's
  ticket still provides the ordinary cave route; a traded Cut user offers
  another path once Cut is usable. Keep the existing gate until the model
  supports OR prerequisites; do not replace it with an additional Cut gate.
- **Seafoam basement floors — settled, existing ordinary encounters confirmed.**
  Read `maps/SeafoamIslands{1F,B1F,B2F,B3F,B4F}.blk` and corresponding
  [1F warps](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/SeafoamIslands1F.asm),
  [B1F warps](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/SeafoamIslandsB1F.asm),
  [B2F warps](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/SeafoamIslandsB2F.asm),
  [B3F warps](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/SeafoamIslandsB3F.asm) and
  [B4F warps](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/SeafoamIslandsB4F.asm)
  with the cavern blockset. From west entrance (4,16), dry ladders link
  1F (7,5) → B1F (7,5); B1F (13,7) → B2F (13,7);
  B2F (5,13) → B3F (5,12); B3F (8,6) → B4F (11,7).
  Reachable non-warp encounter-floor examples are B1F (8,5), B2F (6,3),
  B3F (6,12), B4F (12,7). All boulder object coordinates were conservatively
  blocked, including initially hidden objects; holes were excluded and no
  internal Surf was allowed. From the east entrance (26,16), dry paths reach
  B1F–B3F but not B4F; earliest west access suffices for the shared floor rows.
  [Wild-encounter rules](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/engine/battle/wild_encounters.asm#L25-L50)
  allow indoor cave encounters on ordinary land;
  [B4F's encounter table](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/wild/maps/SeafoamIslandsB4F.asm)
  has a nonzero land rate. Dry B3F/B4F shores also permit fishing.
  The [B3F](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/scripts/SeafoamIslandsB3F.asm)
  and [B4F](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/scripts/SeafoamIslandsB4F.asm)
  current scripts do not trigger along these dry witnesses. This confirms
  ordinary floor access only; retain Articuno's separate Strength gate.
- **Decoder sanity check:** the same BFS on
  [Route 10's map](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/maps/Route10.blk)
  could not reach the [Power Plant door (6,39)](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/Route10.asm#L11-L16)
  from the north/center approach on foot; enabling Surf reached it, matching
  the already cited Power Plant requirement. Fishing checks used reachable
  land facing water/shore IDs from
  [IsNextTileShoreOrWater](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/engine/items/item_effects.asm#L2826-L2855).

### Encounters, historical data and artwork

- https://pokeapi.co/api/v2/pokemon/1/encounters and the corresponding
  species 1–151 endpoints: selected only version `red` or `blue`. Inspected
  all methods, locations, odds, levels and condition values. Methods are
  walking, three rods, Surf, gift, NPC trade, static and Poké Flute.
  Conditions are trade requests, fossil items and Game Corner coin costs;
  the existing renderer already labels these. No clock conditions or forms.
- https://pokeapi.co/api/v2/pokedex/2/ provides the Kanto dex order.
  `constants/pokedex_constants.asm` and `constants/pokemon_constants.asm`
  establish the 151-species bound and original starter choices (Bulbasaur,
  Charmander, Squirtle); `scripts/OaksLab.asm` permits one starter.
- `data/pokemon/base_stats/*.asm` and `data/pokemon/evos_moves.asm` are the
  original types and evolution rules. Checked all 151 generated species:
  PokeAPI `past_types` correctly removes Steel from Magnemite/Magneton
  and Fairy from the later-retyped species. The builder now suppresses
  later-added baby pre-evolutions in Gen I only; Hitmonlee/Hitmonchan have
  no Tyrogue evolution or Attack/Defense condition here. Existing pack
  generation remains byte-identical. `check_gen1.mjs` protects those rules
  and distinct Mt. Moon floor odds.
  PokeAPI’s Rock Tunnel B1F table is the original 1F table (Zubat 55%,
  levels 15–18); its B2F table is the original B1F table (Zubat 50%,
  levels 16–18). The pack renames these using
  `data/wild/maps/{RockTunnel1F,RockTunnelB1F}.asm`, without changing odds.
- https://pokeapi.co/api/v2/pokemon/25/ and
  https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-i/red-blue/transparent
  supply Red/Blue regular sprites. There is no Gen I shiny set in that
  API's `red-blue` sprite object. The tracker's shared shiny URL paths
  intentionally contain identical regular artwork, with no invented shiny
  colours and no requests for missing shiny assets. 151 regular + 151
  fallback images were fetched and centred. No alternate form catalog.
- Existing `public/covers/r.jpg` and `b.jpg` are reused unchanged for the
  picker and generated `/red-blue/` page.

### Metadata, badges and kit

- `constants/pokemon_data_constants.asm`: `MONS_PER_BOX EQU 20`,
  `NUM_BOXES EQU 12` (international releases).
- https://www.serebii.net/rb/gyms.shtml gives the eight leaders and badges:
  Brock/Boulder, Misty/Cascade, Lt. Surge/Thunder, Erika/Rainbow, Koga/Soul,
  Sabrina/Marsh, Blaine/Volcano and Giovanni/Earth. Region is Kanto;
  Pallet Town is the start; regional and national scope are both 151.
- `engine/menus/start_sub_menus.asm` checks Cascade for Cut, Thunder for Fly,
  Soul for Surf, Rainbow for Strength and Boulder for Flash. Surf and
  Strength are kit items with badge rules. Cut is an event plus explicit
  Cascade requirements, and means possessing a Pokémon that knows Cut
  (including a traded one), rather than requiring the S.S. Anne visit.
  Fly and Flash do not block catchable areas: Flash changes illumination.
- `scripts/VermilionOldRodHouse.asm`, `scripts/FuchsiaGoodRodHouse.asm`,
  `scripts/Route12SuperRodHouse.asm`, `scripts/SafariZoneSecretHouse.asm`,
  `scripts/WardensHouse.asm`, `scripts/BikeShop.asm`: rods, Surf HM,
  Strength HM and Bicycle acquisition. Acquisition is player selected in
  the kit checklist; encounter methods enforce the relevant rod/Surf.
- `scripts/Route16Gate1F.asm`: the Bicycle check blocks Route 17, but not
  Route 18 reached on foot from Fuchsia. Safari Zone's four areas remain
  distinct, all reachable during an ordinary visit without Surf.

### Earliest access and story milestones

All ten chapters carry walkthrough URLs in `data/rb.json`; area and row
exceptions carry pret or walkthrough citations. Walkthrough order alone
was not used as a gate: Power Plant opens with Surf, not the postgame.

- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-3/
  and `data/maps/headers/{PalletTown,Route1,ViridianCity,Route22,Route2,ViridianForest}.asm`
  cover the connected starting area through Pewter. Route 2's northern
  western grass is accessible through the forest; its eastern trade house
  is a separate row gate, reached from Diglett's Cave.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-5/
  and `scripts/PewterCity.asm`: `CheckEvent EVENT_BEAT_BROCK` blocks the
  eastern exit, so Route 3, Mt. Moon, Route 4 and Cerulean wait for Boulder.
  Routes 24/25 are accessible from Cerulean before Misty. No Cascade gate.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-8/
  and `scripts/BillsHouse.asm`: receiving S.S. Ticket moves the policeman
  at the burgled house, opening the southern exit to Route 5. This opens
  Underground Path, Route 6, Vermilion, Route 11 and Diglett's Cave.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-12/
  describes the cave's Route 2 exit; Mr. Mime's trade row waits for this
  access, while the original northern Route 2 grass is not delayed.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-13/
  and https://strategywiki.org/wiki/Pok%C3%A9mon_Red_and_Blue/Routes_9_and_10
  establish the Cut tree at Route 9. The connected path through Route 10,
  Rock Tunnel, Lavender, Route 8, Underground Path and Route 7 reaches
  Celadon. Route 12's north shore is already accessible from Lavender;
  its walking encounters require removing Snorlax. Route 16's northern
  grass is accessible with Cut before removing its Snorlax.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-16/
  and `scripts/{CeladonDiner,CeladonMansionRoofHouse}.asm` establish Coin
  Case and Eevee acquisition without a badge/story milestone in Celadon.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-19/
  and `scripts/Route7Gate.asm`: a vending drink opens Saffron's guards;
  no Tea event. `scripts/PokemonTower7F.asm` hides `TOGGLE_SAFFRON_CITY_E`
  when rescuing Fuji, opening Silph Co. `scripts/SilphCo7F.asm` places
  Lapras after the rival/warp-room access (not after Giovanni); its event
  includes Fuji and the drink. The Fighting Dojo gift waits for its master.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-18/
  and `scripts/{PokemonTower6F,PokemonTower7F,MrFujisHouse}.asm`: Scope
  reveals catchable ghosts; defeating ghost Marowak opens 7F, rescuing Fuji
  leads to the Flute. The ghost Marowak is not a catchable static.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-20/
  and `engine/items/item_effects.asm`: Flute wakes Route 12/16 Snorlax;
  southern Routes 13–15 or Cycling Road reach Fuchsia, Safari Zone and
  Route 19's beach. Route 17 additionally requires the Bicycle.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-22/
  and https://www.pokemon-france.com/en/guides/blue-red/walkthrough-28/
  establish Surf access to Sea Routes 20/21, Seafoam, Cinnabar/Mansion and
  Power Plant. Cinnabar is reachable directly from Pallet via Route 21,
  without solving Seafoam. Articuno additionally needs Strength's boulder
  puzzle; ordinary floor encounters are not all delayed behind Strength.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-25/
  plus `scripts/{Route22Gate,Route23}.asm`, `maps/Route23.blk`, and
  `data/maps/headers/Route23.asm`: inspected the original map rendered
  from its PLATEAU blockset (no ROM build). First water is north of Rainbow
  guard y105; first grass is north of Marsh guard y85 and south of Volcano
  y56. Thus fishing waits for Boulder/Cascade/Thunder/Rainbow, grass also
  needs Surf/Soul/Marsh. Victory Road's entrance needs all eight badges and
  Surf. 1F wild encounters precede the first Strength switch; 2F/3F and
  Moltres wait for Strength. No remake Mt. Ember location.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-29/
  establishes Hall of Fame plus Surf for Cerulean Cave, including Mewtwo;
  no Sevii quest, National Dex or catch-count requirement.

### Gifts, trades, fossils and statics

- `scripts/MtMoonPokecenter.asm`: one level-5 Magikarp for ₽500. PokeAPI
  duplicates this seller under Route 3 and Route 4 Pokémon Centers; the
  pack drops the Route 3 alias and keeps Route 4 (the actual Mt. Moon stop).
- `scripts/FightingDojo.asm`: one of Hitmonlee/Hitmonchan after the master.
  `scripts/SilphCo7F.asm`: level-15 Lapras. `scripts/CeladonMansionRoofHouse.asm`:
  level-25 Eevee. `engine/events/prize_menu.asm` checks Coin Case before
  coin exchange; `data/events/prizes.asm` supplies Red/Blue prize differences.
- `scripts/{MtMoonB2F,Museum1F,CinnabarLabFossilRoom}.asm`: Dome/Helix choice,
  Old Amber and fossil revival. PokeAPI retains required fossil/Amber
  conditions and level-30 gifts. The tracker records the mutually exclusive Dome/Helix and Dojo choices
  in their story steps, showing the skipped gift as trade-only.
- `data/events/trades.asm` and each corresponding map script verify all
  nine used trades: Nidorino→Nidorina (Route 11), Abra→Mr. Mime (Route 2),
  Ponyta→Seel (Cinnabar), Spearow→Farfetch'd (Vermilion), Slowbro→Lickitung
  (Route 18), Poliwhirl→Jynx (Cerulean), Raichu→Electrode and
  Venonat→Tangela (Cinnabar), Nidoran♂→Nidoran♀ (Route 5 Underground Path).
  The unused Butterfree→Beedrill table row is not added.
- `data/maps/objects/{PowerPlant,SeafoamIslandsB4F,VictoryRoad2F,CeruleanCaveB1F}.asm`
  verifies Power Plant's Voltorb/Electrode/Zapdos, Articuno, Moltres and
  Mewtwo. No Mew glitch or discontinued distribution encounter is invented.

### Evidence limits

StrategyWiki full-page requests returned 403; its indexed Route 9 excerpt
was available. Bulbapedia automation was not attempted. Pokémon-France was
read through the search/fetch tool; direct scripted requests returned 403
and were not retried or bypassed. No Red/Blue scanned guide is present in
the supplied guide folder. Independent access audit, emulator/gameplay and
manual browser verification remain pending. Existing covers
are reused; their original provenance was not re-established in this pass.
Tracking registration and the required species-limit entries do not enable
or establish save-file import support.


### Red/Blue Route 18 fishing access (2026-11-13)

The delayed original access audit flagged a Bicycle gate absent from its retry.
Independently checked against pret/pokered at
`130ac3fa5493fb29a8005e8439fd31b4826e46af`:

- [Route 18 gate script](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/scripts/Route18Gate1F.asm) calls `Route16Gate1FIsBicycleInBagScript` and turns the player back at gate coordinates (4,3) through (4,6) without the item. [The helper](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/scripts/Route16Gate1F.asm) explicitly checks `BICYCLE`.
- [Route 18 warps](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/objects/Route18.asm) connect gate doors (33,8)/(33,9) on the west and (40,8)/(40,9) on the east. Fuchsia's west boundary opens only at its map rows 16/17, connecting to Route 18 rows 8/9 via the [header offset](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/maps/headers/FuchsiaCity.asm). The east enclosure contains the grass and trade; the fishing shore is west of the gate.
- The independent collision trace uses pinned `maps/Route18.blk`, `maps/FuchsiaCity.blk`, `gfx/blocksets/overworld.bst` and `data/tilesets/collision_tile_ids.asm`. Starting at Route 18 (49,8)/(49,9) reaches its grass but no fishing shore. Seeding every passable map-edge tile would incorrectly admit the disconnected northern strip. The alternative northern Cycling Road entrance also requires Bicycle.

Add `bicycle` only to the seven old/good/super-rod rows in both versions.
Walking encounters and the Lickitung trade retain their existing access.
This is source and collision-model verification; no emulator play-test was run.


### Red/Blue: Cerulean fishing access audit

- Required Surf for Cerulean City's fishing rows (54, 60, 98, 118, 129). The Jynx trade is unaffected. Independently checked by the two source checks against pinned `pret/pokered` revision `130ac3fa5493fb29a8005e8439fd31b4826e46af`.
- [Fishing rules](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/engine/items/item_effects.asm): `call IsNextTileShoreOrWater` checks the facing tile, and `scf ; can't fish when surfing` rejects fishing while surfing.
- [Cerulean map](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/maps/CeruleanCity.blk), [Route 4 map](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/maps/Route4.blk), [overworld blockset](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/gfx/blocksets/overworld.bst), [collision IDs](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/tilesets/collision_tile_ids.asm) and [ledge directions](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/tilesets/ledge_tiles.asm) establish the spatial inference: on-foot entrances cannot reach the fishing shore by the cave door; Surf reaches it. This includes the Route 4 approach. Standing on Route 24 uses Route 24's encounter table. Binary-map decoding and source review were performed; emulator verification remains outstanding.

### Game Boy access audit: second-pass exclusions

The second pass inspected original scripts rather than accepting terrain-only shortcuts. Existing gates were retained for these rejected first-pass proposals:

- Red/Blue Diglett's Cave / Route 6: [Bill's ticket script](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/scripts/BillsHouse.asm) swaps the Cerulean guard (`SetEvent EVENT_GOT_SS_TICKET` then `ShowObject` / `HideObject`). A route through Route 5 does not establish access before that guard moves.
- Red/Blue Victory Road 2F: [1F script](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/scripts/VictoryRoad1F.asm) checks `EVENT_VICTORY_ROAD_1_BOULDER_ON_SWITCH` before replacing block (6,4). The 2F arrival pocket alone does not establish entry without Strength.


Yellow Cerulean fishing was subsequently settled by the static trace above (PR #122), and the Gold/Silver Mt. Mortar and Route 1 checks are settled by the static map traces above. No gate was removed on the basis of these rejected or unresolved flags.


## Open questions

- **Route 2 trade-house alternatives:** the pinned static map trace reaches
  the house at (15,19) from Diglett’s Cave without Cut, and from the western
  Route 2 entrances with Cut. Keep the existing Bill prerequisite pending
  shared support for alternative requirements (Bill’s route OR usable Cut).
  See the Route 2 trace in #sources; no gameplay confirmation was run.

- **S.S. Anne temporary access:** original dock script checks
  `EVENT_GOT_HM01` and destination warp 1 before triggering departure,
  then sets `EVENT_SS_ANNE_LEFT` (see the pinned dock source in #sources).
  Keep the fishing rows unchanged until the shared model can express
  availability ending after a story event; positive prerequisites alone
  cannot represent this. Departure timing is now source-confirmed, but
  the temporary-area presentation remains open.

### Model limits

- PokeAPI's NPC-trade levels are fixed example levels; original NPC trades
  retain the offered Pokémon's level (`engine/events/in_game_trades.asm`).
  The shared encounter row schema only supports numeric ranges, so these
  source levels are retained, not claimed as mandatory in-game levels.
  We should decide a shared variable-level presentation rather
  than introducing Red/Blue-only UI changes in this pack task.

- The shared box editor still offers later-generation metadata (gender,
  shiny and held-item fields). Red/Blue has no visible shiny art or held
  items; regular sprites intentionally fill shiny paths. Do not interpret
  these fields as original-game mechanics or save-file support. No box UI
  or save-import UI was changed in this task.
