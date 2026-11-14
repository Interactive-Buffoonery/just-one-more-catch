# Ruby and Sapphire (`rs`)

## Sources

Original Game Boy Advance versions `ruby` / `sapphire`, encounter codes `R` /
`S`. The 13 chapters, 19 events and area/row requirements in `data/rs.json`
were sourced separately from Emerald. Each entry links its relevant source.

- Open-question source verification (original R/S, no ROM/build):
  https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/time_events.c#L54-L91
  `UpdateShoalTideFlag`: hourly table is clear at 03–08 and 15–20;
  lines 84–90 check the last warp map type before calculating local time
  and setting/clearing `FLAG_SYS_SHOAL_TIDE`. This narrows the missing tide
  model: wall-clock time alone does not continuously update the cave.
  https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/LilycoveCity/scripts.inc#L30-L56
  Line 31 calls `RemoveEvilTeamBaseEntrance` when `FLAG_BADGE07_GET` is set;
  lines 49–56 replace entrance tiles with rock walls with collision enabled.
  This independently confirms closure; no shared access-expiry feature is
  added by this pack-only investigation.
- PokeAPI cached encounters, original Hoenn numbering (202), national bound
  (386), generation-III types and species:
  https://pokeapi.co/api/v2/pokedex/4/ and cached Pokémon encounter endpoints.
  The supplied cache lacked `pokedex_4.json`; only that response was fetched.
  No bulk PokeAPI fetch or scripted Bulbapedia request was made.
- Cached walkthrough:
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ruby_and_Sapphire
  Parts 1–3 establish Route 101 starters (Treecko, Torchic, Mudkip), the
  opening through Rustboro, the Slakoth-for-Makuhita trade, Rusturf Tunnel,
  Peeko and the Devon Letter. Part 4 establishes Dewford/Route 106, every
  Granite Cave floor and Steven's Letter delivery before Briney's Slateport
  destination; Flash is helpful for navigation, not an entry requirement.
  Parts 5–6 establish Route 109, Slateport, the Museum, Route 110, Mauville,
  Route 117 and the west shore of Route 118. Parts 7–8 establish Rock Smash
  through Route 111 to Route 112, Fiery Path, Fallarbor, Route 114 and Meteor
  Falls. Part 9 establishes the version-specific boss at Mt. Chimney,
  Jagged Pass, Lavaridge's Wynaut Egg and Go-Goggles after Flannery.
- Part 10: desert access requires Go-Goggles; the Root/Claw Fossils are a
  choice, revived at Devon into Lileep/Anorith. Norman and Wally's father
  provide Surf access; Wattson gives the Basement Key after the Balance
  Badge. New Mauville's entrance precedes its locked inner door.
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ruby_and_Sapphire/Part_10
- Part 8 explicitly says Route 115's only tall grass is in the north and
  cannot be reached without Surf. Fishing remains available earlier.
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ruby_and_Sapphire/Part_8
- Route 118: west beach is reachable from Mauville; the inlet separates it
  from the eastern tall grass. Only walking rows receive a Surf gate.
  https://bulbapedia.bulbagarden.net/wiki/Hoenn_Route_118
- Part 11: Route 119, Weather Institute rescue and Castform, Fortree's
  Pikachu-for-Skitty trade, and Devon Scope. The bridge Grunts block Fortree
  until rescue; the Scope clears the Route 120 bridge. Ordinary wild
  Kecleon rows do not require the Scope; its static encounters do.
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ruby_and_Sapphire/Part_11
- Part 12: Route 121, Safari Zone (northwest Mach Bike, northeast Acro Bike),
  Mt. Pyre and Route 122/123. Route 123's eastern grass is reached from Route
  122; its westward ledges lead to the Berry Master's western terminus.
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ruby_and_Sapphire/Part_12
  https://bulbapedia.bulbagarden.net/wiki/Hoenn_Route_123
- Parts 13–14: submarine theft unlocks the Lilycove hideout; Ruby uses Magma
  and Sapphire Aqua. Defeating Tabitha/Matt releases the eastern ocean
  blocker. Parts 15–18 establish Mossdeep, Dive, Shoal Cave, Seafloor Cavern,
  Sootopolis and the Cave of Origin (Groudon in Ruby, Kyogre in Sapphire),
  Wallace's Rain Badge, Routes 129–131, Mirage Island and Pacifidlog's
  Bellossom-for-Corsola trade. Part 19 establishes Routes 132–134 and the
  Sealed Chamber; Part 20 establishes the individual Regi puzzles and
  western sea routes/Abandoned Ship (reachable with Surf before the League).
  Each relevant part is linked in the pack config. The three chamber-open
  events represent completion of their full puzzle, including the Sealed
  Chamber, instead of pretending that reaching a location unlocks a Regi.
- Meteor Falls' back rooms and Bagon room need Surf + Waterfall:
  https://bulbapedia.bulbagarden.net/wiki/Meteor_Falls
  Part 15's Shoal Cave Chamber 4 requires Strength before descending into
  the ice room (PokeAPI B3F). Part 21 describes Victory Road: B1F is reachable
  before its boulders, while the described descent to B2F uses Strength and
  Rock Smash. The static original-map trace below independently confirms
  both are needed for the earliest B2F encounter tile from either entrance.
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ruby_and_Sapphire/Part_21
- Sky Pillar is postgame in R/S: “blocked off by walls of rocks until the
  player enters the Hall of Fame.” Mach Bike is needed past 1F, including
  Rayquaza's apex. Part 23 gives the floor route and roaming TV report:
  Latios in Ruby, Latias in Sapphire, without Emerald's red/blue choice.
  https://bulbapedia.bulbagarden.net/wiki/Sky_Pillar
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ruby_and_Sapphire/Part_23
- Badges/leaders and field HMs are sourced from walkthrough Parts 3, 4, 6,
  9, 10, 11, 15 and 17 plus the Badge page. Cut/Stone, Flash/Knuckle,
  Rock Smash/Dynamo, Strength/Heat, Surf/Balance, Fly/Feather, Dive/Mind,
  Waterfall/Rain. Wallace is Gym Leader and Steven the Champion (Part 22).
  The pack exposes catch-relevant tools and both Rydel bikes (Part 6).
  https://bulbapedia.bulbagarden.net/wiki/Badge
- RTC with no changing overworld lighting or time-specific wild encounter
  tables: https://bulbapedia.bulbagarden.net/wiki/Time (Generation III).
  Berries, Shoal Cave's six-hour tides and Mirage Island use the clock.
  No `nightFrom` or invented day/night conditions are added. Automatic tide
  restrictions are not modelled; see #open-questions.
- Original R/S static map trace (no gameplay), using the pinned revision below:
  a scratch Python decoder, run with `python3 -I`, reads little-endian
  16-bit layout blocks: metatile ID bits 0–9, collision bits 10–11 and
  elevation bits 12–15. IDs below 512 use the primary attributes; the rest
  use secondary attributes. Attribute bits 0–7 select tile behaviour;
  `sTileBitAttributes` distinguishes encounter land from surfable water.
  BFS follows cardinal movement, elevation-0 stairs, elevation-15 bridges,
  directional walls and one-way ledge jumps, map connection offsets and
  elevation-matched warps. Coordinates here are zero-based map coordinates.
  - Format and movement definitions:
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/include/global.fieldmap.h#L7-L20
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/fieldmap.c#L389-L407
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/metatile_behavior.c#L5-L44
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/event_object_movement.c#L4460-L4480
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/event_object_movement.c#L7485-L7547
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/event_object_movement.c#L7586-L7598
  - Layout dimensions/tilesets come from `data/layouts/layouts.json`;
    `data/tilesets/metatiles.inc` supplies attribute paths. Decoded inputs:
    `data/layouts/{VictoryRoad_1F,VictoryRoad_B1F,VictoryRoad_B2F,Route118,Route122,Route123}/map.bin`,
    `data/tilesets/primary/general/metatile_attributes.bin` and
    `data/tilesets/secondary/{cave,mauville,lilycove}/metatile_attributes.bin`.
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/layouts/layouts.json
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/tilesets/metatiles.inc
  - **Victory Road B2F confirmed:** BFS starts separately at 1F's southern
    (15,40) and northern (39,5) entrances and crosses all reachable ladders.
    Neither reaches a B2F encounter tile with Strength alone or Rock Smash
    alone. For these negative checks, NPCs/items are omitted; Strength even
    removes every boulder, an intentionally more permissive bound than legal
    pushing. Breakable rocks stay solid without Rock Smash, boulders stay
    solid without Strength (their flags and positions come from `map.json`).
    The B1F rock (18,12) blocks the southern Strength-only search; the northern
    search stops at the rock/boulder pair at (20,25)/(21,25) and
    (21,26)/(20,26). No scripted B1F map transition removes these blockers.
    A separate positive BFS retains NPCs/items, pushes boulders one tile at
    a time into free tiles and permits Rock Smash; it reaches B1F (30,25),
    warps to B2F (30,25), then steps onto encounter floor (30,26).
    Positive search restricts boulder displacement to two tiles from their
    initial positions to keep the scratch search bounded; this restricts
    witnesses only, not the negative proofs. Existing needs stay unchanged.
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/VictoryRoad_1F/map.json
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/VictoryRoad_B1F/map.json
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/VictoryRoad_B1F/scripts.inc#L1-L2
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/VictoryRoad_B2F/map.json
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/field_player_avatar.c#L639-L661
  - **Route 123 western terminus confirmed:** from Route 118 (0,10), Surf
    crosses the river and the east connection reaches Route 123, but the
    search ends at x=41 with zero encounter grass/water tiles and zero land
    tiles facing fishable water. This remains true with Cut and after
    omitting every NPC/item/berry tree. West-facing ledges cannot be climbed
    eastward. From Route 122's northern connection (10,0), the same decoder
    reaches Route 123 encounter grass and water, including pond (34,4) and
    fishing shore (33,6). Existing chapter/Scope gate stays unchanged.
    **Sanity check:** Route 118's western entrance without Surf reaches no
    encounter grass, but does reach fishing shore (11,15); with Surf it
    reaches grass (48,10). This agrees with the separately cited Route 118
    source and existing walking-row Surf gates.
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/Route118/map.json
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/Route122/map.json
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/Route123/map.json
  - **Shoal Cave narrowed:** decode `data/layouts/ShoalCave_*/map.bin` and
    the same cave/general attributes. Low-tide entrance (20,30) reaches
    encounter floor in EntranceRoom, InnerRoom, StairsRoom and LowerRoom
    without Strength. With Strength, pushing the LowerRoom boulder at
    (25,3) gives the corridor to warp (28,11), IceRoom (17,10) and encounter
    floor (17,11), before any ice puzzle is needed. The entrance/inner scripts
    substitute high-tide layouts 169/170 for low-tide layouts 165/166 while
    retaining low-tide map events. Repeating the trace with those layouts
    and enforcing warp elevation reaches neither stairs/lower nor ice rooms.
    This confirms physical access, but does not establish PokeAPI's floor
    aliases or supply the missing tide-state model; those remain open.
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/ShoalCave_LowTideEntranceRoom/map.json
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/ShoalCave_LowTideEntranceRoom/scripts.inc#L1-L16
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/ShoalCave_LowTideInnerRoom/map.json
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/ShoalCave_LowTideInnerRoom/scripts.inc#L1-L16
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/ShoalCave_LowTideStairsRoom/map.json
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/ShoalCave_LowTideLowerRoom/map.json
    https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/ShoalCave_LowTideIceRoom/map.json
- Original source, pinned to pret/pokeruby
  `5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f`:
  https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f
  No decompilation build, ROM or emulator was used. Relative paths below
  refer to this revision:
  - `src/pokemon_menu.c`: `sFieldMoveFuncs` and badge-index check confirm
    the HM badge mapping independently of Emerald.
  - `include/pokemon.h`: `struct BoxPokemon boxes[14][30]` supplies box limits.
  - `data/maps/DewfordTown/scripts.inc`: `FLAG_DELIVERED_STEVEN_LETTER`
    controls the Slateport destination.
  - `data/maps/SlateportCity_OceanicMuseum_2F/scripts.inc` sets
    `FLAG_HIDE_EVIL_TEAM_ROUTE110` after Stern's rescue.
  - `data/maps/Route119_WeatherInstitute_2F/scripts.inc`: rescue clears
    `FLAG_HIDE_EVIL_TEAM_WEATHER_INSTITUTE` and gives level-25 Castform.
  - `data/maps/RustboroCity_DevonCorp_2F/scripts.inc`: revival consumes the
    Root/Claw Fossil; `LavaridgeTown/scripts.inc` gives Wynaut's Egg;
    `MossdeepCity_StevensHouse/scripts.inc` and `map.json` gate Beldum with
    `FLAG_SYS_GAME_CLEAR` / its hidden object flag.
  - `src/trade.c` and Rustboro/Fortree/Pacifidlog house scripts supply the
    three trades. Required offered species are retained as PokeAPI conditions;
    no badge proxy is added to these trades.
  - `data/maps/SlateportCity_Harbor/scripts.inc` clears the two hideout
    blockers after the submarine theft. `data/scripts/static_pokemon.inc`
    places level-30 Electrode in the hideout in both versions. PokeAPI also
    incorrectly tags the Ruby Magma hideout with Sapphire; `area_versions`
    restricts Magma to Ruby and Aqua to Sapphire, following the cached
    Team Magma Hideout / Team Aqua Hideout location articles.
  - `data/maps/NewMauville_Inside/scripts.inc` has three level-25 Voltorb
    statics and no Electrode static. PokeAPI's erroneous New Mauville
    Electrode `static` row is excluded with the sourced `drop_rows` config;
    its wild walking rows and the correct hideout statics remain intact.
  - `data/maps/LilycoveCity_Harbor/scripts.inc`: the special voyage checks
    `FLAG_SYS_GAME_CLEAR`, the actual Eon Ticket and its distribution flag.
    `SouthernIsland_Interior/scripts.inc` selects the opposite Eon Pokémon.
    Historical distribution availability is not implied by tracking it.
  - `src/wild_encounter.c`: `FishingWildEncounter` checks Feebas before the
    rod-specific table. Any rod works, using existing method support.
  - `src/data/wild_encounters.json`: Route 130's land tables contain only
    Wynaut. The cached Hoenn Route 130 article labels these grass encounters
    as Mirage Island. Drop PokeAPI's duplicate Route 130 walking row so
    Wynaut keeps the existing Mirage Island gate:
    https://bulbapedia.bulbagarden.net/wiki/Hoenn_Route_130
  - `src/data/pokemon/evolution.h`, `src/pokemon_3.c`, and
    `src/evolution_scene.c` establish historical evolution text overrides:
    original stones/friendship/beauty, Espeon noon–midnight, Umbreon
    midnight–noon, and Nincada's level-20 empty-party-slot Shedinja.
    Later-generation babies are excluded as pre-evolutions by generation.
- No alternate form catalog is added: battle-only Castform transformations
  and Spinda personality markings are excluded under the existing catalog
  policy. Sprite source (all 386 regular and shiny files downloaded):
  https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-iii/ruby-sapphire
  Existing Hoenn badges, kit icons and `public/covers/ru.jpg` / `sa.jpg` are
  reused. The cover URLs are already recorded under Box art.
- The access-audit helper now resolves all 103 R/S encounter areas from the
  supplied cache, including Hoenn routes, Victory Road, Safari Zone and the
  Weather Institute walkthrough fallback. This implementation's source pass
  is not the independent access review or cartridge/browser verification.
  No second scanned-guide source was consulted; see #open-questions.

- **PokeAPI limits/corrections:** New Mauville's spurious level-30 Electrode
  static is excluded from this pack using the original scripts; Voltorb
  statics and actual hideout Electrode remain. PokeAPI also incorrectly tags
  Magma Hideout with Sapphire; the pack limits Magma to Ruby and Aqua to
  Sapphire using the version-specific location sources. Other R/S encounter
  areas were present; no missing encounter region was identified. The cache
  lacked only the Pokédex-4 response (fetched individually). Distribution-only
  Hoenn Pokecenter Pikachu/Celebi/Jirachi rows are deliberately excluded;
  they are not ordinary local encounters. Numeric NPC-trade levels are
  retained upstream examples, not mandatory in-game trade levels.


## Open questions

- Real 64 KiB RS exports remain unverified and unsupported; the Emerald-only recovery path must not be applied to them. Players choose Ruby or Sapphire.

- **Independent access audit:** reviewer's access review remains. The local
  103-area work list is `.cache/areas-rs.json` (regenerate with
  `python3 scripts/access_audit.py areas rs`). All areas have cached source
  pages; Weather Institute uses walkthrough Part 11. No second guide/source
  confirms every access path. No gate was entered without a source, but the
  remaining questions need independent source or gameplay proof.


### Model limits

- **Shoal Cave clock:** static original-map tracing confirms low tide reaches
  the entrance, inner, stairs and lower rooms without Strength; Strength
  opens the lower room's boulder corridor to the ice-room encounter tile
  (17,11). High-tide layouts reach neither the lower/stairs nor ice rooms.
  The tide flag updates on qualifying map transitions (low hours 03:00–09:00
  and 15:00–21:00). A shared tide-state model and PokeAPI floor-name mapping
  are still needed; preserve current rows. Trace method and pinned files are
  in #sources; this is static evidence, not gameplay.
  https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/time_events.c#L54-L91

- **Temporary hideout:** original Lilycove map scripts replace the hideout
  entrance with colliding wall tiles once `FLAG_BADGE07_GET` is set.
  A shared model for access ending after the Mind Badge is still needed
  before Electrode rows can describe current availability exactly.
  https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/LilycoveCity/scripts.inc#L30-L56

- **Choice/state limits:** one desert fossil can be selected; its counterpart
  sinks. The tracker offers independent possession events for imported or
  traded fossils and does not enforce mutual exclusion. Mirage Island's
  event must be kept in sync with today's game. Regi events represent full
  puzzle completion, including Sealed Chamber, Dig, Relicanth/Wailord and
  the individual puzzle; they do not automatically prove party composition.
  Eon Ticket voyages require historical distribution access. These are
  existing tracker-model limits, not invented encounter rows.
