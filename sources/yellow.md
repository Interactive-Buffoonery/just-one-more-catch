# Yellow (`yellow`)

## Sources

Pack/version `yellow`, encounter code `y`. This covers international Yellow,
not Let's Go or FireRed/LeafGreen. No save-file mapping is enabled.

Primary script references below are pinned to pret/pokeyellow commit
`b452f2ab07185075140061c5084ab866d5e4a794`:
https://github.com/pret/pokeyellow/tree/b452f2ab07185075140061c5084ab866d5e4a794
The source was read without building it. Paths below are relative to that tree.

### Metadata, progression and access

- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Yellow
  identifies the original Game Boy game and the area's progression order.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Yellow/Part_3
  and `scripts/PewterCity.asm`: Brock blocks the east exit, so Route 3,
  Mt. Moon, Route 4, Cerulean and Routes 24/25 follow Boulder. Route 22 and
  both western Route 2 grass sections are accessible beforehand.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Yellow/Part_5
  and `scripts/BillsHouse.asm`: helping Bill opens the burgled-house passage
  to Route 5, the Underground Path, Route 6 and Vermilion. Route 11 and
  Diglett's Cave are accessible from Vermilion without defeating Lt. Surge.
- https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_2
  establishes the eastern Mr. Mime house can be reached through Diglett's
  Cave, whereas the northern grass is reachable through Viridian Forest
  before Brock. Only the trade row, not northern grass, requires Bill.
- https://www.supercheats.com/gameboy/walkthroughs/pokemonyellow-walkthrough07.txt
  sections Route 9 through Celadon, Route 12 through Fuchsia, Sea Routes 19–21,
  Power Plant and Victory Road supply the physical connections: Cut opens
  Route 9; Rock Tunnel leads to Lavender, Routes 8/7 and Celadon. Route 12's
  northern fishing pier and Route 16's Cut-access grass open before Snorlax.
  Flash lights Rock Tunnel but is not a physical-access requirement.
  This older walkthrough's claims about Misty unlocking Bulbasaur and Nugget
  Bridge are contradicted by the original scripts; they are not used.
- `engine/menus/start_sub_menus.asm` checks `BIT_CASCADEBADGE` for Cut,
  `BIT_SOULBADGE` for Surf, `BIT_RAINBOWBADGE` for Strength. These are the
  modeled HM gates. Fly/Flash do not unlock encounter areas and are omitted
  from the kit. `scripts/{VermilionOldRodHouse,FuchsiaGoodRodHouse,
  Route12SuperRodHouse,SSAnneCaptainsRoom,SafariZoneSecretHouse,
  WardensHouse}.asm` source rods, Cut, Surf and Strength acquisition.
- `scripts/Route5Gate.asm` and `engine/events/saffron_guards.asm`: Saffron
  opens with Fresh Water, Soda Pop or Lemonade, not the remakes' Tea.
- `engine/battle/core.asm` checks `SILPH_SCOPE` to identify tower ghosts.
  `scripts/PokemonTower6F.asm` makes Marowak the 7F blocker; tower encounters
  are grouped after obtaining the Scope, and 7F additionally needs Marowak.
- `scripts/{MrFujisHouse,Route12,Route16}.asm` and
  `engine/items/item_effects.asm` source the Poké Flute and Snorlax.
  The southern land routes, Fuchsia, Safari Zone and Route 19 beach follow
  the Flute; sea routes, Seafoam, Cinnabar/Mansion and Power Plant need Surf.
  Route 17 also needs the Bicycle (`scripts/Route16Gate1F.asm`).
- https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_23 and
  `scripts/{Route22Gate,Route23}.asm`: Boulder admits entry; the Rainbow
  checkpoint is on the southern bank. Fishing rows require the first four
  badges, while grass beyond the water and Marsh checkpoint also needs
  Soul, Marsh and Surf. Victory Road entry requires all eight badges plus
  Surf; 2F/3F require the 1F Strength switch (`scripts/VictoryRoad1F.asm`).
- https://bulbapedia.bulbagarden.net/wiki/Seafoam_Islands and
  `scripts/SeafoamIslandsB4F.asm`: Articuno is beyond the boulder/current
  puzzle and needs Strength. Ordinary cave-floor encounters are not all
  gated by the puzzle, since the western entrance is reachable via Pallet,
  Route 21 and Cinnabar with Surf.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Yellow/Part_17
  sources post-League Cerulean Cave access and Surf to its entrance.
- `constants/pokedex_constants.asm` ends with `DEX_MEW ; 151`;
  `constants/pokemon_data_constants.asm` defines 12 boxes of 20 for the
  international game. The regional/national bound is 151. `scripts/*Gym.asm`
  and `text/*Gym.asm` source Brock/Boulder, Misty/Cascade, Lt. Surge/Thunder,
  Erika/Rainbow, Koga/Soul, Sabrina/Marsh, Blaine/Volcano, Giovanni/Earth.

### Dock departure timing follow-up

- [VermilionDock.asm, lines 1–11 and 39–40](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/VermilionDock.asm#L1-L40):
  `CheckEventReuseHL EVENT_GOT_HM01` followed by `ret z` prevents departure
  before collecting HM01, and lines 7–9 (`cp $1` / `ret nz`) limit it to
  arriving from the ship; the departure routine sets `EVENT_SS_ANNE_LEFT`.
  [SSAnne1F objects, lines 9–10](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SSAnne1F.asm#L9-L10)
  warp to `VERMILION_DOCK, 2` (zero-based `$1`);
  [VermilionDock objects, lines 5–6](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/VermilionDock.asm#L5-L6)
  list the city exit first and the ship second.
  [VermilionCity.asm, lines 177–180](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/VermilionCity.asm#L177-L180)
  checks that departure flag before admitting the player. This establishes
  the departure trigger, not a complete Super Rod acquisition/access route;
  the timing question remains open and encounter data is unchanged.

### Yellow static map trace (PR #122)

A scratch Python BFS decoded the pinned source above, without building the game.
Coordinates below are zero-based 16-pixel map squares `(x,y)`. It expanded each
32-pixel `.blk` block through the matching `.bst` blockset and sampled the
bottom-left tile of each square (block offsets 4, 6, 12, 14). It applied
passable-tile lists, symmetric land/water tile-pair barriers, directional ledge
jumps, map-connection offsets and one-based warp destinations. This is static
map evidence, not gameplay or a reproduction of every movement script.

Decoder references: [constants/map_constants.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/constants/map_constants.asm), [gfx/blocksets/overworld.bst](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/gfx/blocksets/overworld.bst), [gfx/blocksets/forest.bst](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/gfx/blocksets/forest.bst), [gfx/blocksets/cavern.bst](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/gfx/blocksets/cavern.bst), [gfx/blocksets/ship_port.bst](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/gfx/blocksets/ship_port.bst), [data/tilesets/collision_tile_ids.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/tilesets/collision_tile_ids.asm), [data/tilesets/pair_collision_tile_ids.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/tilesets/pair_collision_tile_ids.asm), [data/tilesets/ledge_tiles.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/tilesets/ledge_tiles.asm), [home/overworld.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/home/overworld.asm), [engine/overworld/player_state.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/engine/overworld/player_state.asm).
The fishing check uses `IsNextTileShoreOrWater` (tiles `$48`, `$32`, `$14`,
only `$14` at the dock) and `FishingInit` rejects fishing while surfing:
[data/tilesets/water_tilesets.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/tilesets/water_tilesets.asm), [engine/items/item_effects.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/engine/items/item_effects.asm#L2108-L2138), [engine/items/item_effects.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/engine/items/item_effects.asm#L3118-L3137).

- **Safari grass settled; existing data preserved.** With every object tile
  blocked, no Surf/Strength/Cut and start Center `(14,24)`, grass `$20` is
  reachable at Center `(12,23)` in 3 steps and North `(27,31)` in 136 steps.
  The North witness crosses Center east warp 8 to East `(0,23)`, then East
  warp 2 to North `(39,31)`. Both fit within the Safari step budget; no rest
  house, water, item pickup or boulder movement is used. Reachable grass
  squares: Center 189, East 162, North 229, West 54. Thus neither Middle nor
  Area 2 North needs an extra HM gate. Files: [maps/SafariZoneCenter.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/SafariZoneCenter.blk), [maps/SafariZoneNorth.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/SafariZoneNorth.blk), [maps/SafariZoneEast.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/SafariZoneEast.blk), [maps/SafariZoneWest.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/SafariZoneWest.blk), [data/maps/objects/SafariZoneCenter.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SafariZoneCenter.asm#L7-L15), [data/maps/objects/SafariZoneEast.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SafariZoneEast.asm#L10-L14), [data/maps/objects/SafariZoneNorth.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SafariZoneNorth.asm#L8-L16), [data/maps/objects/SafariZoneWest.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SafariZoneWest.asm).
- **Cerulean fishing settled; add Surf to five fishing rows.** The no-Surf
  search includes Cerulean, Routes 4/24/25/9/5, connections and ledges, and
  gives the player the house passages and cleared NPCs as an upper bound.
  There is no reachable Cerulean land tile facing a fishing tile. Routes 24
  and 25 do have reachable fishing banks; those are separate encounter maps.
  With Surf, a second search retaining every object blocker from Route 24
  `(5,18)` reaches the Cerulean bank `(2,13)`, facing water `(2,14)`; seven
  Cerulean land positions allow fishing. This independently reproduces the
  earlier static traces and resolves the unsupported first-pass
  claim based on the unrelated Bulbasaur script. Only fishing is gated;
  Bulbasaur still uses happiness. Files: [maps/CeruleanCity.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/CeruleanCity.blk), [maps/Route4.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/Route4.blk), [maps/Route24.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/Route24.blk), [maps/Route25.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/Route25.blk), [maps/Route9.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/Route9.blk), [maps/Route5.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/Route5.blk), [data/maps/headers/CeruleanCity.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/headers/CeruleanCity.asm#L1-L6), [data/maps/headers/Route4.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/headers/Route4.asm), [data/maps/headers/Route24.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/headers/Route24.asm), [data/maps/headers/Route25.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/headers/Route25.asm), [data/maps/headers/Route9.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/headers/Route9.asm), [data/maps/headers/Route5.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/headers/Route5.asm), [data/maps/objects/CeruleanCity.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/CeruleanCity.asm).
- **Seafoam ordinary floors settled; existing data preserved.** From the west
  entrance 1F `(4,16)`, with every boulder/object blocked and no Surf inside,
  dry floor `$05` is reached at 1F `(6,10)`, B1F `(6,5)`, B2F `(12,7)`,
  B3F `(4,12)` and B4F `(10,7)`. The B4F witness takes 74 graph edges and
  uses ladders 1F `(7,5)` -> B1F `(7,5)`, B1F `(13,7)` -> B2F `(13,7)`,
  B2F `(5,13)` -> B3F `(5,12)`, B3F `(8,6)` -> B4F `(11,7)`.
  This witness avoids all holes, water and forced-current trigger squares;
  no Strength is needed for ordinary floor encounters. Surf remains necessary
  to reach the island outside. The east entrance also reaches B1F/B2F/B3F
  dry floor but the dry graph does not reach B4F from that side.
  Files: [maps/SeafoamIslands1F.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/SeafoamIslands1F.blk), [maps/SeafoamIslandsB1F.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/SeafoamIslandsB1F.blk), [maps/SeafoamIslandsB2F.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/SeafoamIslandsB2F.blk), [maps/SeafoamIslandsB3F.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/SeafoamIslandsB3F.blk), [maps/SeafoamIslandsB4F.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/SeafoamIslandsB4F.blk), [data/maps/objects/SeafoamIslands1F.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SeafoamIslands1F.asm), [data/maps/objects/SeafoamIslandsB1F.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SeafoamIslandsB1F.asm), [data/maps/objects/SeafoamIslandsB2F.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SeafoamIslandsB2F.asm), [data/maps/objects/SeafoamIslandsB3F.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SeafoamIslandsB3F.asm), [data/maps/objects/SeafoamIslandsB4F.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SeafoamIslandsB4F.asm); cave encounter rule: [engine/battle/wild_encounters.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/engine/battle/wild_encounters.asm#L35-L72), [data/wild/maps/SeafoamIslandsB4F.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/wild/maps/SeafoamIslandsB4F.asm).
- **Articuno narrowed.** An optimistic Surf graph can reach adjacent squares,
  even with selected current triggers excluded. That is not a proof of the
  actual approach: Surf state changes, forced movement and hole landings
  are not simulated. Retain Strength and the tester question. Files:
  [data/maps/force_bike_surf.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/force_bike_surf.asm#L11-L14), [scripts/SeafoamIslandsB3F.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/SeafoamIslandsB3F.asm), [scripts/SeafoamIslandsB4F.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/SeafoamIslandsB4F.asm#L86-L137).
- **Dock narrowed.** Dock land `(14,1)` faces water `(13,1)` without Surf.
  Route 12's north-gate exit `(10,22)` reaches Super Rod house warp 4 after
  clearing Snorlax; with blockers present it does not. The house gives the
  rod without another story check. This does not establish a full route
  obtaining Cut and the rod while retaining dock admission, so the three
  Super Rod rows remain unchanged. Files: [maps/VermilionDock.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/VermilionDock.blk), [data/maps/objects/VermilionDock.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/VermilionDock.asm), [maps/Route12.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/Route12.blk), [data/maps/objects/Route12.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/Route12.asm#L16-L30), [scripts/Route12SuperRodHouse.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/Route12SuperRodHouse.asm#L8-L27).
- **Sanity check.** From Route 10 `(11,20)` by the Pokémon Center, the same
  search cannot reach Power Plant without Surf; enabling Surf reaches its
  entrance at Route 10 `(6,39)`. This agrees with the previously cited
  Power Plant walkthrough requirement. Files: [maps/Route10.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/Route10.blk), [data/maps/objects/Route10.asm](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/Route10.asm#L11-L15), [maps/PowerPlant.blk](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/PowerPlant.blk).

### Gifts, statics, trades and generation differences

- https://www.serebii.net/yellow/gift.shtml plus `scripts/OaksLab.asm`:
  Pikachu Lv 5 in Pallet is the only starter. `scripts/CeruleanMelaniesHouse.asm`
  checks `cp 147` before giving Bulbasaur Lv 10; `scripts/Route24.asm` gives
  Charmander Lv 10 without a badge condition; `scripts/VermilionCity_2.asm`
  checks `BIT_THUNDERBADGE` before giving Squirtle Lv 10.
- `scripts/CeladonMansionRoofHouse.asm` gives Eevee Lv 25 without a story
  gate. `data/events/prizes.asm` sources Abra 230, Vulpix 1000, Wigglytuff
  2680, Scyther/Pinsir 6500 and Porygon 9999 coins. Those PokeAPI conditions
  are preserved. `scripts/FightingDojo.asm` offers one of Hitmonlee/Hitmonchan
  after the Karate Master. The tracker records this choice and the Mt. Moon fossil choice in story
  steps, showing the skipped gift as trade-only.
- `scripts/PokemonTower7F.asm` removes the Silph entrance blocker after Fuji
  is rescued. `scripts/SilphCo7F.asm` and its rival trigger coordinates source
  Lapras Lv 15 after the rival. No badge substitutes for these story events.
- `scripts/CinnabarLabFossilRoom.asm` requires Dome/Helix Fossil/Old Amber and
  revives at Lv 30 after leaving the lab. PokeAPI's item conditions are kept.
  The Route 3/Route 4 Pokémon Center Magikarp records refer to the same
  Mt. Moon entrance seller (`scripts/MtMoonPokecenter.asm`); both map to the
  Route 4 Pokémon Center and merge to one row.
- `data/events/trades.asm` contains all seven used Yellow trades: Clefairy
  for Mr. Mime; Cubone for Machoke; Lickitung for Dugtrio; Tangela for
  Parasect; Golduck for Rhydon; Growlithe for Dewgong; Kangaskhan for Muk.
  Unused trade entries are not added. PokeAPI preserves requested species.
- `data/maps/objects/{PowerPlant,VictoryRoad2F,SeafoamIslandsB4F,
  CeruleanCaveB1F}.asm` source Voltorb/Electrode and the four legendary
  statics. Moltres belongs to Victory Road, not Mt. Ember.
- `data/pokemon/evos_moves.asm` has no baby pre-evolutions. The generator
  suppresses later-generation parents only in Generation I and leaves other
  packs unchanged. `engine/items/item_effects.asm` explicitly rejects the
  starter Pikachu's evolution stone; Raichu's text explains traded Pikachu.
  Magnemite/Magneton are pure Electric (`data/pokemon/base_stats/*.asm`),
  and Clefairy/Jigglypuff are Normal, Mr. Mime Psychic. PokeAPI's past types
  already supplies these correctly. `scripts/check_yellow.mjs` guards these
  cases plus floor odds and gift/legendary gates.
- All Yellow PokeAPI methods, conditions, levels and odds were inspected from
  the cached `pokemon/*/encounters` endpoints. Cave/tower floors stay distinct
  through pack-specific renames, avoiding summed odds across floors. PokeAPI
  calls Rock Tunnel's floors `b1f`/`b2f`; their complete wild tables match
  `data/wild/maps/RockTunnel1F.asm` / `RockTunnelB1F.asm` respectively,
  so Yellow displays them as 1F/B1F.
- https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-i/yellow/transparent
  supplies regular sprites 1–151, verified through GitHub's directory API.
  There is no shiny directory. Yellow has no shiny variants or collectible
  forms: its shiny asset paths intentionally serve the identical original
  art so generic tracker controls never request nonexistent sprites.
  Existing `public/covers/y.jpg` supplies the picker and generated page cover.

No Yellow guide PDF is present in the supplied iCloud guide folder. Bulbapedia
walkthrough parts 7 and 11 returned 403; no bypass was attempted. The accessible
walkthrough and original scripts above were used instead. Independent access review remains pending.

Integration note: Yellow's Cut kit id/icon is `yellow-cut` to avoid colliding
with FRLG's existing `cut` story event. It still displays as Cut and requires
Cascade.


### Yellow: Route 12 grass access

Static traces show that the seven Route 12 walking species (16, 17, 43, 44, 69, 70, 83) require `flute`. All grass lies south of the Snorlax; the northern bank remains available for fishing. Sources at pinned `pret/pokeyellow` revision `b452f2ab07185075140061c5084ab866d5e4a794`: [Route 12 objects](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/Route12.asm), with `object_event 10, 62, SPRITE_SNORLAX`, and the [Route 12 map](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/Route12.blk). The independent source model included Cut and both Route 12/16 Snorlax blockers; the Route 16 Cut enclosure is not a bypass onto Cycling Road. Fishing and Surf rows are unchanged.

Additional rejected proposals: Yellow's [Route 2 warp table](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/Route2.asm) includes both Diglett's Cave and the trade house. The Diglett exit reaches the house without Cut, supporting the existing Bill requirement. Gold/Silver's [Lake of Rage](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/LakeOfRage.asm) only shows Lance after the Red Gyarados encounter (`appear LAKEOFRAGE_LANCE`); reaching Mahogany on foot does not establish Surf-free hideout access.


- Static tracing confirms ordinary Seafoam floor access from the west without Strength.

- Yellow [Silph Co. 7F](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/SilphCo7F.asm) checks `EVENT_BEAT_SILPH_CO_RIVAL` in the same isolated room as Lapras. The existing `silph-rival` requirement already entails reaching that room through the key doors; no separate Card Key event was added.

## Open questions

- **S.S. Anne dock timing:** departure requires HM01 and stepping off the
  ship: the pinned
  [dock script](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/VermilionDock.asm#L1-L11)
  returns before departure when `EVENT_GOT_HM01` is unset or the arrival warp
  is not `$1`, which only
  [SS Anne 1F](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SSAnne1F.asm#L9-L10)
  uses (`VERMILION_DOCK, 2`; the city entrance is warp 1 in the
  [dock objects](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/VermilionDock.asm#L5-L6)).
  Departure sets `EVENT_SS_ANNE_LEFT` at line 40. This narrows the remaining
  question to obtaining the Super Rod while preserving dock access (including how Cut is
  supplied). The three Super Rod rows (72, 90, 120) remain unchanged. Verify
  that complete route before settling availability. Static tracing confirms
  fishing from dock land `(14,1)` without Surf and the Super Rod house from
  Route 12 once Snorlax is removed; it does not establish how Cut is supplied
  while preserving the ship. See [Sources](#sources);
  post-departure access remains refused by the
  [guard](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/VermilionCity.asm#L177-L180).


- **Articuno from the west:** the pinned static trace reaches dry B4F floor
  `(10,7)` without Strength, and an optimistic Surf graph reaches Articuno.
  That graph does not simulate Surf state or forced movement. The unresolved
  part includes forced Surf at `(4,14)` / `(5,14)` and its movement script, not
  reaching B4F. Retain Strength until that scripted approach is verified.
  Sources: [forced Surf tiles](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/force_bike_surf.asm#L11-L14),
  [B4F movement](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/SeafoamIslandsB4F.asm#L86-L137).


- No Yellow guide PDF was supplied. Bulbapedia Yellow walkthrough parts 7 and
  11 returned HTTP 403. No access-control bypass was attempted; accessible
  walkthroughs and original pret/pokeyellow scripts were used instead.

### Model limits

- The shared tracker can mark shininess/gender even for Generation I. This
  implementation does not redesign those controls. Yellow supplies identical
  original sprites at regular/shiny paths because the game has no shiny
  palette; it supplies no alternate forms. We should independently
  verify the desired Gen 1 control behaviour across Red/Blue and Yellow.
