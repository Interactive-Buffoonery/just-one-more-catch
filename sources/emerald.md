# Emerald (`emerald`)

## Sources

Pack/version ID: `emerald`, encounter code `e`. This is the original Game Boy
Advance game. Ruby and Sapphire remain separate Coming Soon entries.

- Encounter species, levels, odds, methods, regional numbering and historical
  types: https://pokeapi.co/api/v2/version/9/ and
  https://pokeapi.co/api/v2/pokedex/4/ through the cached data pipeline.
- Chapter places and access: https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Emerald
  Parts 1–2 cover the opening and Peeko/Devon Letter; Part 3 covers Briney's
  Dewford/Slateport voyage and Granite Cave; Parts 4–5 cover the Museum,
  Mauville and Verdanturf; Parts 6–8 cover Rock Smash, Mt. Chimney, Lavaridge,
  Go-Goggles and Mirage Tower; Parts 9–12 cover Surf, Route 118/123, New
  Mauville, Weather Institute, Devon Scope, Safari Zone and Mt. Pyre;
  Parts 13–18 cover the submarine, eastern ocean, Dive, Seafloor Cavern,
  Sootopolis, Regis, Rayquaza and Victory Road. Parts 20–22 cover postgame
  gifts, weather caves, Battle Frontier and historical distribution islands.
  Each chapter/event/gate in `data/emerald.json` links its relevant part.
- Victory Road B2F earliest encounter: **Strength and Rock Smash are both
  required**. Static map BFS at the pinned revision below, not gameplay:
  - Decoded the little-endian `map.bin` blocks for
    [1F](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/data/layouts/VictoryRoad_1F/map.bin),
    [B1F](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/data/layouts/VictoryRoad_B1F/map.bin), and
    [B2F](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/data/layouts/VictoryRoad_B2F/map.bin).
    [Block masks](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/include/global.fieldmap.h#L7-L46)
    give metatile ID, collision and elevation; layouts use General/Cave
    [tilesets](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/src/data/tilesets/metatiles.h#L1-L2)
    ([Cave attributes](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/src/data/tilesets/metatiles.h#L58-L59)).
    Used their metatile behaviours, directional barriers, elevation transitions,
    one-way ledges, warp destinations and object events; all three maps have
    no map connections. Water was excluded from this land-entry trace.
    Movement follows the engine's [collision checks](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/src/event_object_movement.c#L4641-L4654)
    and [ledge/elevation rules](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/src/event_object_movement.c#L7631-L7689).
  - Southern 1F entrance (15,40) reaches ladder (9,14), then B1F (8,3).
    Push [boulders (4,7) west and (9,10) east](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/data/maps/VictoryRoad_B1F/map.json#L43-L68),
    clear the [rock (18,12), `FLAG_TEMP_1B`](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/data/maps/VictoryRoad_B1F/map.json#L134-L145),
    cross the raised walkway via (21,9) to (32,9), and descend at (32,12).
    Ladder (30,25) reaches B2F (30,25); stepping south to (30,26) reaches
    `MB_CAVE`, which [permits land encounters](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/src/metatile_behavior.c#L9-L20).
    The [B2F land table](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/src/data/wild_encounters.json#L7394-L7401)
    has encounter rate 10.
  - Exhausted both external 1F starts, (15,40) and (39,5), under all four
    Strength/Rock Smash combinations: neither alone reaches B2F. Negative
    runs allowed trainers/items/Wally to be absent, kept rocks present without
    Rock Smash, and searched legal boulder pushes with Strength. A positive
    southern path also succeeds with all NPC/item positions blocked; Wally's
    [ordinary battle](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/data/maps/VictoryRoad_1F/scripts.inc#L40-L53)
    does not prevent passage. B1F (42,25) could reach B2F
    without either tool, but neither external start reaches that B1F arrival
    without the tools. Thus it is not an earlier alternate entrance.
  - Each [B2F arrival](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/data/maps/VictoryRoad_B2F/map.json#L109-L138)
    has adjacent land encounters: (30,26), (43,3), (19,13), (6,26), respectively.
    Sanity check: without Strength, even with rocks removed, the southern
    trace stops before the initial boulder puzzle; enabling Strength reproduces
    the existing Part 18 west/east boulder directions. This agrees with the
    engine's [Strength push rule](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/src/field_player_avatar.c#L754-L775).
- Primary source pinned to pret/pokeemerald
  `731ad5bfd6e6f265508d0efcca0ba42f9dcf5881`:
  https://github.com/pret/pokeemerald/tree/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881
  No ROM was built or used.
- HM badge order (Cut/Stone, Flash/Knuckle, Rock Smash/Dynamo,
  Strength/Heat, Surf/Balance, Fly/Feather, Dive/Mind, Waterfall/Rain):
  `src/party_menu.c`, `sFieldMoveBadgeRequirements`. Gym names/leaders:
  `data/maps/*Gym/scripts.inc`, including Juan in Sootopolis and Tate/Liza
  in Mossdeep. This pack exposes catch-relevant travel tools; Fly isn't an
  encounter access requirement.
- 14 boxes of 30: `include/pokemon_storage_system.h` (`TOTAL_BOXES_COUNT`)
  (`IN_BOX_COUNT`, 5 rows × 6 columns). 202 Hoenn / 386
  National: `include/constants/pokedex.h`. Starting gifts Treecko, Torchic,
  Mudkip: `src/starter_choose.c` and `data/maps/Route101/scripts.inc`.
- Gifts, fossils, trades and events were checked in `data/maps/` scripts:
  `DewfordTown`, `RustboroCity_DevonCorp_2F`, `RustboroCity_House1`,
  `Route119_WeatherInstitute_2F`, `LavaridgeTown`,
  `MossdeepCity_StevensHouse`, `LittlerootTown_ProfessorBirchsLab`,
  `SkyPillar_Outside`, `SkyPillar_Top`, `LilycoveCity`,
  `BattleFrontier_OutsideEast`, and `SeafloorCavern_Room9`.
  Beldum needs the Hall of Fame; Johto starters require Birch's completion
  reward; fossils require possession; Latias/Latios follow the red/blue TV
  choice; Rayquaza can be caught before the League after ending the crisis.
- Feebas: `src/wild_encounter.c`, `FishingWildEncounter` calls `CheckFeebas`
  before selecting the rod's ordinary encounter table, so any rod works.
  Underwater seaweed requires Dive; static Kecleon requires the Devon Scope;
  Battle Frontier Sudowoodo requires the Wailmer Pail.
- Historical pre-evolutions and stone/beauty evolution text:
  `src/data/pokemon/evolution.h`, `src/pokemon.c` (friendship clock windows),
  and `src/evolution_scene.c` (Shedinja needs a free slot, no spare ball). Budew, Chingling, Munchlax, Bonsly, Mime Jr.
  and Happiny do not exist in this generation.
- Excluded PokeAPI artifacts: `Team Magma Hideout` is the Ruby duplicate,
  not Emerald's `Magma Hideout`; Cave of Origin B1F is Wallace's room with
  no wild encounters and B2F/B3F are unused. Retain Entrance and 1F.
  `Hoenn Pokecenter` bonus-distribution rows are not ordinary encounters.
- Art: https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-iii/emerald
  provides static regular and shiny sprites for all 386 species. Hoenn
  badge sprites are PokeAPI IDs 17–24. Existing `public/covers/e.jpg` is reused.
- No Emerald official guide PDF was available in the local guide collection.
  Event islands require historical distribution items (Old Sea Map was
  distributed for Japanese Emerald); tracking them does not imply modern
  availability. Save-file import remains separately unsupported.
- Independent access corrections: the Weather Institute clears Route 119's
  bridge blockers (`data/maps/Route119/map.json`,
  `Route119_WeatherInstitute_2F/scripts.inc`); New Mauville's populated
  entrance precedes the key door (`NewMauville_Entrance/map.json` and
  `scripts.inc`); Mirage Tower 1F has the same wild species before the
  summit's bike/rock puzzles (`src/data/wild_encounters.json`).
  Southern Island's scripts select the opposite `VAR_ROAMER_POKEMON` species.
  Route 123's western Berry Master section has no encounter tiles: verified
  from `data/layouts/Route123/map.bin`, its General/Lilycove metatile
  attributes and `include/global.fieldmap.h` collision bits. The western
  connection reaches at most x=41; grass begins at x=49, beyond westbound
  ledges. Its encounters therefore stay with the later Route 122 approach.


## Open questions

None right now.
