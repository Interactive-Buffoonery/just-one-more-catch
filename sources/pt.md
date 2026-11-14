# Platinum (`pt`)

## Sources

Pack ID `pt`, version `platinum`, encounter code `t`. Platinum is independent
of Diamond/Pearl; none of their chapter or HM assumptions were substituted.

- Species, encounter areas, methods, levels, rates, conditions, regional
  numbering and historical evolution/type records come from the supplied
  PokeAPI cache, through `scripts/build_data.py`:
  https://pokeapi.co/api/v2/version/14/
  https://pokeapi.co/api/v2/pokedex/6/
  The extended Sinnoh dex has 210 entries; national tracking is bounded at
  493. This species bound does not enable save-file import.
- All chapter, area and per-species gates carry `src` URLs in `data/pt.json`.
  The locally cached Platinum walkthrough is the main access source:
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Platinum
  Parts 1–3 cover Route 201 starters, opening routes, Oreburgh and the Coal
  Rock Smash barrier to Floaroma. Parts 4–5 cover Mars/Route 205, Eterna,
  Explorer Kit, Jupiter/Bicycle, Cut/Route 206/Old Chateau, and Wayward Cave.
  Parts 6–10 cover Hearthome's third gym, eastern routes, Solaceon ruins,
  Veilstone, Pastoria, Trophy Garden and the SecretPotion. Parts 11–15 cover
  Celestic, Surf, Canalave/Iron Island/Riley, Mine/Strength, the lakes,
  Snowpoint/Icicle/Rock Climb and the Galactic HQ rescue. Parts 16–19 cover
  the Coronet summit, Distortion World, Rowan's return conversation,
  Sunyshore/Beacon/Waterfall and Victory Road. Parts 21–26 cover National
  Dex mechanics, postgame caves/legendaries, Battle Zone and Stark Mountain.
  `src` links use the canonical `/Part_N` URL for the cached `_Part N` file.
- Review corrections use cached location pages:
  https://bulbapedia.bulbagarden.net/wiki/Sinnoh_Route_223
  https://bulbapedia.bulbagarden.net/wiki/Sinnoh_Route_205
  Route 223 and walkthrough Part 19 put the League above a waterfall.
  Turnback Cave's fourth wild table is explicitly unused in regular play;
  its Giratina static is retained. Route 205's grunts block north of the
  stream, but south-bank fishing remains a gameplay check in [Open questions](#open-questions).
- Turnback Cave wild tables, checked against pret/pokeplatinum at
  `62bdaacdca6c56a6a396f3e9911e2f922b79bba8`: each map has its own
  `encounters.json` under `res/field/maps/turnback_cave_*/`. The entrance and
  all six Pillar 1 rooms share the level 15-18 table; the six Pillar 2 rooms
  use the level 25-28 table, but only `turnback_cave_pillar_2_room_1` has a
  level 25 Golbat in the 5% slot (as PokeAPI does); rooms 2-6 have level 28
  there (pillar_2_room_1 encounters.json lines 28-31); the Pillar 3 rooms and `turnback_cave_pillar_room`
  use the level 35-38 table; `turnback_cave_giratina_room` uses the same
  species with level 37 Dusclops and Chimecho. No map in `res/field/maps/`
  has the level 45-48 table, so PokeAPI's After Pillar 3 walk table is
  unused and stays dropped. The other six PokeAPI tables (Before Pillar 1,
  Pillar 1, Between Pillars 1 And 2, Between Pillars 2 And 3, Pillar 2 and
  Pillar 3) all match an in-game table and stay as they are:
  https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/res/field/maps/turnback_cave_entrance/encounters.json
  https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/res/field/maps/turnback_cave_pillar_2_room_1/encounters.json#L28-L31
  https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/res/field/maps/turnback_cave_pillar_2_room_2/encounters.json
  https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/res/field/maps/turnback_cave_pillar_room/encounters.json
  https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/res/field/maps/turnback_cave_giratina_room/encounters.json
- Additional area-specific access evidence (not merely route order):
  https://bulbapedia.bulbagarden.net/wiki/Wayward_Cave
  https://bulbapedia.bulbagarden.net/wiki/Lost_Tower
  https://bulbapedia.bulbagarden.net/wiki/Maniac_Tunnel
  https://bulbapedia.bulbagarden.net/wiki/Sinnoh_Route_207
  https://bulbapedia.bulbagarden.net/wiki/Sinnoh_Route_212
  https://bulbapedia.bulbagarden.net/wiki/Sinnoh_Route_218
  https://bulbapedia.bulbagarden.net/wiki/Sinnoh_Route_226
  Wayward B1F does not need Strength in Platinum. Lost Tower's fog blocks
  the reward, not catching. Route 207's initial grass precedes the Bicycle,
  but its Honey tree is above the bike slope. Route 218's grass/Honey tree
  need Surf; its starting shore's rods do not. Route 212's reporters clear
  after reaching Pastoria. Route 226 has an eastern approach from Route 228;
  its trade house needs Surf, and Rock Climb is not a blanket route gate.
  The alternative eastern approach also avoids adding Rock Climb to all
  Route 227/Stark encounters. Mt. Coronet 2F is reached using Surf/Rock
  Climb before the later summit story passage; see the unresolved boundary
  question for 3F in [Open questions](#open-questions).
- National Dex is a separate event: see all 210 Sinnoh species, visit Eterna
  and speak to Rowan. It can precede the League through trading. Radar,
  swarms, older fossils and dual-slot encounters use that event rather than
  the generator's historical generic “After the Elite Four” condition:
  https://bulbapedia.bulbagarden.net/wiki/National_Pokédex
  https://bulbapedia.bulbagarden.net/wiki/Poké_Radar
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Platinum/Part_21
  https://bulbapedia.bulbagarden.net/wiki/Dual-slot_mode
  Radar requires grass, recharges after 50 steps and cannot be used on a
  Bicycle. Dual-slot requires the matching GBA cartridge in a DS/DS Lite
  when starting the game; this is not a DSi/3DS feature. The pack preserves
  PokeAPI's radar/slot condition labels rather than inventing extra rows.
- Great Marsh daily tables change after National Dex and vary by area/day;
  the binoculars reveal daily visitors. Backlot's Trophy Garden additions
  occupy the last two announced daily slots. Honey takes six hours and
  expires after 24; four trainer-ID-dependent trees can select Munchlax.
  Ordinary trees select A/B/C/no encounter at 70/20/0/10 percent; Munchlax
  trees use 20/70/1/9 percent. Displayed Honey row odds are conditional on
  the named table, not the total probability of a slathering:
  https://bulbapedia.bulbagarden.net/wiki/Great_Marsh
  https://bulbapedia.bulbagarden.net/wiki/Trophy_Garden
  https://bulbapedia.bulbagarden.net/wiki/Honey_Tree
- Drifloon appears on Fridays after Mars, but not on the day Mars is beaten:
  https://bulbapedia.bulbagarden.net/wiki/Valley_Windworks
  The Friday and Mars requirements are modeled; the same-day exception is
  documented as a tracker limitation in [Open questions](#open-questions).
- Gift/static/trade checks: walkthrough Parts 1 (starter trio), 5 (Togepi),
  6 (Bebe's Eevee before National Dex; Spiritomb's Keystone/32 people),
  8 (Porygon before gym), 13 (Riley's Riolu Egg), 17 (Giratina), 18 (lake
  guardians), 22 (Cresselia/Oak birds/Regigigas/Dialga/Palkia), 25–26
  (Heatran). Fossil revival requires Explorer Kit and the fossil item;
  Skull/Armor availability depends on trainer ID, older fossils on National
  Dex. Trade requests/levels and fossil item conditions stay from PokeAPI.
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Platinum/Part_4
  https://bulbapedia.bulbagarden.net/wiki/In-game_trade
  https://bulbapedia.bulbagarden.net/wiki/Snowpoint_Temple
  https://bulbapedia.bulbagarden.net/wiki/Turnback_Cave
  Regigigas requires the three Regis in the party; Turnback Giratina only
  appears if it was not caught in the Distortion World. Event Regigigas
  rooms, distribution islands, the unreleased Azure Flute and Ranger
  transfer are not presented as ordinary local encounter access.
- Primary-source cross-checks use pret/pokeplatinum pinned at
  `62bdaacdca6c56a6a396f3e9911e2f922b79bba8` (source only; no ROM built):
  https://github.com/pret/pokeplatinum/tree/62bdaacdca6c56a6a396f3e9911e2f922b79bba8
  Under `res/field/maps/`, `sandgem_town_pokemon_research_lab/scripts.s`
  confirms the Eterna/seen-dex National Dex checks and Rowan's lake/Sunyshore
  story flags. `celestic_town_north_house/scripts.s` requires game completion
  to unlock the Dialga/Palkia legend (therefore both rows require Elite Four,
  plus their orb conditions). `stark_mountain_room_3/scripts.s` checks game
  completion, National Dex and the Buck follow-up for Heatran.
  `mining_museum/scripts.s`,
  `hearthome_city_northwest_house/scripts.s`,
  `iron_island_b2f_left_room/scripts.s`, `route_209/scripts.s`,
  `eterna_city_south_house/scripts.s`, `fullmoon_island_forest/scripts.s`
  and `snowpoint_temple_b5f/scripts.s` cross-check the gifts, fossils,
  Spiritomb, bird release, Cresselia release and Regigigas conditions.
- Gym order/leaders and field badges are Platinum-specific: Coal/Roark
  (Rock Smash), Forest/Gardenia (Cut), Relic/Fantina (Defog),
  Cobble/Maylene (Fly), Fen/Crasher Wake (Surf), Mine/Byron (Strength),
  Icicle/Candice (Rock Climb), Beacon/Volkner (Waterfall):
  https://bulbapedia.bulbagarden.net/wiki/Badge
  Fly is omitted from catch-access kit. Defog is optional for visibility,
  not a blanket gate on foggy encounter areas. Generation IV has 18 boxes
  of 30 and morning 04:00–09:59, day 10:00–19:59, night 20:00–03:59:
  https://bulbapedia.bulbagarden.net/wiki/Pokémon_Storage_System
  https://bulbapedia.bulbagarden.net/wiki/Time
- Local form catalog: Unown A–Z/!/? (upper room via 26 forms seen), three
  Burmy/Wormadam cloaks, east/west Shellos/Gastrodon and Giratina's
  Altered/Origin formes. Origin uses the Griseous Orb obtained through
  postgame Turnback/Distortion World. Rotom appliances require the historical
  Secret Key distribution and are excluded from ordinary obtainable forms:
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Platinum/Part_7
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Platinum/Part_23
  https://bulbapedia.bulbagarden.net/wiki/Pokémon_Platinum_Version
  https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/src/pokemon.c
  The form catalog describes eventual availability, not per-form story state.
- Art uses Platinum's regular/shiny PokeAPI sprites, Sinnoh badge IDs 25–32
  and item sprites (Defog uses a Flying TM). The existing Platinum cover is
  reused from the Coming Soon cover set cited above:
  https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-iv/platinum
  https://github.com/PokeAPI/sprites/tree/master/sprites/badges
  https://github.com/PokeAPI/sprites/tree/master/sprites/items

The supplied cache was used without automated Bulbapedia requests or a bulk
PokeAPI fetch. All 159 retained encounter areas resolve to cached source
pages in `scripts/access_audit.py areas pt`; this is a reviewer work list,
not an independent certification of all terrain paths. Remaining source,
probability and game/runtime limitations are recorded in [Open questions](#open-questions).

- The cache contains 163 Platinum areas; 159 are included. Flower Paradise,
  Newmoon Island, Hall of Origin and the Sinnoh Pokemart distribution area
  are excluded, together with the Pokémon Ranger transfer method. No event
  distribution is claimed available today. PokeAPI has no ordinary Platinum
  encounter rows for the Regirock/Regice/Registeel event-unlocked rooms;
  those rows were not fabricated. Regigigas consequently still requires
  obtaining its prerequisite trio externally.

- PokeAPI has no catch encounter table for Pal Park's imported Pokémon,
  Battle Frontier rental/battle opponents or historical gift distributions
  beyond its supplied rows. The 493-species catalog includes species with
  evolution/trade-only or unavailable local acquisition; it does not claim
  all 493 can be caught in one Platinum save.


- Most access facts have one cached Bulbapedia source; selected script
  cross-checks are pinned in #sources. A second independent source for
  every area remains outstanding. No official Platinum guide was consulted.

## Open questions

- Route 205 South fishing before clearing the Windworks needs a gameplay
  check: obtain the Old Rod at the Route 218 gate, then try fishing from the
  south bank before crossing the blocked bridge. The cached Sinnoh Route 205
  page says the grunts block only north of the stream; walkthrough Part 2
  confirms the early Old Rod, and Part 3 reaches the bridge before Mars.
  pokeplatinum shows the grunts blocking at one tile
  (x 217, z 653), pushing the player south while `VAR_VALLEY_WINDWORKS_STATE`
  is 1 ([events.json:540-546](https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/res/field/maps/route_205_south/events.json#L540-L546),
  [scripts.s:48-66](https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/res/field/maps/route_205_south/scripts.s#L48-L66)).
  The repo holds no water or collision tiles, so a usable south-bank fishing
  tile is still unconfirmed. Rod rows stay in chapter 2 with the grass and
  Honey tree.


- Independent terrain/access review remains outstanding. The cached
  walkthrough and location pages source the gates, but no emulator or
  collision-map traversal was performed. Specifically review Mt. Coronet's
  2F-to-3F story passage (2F is available with Surf/Rock Climb; 3F and higher
  conservatively retain the Galactic HQ rescue), Victory Road's individual
  floor paths, and alternative eastern Battle Zone approaches to Route 227
  and Stark Mountain. Route 228 grass is not blanket-gated on Bicycle or
  Rock Smash: its northern/southern entrances need a terrain cross-check.
  The pokeplatinum map data has no collision tiles, so none of this can be
  traced from source. For Coronet, 2F reaches 3F through two plain warps
  ([events.json](https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/res/field/maps/mt_coronet_2f/events.json)),
  and only the Galactic grunts on 3F hide behind a story flag
  (`FLAG_HIDE_MT_CORONET_GALACTIC_GRUNTS`,
  [mt_coronet_3f/events.json:17](https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/res/field/maps/mt_coronet_3f/events.json#L17)).

- Turnback Cave Golbat shows levels 25-27 in Between Pillars 1 And 2. That
  matches only the first Pillar 2 room; rooms 2-6 give levels 27-28
  ([pillar_2_room_1](https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/res/field/maps/turnback_cave_pillar_2_room_1/encounters.json#L28-L31),
  [pillar_2_room_2](https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/res/field/maps/turnback_cave_pillar_2_room_2/encounters.json#L28-L31)).
  Showing both needs a way to override PokeAPI levels in the pack.

### Model limits

- Drifloon is Friday plus Mars cleared, but cannot appear on the same day
  Mars is defeated. The tracker stores an event checkbox, not its completion
  date, so cannot enforce that exception. Source: Valley Windworks and
  Platinum walkthrough Part 4 in #sources.

- Great Marsh pre-National-Dex exclusive table entries remain visible after
  the National Dex upgrade: the current positive-requirement model cannot
  expire a row. Daily slot labels, National Dex requirements on later rows,
  area distinctions and PokeAPI rates are retained. Do not interpret all
  listed daily possibilities as simultaneously present.

- PokeAPI describes conditional encounter slots rather than a complete
  encounter-table simulator. Radar-off, no-dual-slot, daily Marsh/Backlot,
  Honey groups and morning/day/night are retained as condition-labelled
  rows. Their percentages are not combined into a whole-context probability.
  Honey odds are conditional on the selected group; trainer-ID Munchlax
  tree selection and fossil parity are not calculated by the tracker.
