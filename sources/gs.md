# Gold and Silver (`gs`)

## Sources

Original English Gold/Silver only; Crystal and HeartGold/SoulSilver are not
mechanics sources. The `gold` / `silver` encounter codes are `g` / `i`.

### Encounter generation and historical data

- PokeAPI species encounters, separately inspected for both versions:
  https://pokeapi.co/api/v2/pokemon/1/encounters
  through species 251; original Johto order:
  https://pokeapi.co/api/v2/pokedex/3/
  The input has 124 distinct location areas. Preserve levels, odds, version
  differences, weekday, swarm and time conditions. Three Headbutt tables
  share one method; the existing merger retains the best table's chance,
  rather than summing independent tree tables. No Crystal source-version
  substitutions, remake areas, Celebi event or Dragon's Den Dratini gift.
- Historical ancestry, evolution and types were checked against original
  `pret/pokegold` at `f2cde36f49b994c143bfd18582182302fdc76492`:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/pokemon/evos_attacks.asm
  https://github.com/pret/pokegold/tree/f2cde36f49b994c143bfd18582182302fdc76492/data/pokemon/base_stats
  Compared all 251 types and 119 non-stat evolution edges; inspected Tyrogue's
  three stat branches separately. GS opts into filtering pre-evolutions
  introduced after generation II: Happiny, Mime Jr., Munchlax, Azurill,
  Bonsly and Wynaut must not appear as ancestors. Espeon's source is
  `EVOLVE_HAPPINESS, TR_MORNDAY, ESPEON`; its pack-local text explicitly
  includes morning. Other packs keep their existing generated data.
  https://www.serebii.net/gs/evolution.shtml
- PokeAPI calls the original Tin Tower “Bell Tower”; normalize that display
  name. It also uses modern shared location labels for the S.S. Aqua dock,
  Manias's house and cave sections. Floor-specific gates apply before
  display-floor names are merged; no encounter area is dropped.

### Dark Cave trace endpoints

- [Violet-room events, lines 33–48](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/DarkCaveVioletEntrance.asm#L33-L48)
  identify Route 31 warp (3,15), Blackthorn-room warp (17,1), and four
  smashable rock objects. [Blackthorn-room events, lines 65–67](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/DarkCaveBlackthornEntrance.asm#L65-L67)
  identify the Violet arrival (3,25) separately from the Route 45 exit (23,3).
  These are endpoints for the unresolved collision trace, not evidence of a
  walkable path or grounds for changing the current gates.

### Chapters, access and events

`src` / `quote` fields in `data/gs.json` identify individual gates. These
walkthrough sections supply the route sequence and physical paths (their
Gold/Silver text, not their Crystal additions):

- New Bark, Routes 29–31/46, Violet, Sprout Tower and early Ruins:
  https://www.psypokes.com/gsc/walkthrough.php?part=1
  Ruins is west of Violet and accessible before Falkner:
  https://www.psypokes.com/gsc/walkthrough.php?part=12
- Route 32, Union Cave, Azalea and Slowpoke Well:
  https://www.psypokes.com/gsc/walkthrough.php?part=2
  The Route 32 guard checks both the Zephyr Badge and receipt of Elm's Egg:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route32.asm
  Ilex's rival waits for Slowpoke Well to be cleared; Hive proves that
  rescue because the gym is blocked until then:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/AzaleaTown.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/SlowpokeWellB1F.asm
- Ilex Cut barrier, Routes 34–36, Goldenrod and National Park:
  https://www.psypokes.com/gsc/walkthrough.php?part=3
  Cut is a kit item `cut-hm` (distinct from FRLG's story-event ID `cut`).
  The flower shop requires Plain; Sudowoodo requires the SquirtBottle:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/GoldenrodFlowerShop.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route36.asm
- Routes 37–39, Ecruteak, Burned Tower and Olivine:
  https://www.psypokes.com/gsc/walkthrough.php?part=4
  Bill's meeting enables the Goldenrod Eevee. Waking the beasts is optional,
  requires the Burned Tower Rock Smash path, and releases all three roamers,
  including Suicune; Morty's badge does not prove their release:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/EcruteakPokecenter1F.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/BurnedTowerB1F.asm
- Cianwood, sea Routes 40/41, Surf and deeper Slowpoke Well:
  https://www.psypokes.com/gsc/walkthrough.php?part=5
- Routes 42/43, Mt. Mortar, Mahogany, Lake of Rage and the Rocket hideout:
  https://www.psypokes.com/gsc/walkthrough.php?part=6
  Route 42 has a walk-through Mt. Mortar route; do not blanket-gate it on
  Surf. Red Gyarados needs Surf. Lance reveals the hideout staircase after
  the lake encounter. The Electrode room additionally needs its password:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MahoganyMart1F.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/TeamRocketBaseB2F.asm
- Mahogany's east blocker disappears when the seventh Johto badge triggers
  the Radio Tower takeover, before the tower is cleared. The script sets
  `SCENE_MAHOGANYTOWN_NOOP`, and each gym's seventh-badge check calls it:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/engine/events/std_scripts.asm#L255-L264
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MahoganyGym.asm
  Route 44's grass is on the Surf island. Ice Path's boulder puzzle needs
  Strength to continue to its lowest floor and Blackthorn/Route 45:
  https://www.psypokes.com/gsc/walkthrough.php?part=7
  Blackthorn Gym itself waits for Radio Tower clearance. Dragon's Den opens
  after Clair; retrieving the Dragon Fang needs Whirlpool, but the initial
  water encounters only need Surf. GS has no elder quiz/Dratini gift:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/BlackthornCity.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/DragonsDen1F.asm
- New Bark's east water/Route 27 and Tohjo Falls can be visited with Surf;
  crossing to Route 27 grass and Route 26 needs Waterfall. Victory Road's
  checkpoint additionally requires all eight Johto badges:
  https://www.psypokes.com/gsc/walkthrough.php?part=8
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/VictoryRoadGate.asm
- Eastern Kanto opens after the League via S.S. Aqua. Routes 4/9/10 and the
  eastern/southern circuit do not wait for Misty's or Sabrina's badge:
  https://www.psypokes.com/gsc/walkthrough.php?part=9
  https://www.psypokes.com/gsc/walkthrough.php?part=10
  Route 10 grass requires Surf; Cycling Road requires the Bicycle. Power
  restoration enables the Lavender EXPN Card, which supplies the Poké Flute
  channel for Snorlax. Diglett's Cave then opens western Kanto:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/LavRadioTower1F.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/VermilionCity.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/engine/events/specials.asm#L358-L367
- Western Kanto and the sea routes; Mt. Silver opens only after all sixteen
  badges and talking to Oak, not merely owning the badges:
  https://www.psypokes.com/gsc/walkthrough.php?part=11
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/OaksLab.asm
- Optional cave paths, Union Cave Lapras/Surf, Mt. Mortar upper cave and
  Tyrogue/Waterfall, Ruins grass/Surf through Union Cave, and Whirl Islands:
  https://www.psypokes.com/gsc/walkthrough.php?part=12
  https://strategywiki.org/wiki/Pok%C3%A9mon_Gold_and_Silver/Ruins_of_Alph
  Strength is required for the Omanyte puzzle route, not for Natu/Smeargle
  grass. Whirl Islands needs Surf/Whirlpool; the direct Lugia route goes
  down the waterfall, so do not require Waterfall to reach Lugia.
- Dark Cave's connecting warp is mapped in the original scripts. The
  provisional earlier Blackthorn-room gate uses the Violet approach with
  Surf/Rock Smash, rather than waiting for Blackthorn City; see open question:
  https://www.psypokes.com/gsc/images/darkcave2.png
  https://www.psypokes.com/gsc/images/darkcave1.png
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/DarkCaveVioletEntrance.asm
  The latter identifies the third outdoor exit as Route 46; the walkthrough
  image's Route 45 label is inaccurate.

### Gifts, statics, trades and forms

- Starter gifts (Chikorita/Cyndaquil/Totodile, level 5), Togepi Egg after
  Falkner, Bill's level-20 Eevee after meeting Bill, borrowed Shuckle, mail
  Spearow and Karate King's level-10 Tyrogue:
  https://www.serebii.net/gs/gift.shtml
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/ElmsLab.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/VioletPokecenter1F.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/BillsFamilysHouse.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/ManiasHouse.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route35GoldenrodGate.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MountMortarB1F.asm
- Game Corner prices/version prizes and six NPC trades are retained from
  PokeAPI and checked against the scripts. Rhydon's request specifically
  requires a female Dragonair: GS replaces `trade-dragonair` with the already
  supported display condition `trade-dragonair-f` from `TRADE_GENDER_FEMALE`:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/GoldenrodGameCorner.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/CeladonGameCornerPrizeRoom.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/events/npc_trades.asm
- Friday level-20 Lapras, Rocket trap tiles, Electrode and red Gyarados:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/UnionCaveB2F.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/TeamRocketBaseB1F.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/TeamRocketBaseB2F.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/LakeOfRage.asm
- Version-specific wings and legendaries: Gold's director gives Rainbow,
  Silver's gives Silver; Pewter's old man gives the opposite wing. Gold
  Ho-Oh/Silver Lugia are level 40; their opposite-version encounters are 70.
  Tin Tower also needs Fog and its upper staircase waits for the wing event:
  https://www.serebii.net/gs/legends.shtml
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/RadioTower5F.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/PewterCity.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/TinTower1F.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/TinTowerRoof.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/WhirlIslandLugiaChamber.asm
- Unown has 26 letters, no punctuation forms. Each puzzle releases a group;
  the species encounter waits for any completed puzzle. The form catalog
  lists eventual local availability, not per-letter puzzle unlock state:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/RuinsOfAlphKabutoChamber.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/RuinsOfAlphOmanyteChamber.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/RuinsOfAlphAerodactylChamber.asm
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/RuinsOfAlphHoOhChamber.asm

### Static map traces for remaining access questions

Read `pret/pokegold` at `f2cde36f49b994c143bfd18582182302fdc76492`.
An isolated scratch Python BFS decoded each `.blk` byte into the four
16-pixel collision cells in its tileset table. It followed script warps and
map connections, one-way ledge jumps and player side-wall permissions;
Cut trees, smashable rocks, fixed NPCs and unpushed boulders blocked movement.
Cave/door arrivals could leave only toward the exit, preventing paths behind
exterior cave warps. Item balls were treated as collectible. No ROM was
built or run. These are static source inferences, not gameplay verification.

Shared primary inputs: [map sizes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/constants/map_constants.asm),
[tilesets](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/maps/maps.asm), [connections](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/maps/attributes.asm),
[Kanto collisions](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/tilesets/kanto_collision.asm),
[Johto collisions](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/tilesets/johto_collision.asm),
[cave collisions](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/tilesets/cave_collision.asm),
[player side-wall permissions](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/home/map.asm#L1869-L2020),
[ledge jumps](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/engine/overworld/player_movement.asm#L352-L391).
Coordinates below are zero-based script tile coordinates, not block coordinates.

- **Route 8:** from both Saffron gate exits (4,4)/(4,5) and Lavender's
  east edge, 0/24 grass cells are reachable without Cut, 24/24 with Cut.
  Repeating with every walkable boundary cell as an entrance and Surf enabled
  gives the same result. The two trees are (27,10) and (21,12). Add Cut to
  walking rows only. [Map bytes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route8.blk),
  [warps and fixed trainers](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route8.asm).
- **Pewter / Route 3:** Route 2's southern Viridian entrances reach its
  north connection at (8,0)/(9,0) without Cut, respecting ledges and objects.
  Diglett's (12,7) arrival is separately confined to the eastern pocket.
  The Viridian approach suffices once normal western Kanto access is open;
  retain the current absence of a Cut gate.
  [Route 2 bytes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route2.blk), [objects/warps](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route2.asm),
  [Snorlax-controlled east guard](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/VictoryRoadGate.asm).
- **Route 1:** north (8,0)/(9,0) and south (8,35)/(9,35) approaches reach
  104 grass cells without Cut. Retain current gates.
  [Map bytes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route1.blk), [objects](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route1.asm).
- **Dark Cave:** from Route 31 arrival (3,15), no Surf reaches neither
  Violet warp (17,1) nor the Blackthorn room, even with Rock Smash. Surf
  alone reaches that warp and 25 FLOOR cells in the destination's southern
  pocket at (3,25); Rock Smash is unnecessary for walking encounters.
  The same flood from Route 46 arrival (35,33), with Surf + Rock Smash,
  cannot reach Blackthorn-room exit (23,3). Its one-way ledge separates the
  pocket from the main room. Thus this proposed shortcut establishes neither
  early Blackthorn/Route 45 nor early Route 44. Retain their existing gates.
  Overland, a flood of all Route 29 cells with Surf, Rock Smash, Cut and
  Strength reaches all 52 Route 46 grass cells but no Route 45 cell: Route
  46's ledges only hop south. The reverse flood from Blackthorn reaches
  Route 45, Route 46 and Route 29, confirming the connections are modeled.
  [Route 46 bytes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route46.blk),
  [Route 46 connections](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/maps/attributes.asm#L247-L249).
  Aquatic access is still open; preserve its previous provisional gate.
  [Violet bytes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/DarkCaveVioletEntrance.blk),
  [Violet warps/rocks](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/DarkCaveVioletEntrance.asm#L33-L48),
  [Blackthorn bytes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/DarkCaveBlackthornEntrance.blk),
  [Blackthorn exits](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/DarkCaveBlackthornEntrance.asm#L65-L67).
- **Mt. Mortar / Route 42:** from Ecruteak gate arrival (0,8), without Surf,
  the flood follows the western cave entrance through 1F Inside and exits
  the eastern cave entrance, reaching 16 Route 42 grass cells. From there
  Route 42's northern path (row 4) leads on foot to the middle entrance
  (28,9), whose arrival (17,33) walks straight up to the B1F ladder
  (17,29) -> B1F (19,29): 37 B1F FLOOR cells without Surf, next to
  fishable water. Psypokes agrees that B1F ladder (E) comes out "just above
  the middle entrance of Mt Mortar". B1F therefore has no Surf place gate;
  its Surf rows keep Surf through their method. With Surf, B1F grows to
  175 FLOOR cells but still misses Kiyo's platform and 1F Inside stairs
  (9,9). Adding Waterfall reaches 428 upper-floor FLOOR cells and all four
  tiles adjacent to Kiyo (13,4), without moving boulders. Keep upper-floor
  Surf + Waterfall and Tyrogue's existing requirements; Route 42 walking
  encounters need no Surf.
  [middle entrance](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route42.asm#L251), [B1F ladder](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MountMortar1FOutside.asm#L24-L29),
  [B1F warps](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MountMortarB1F.asm#L127-L128),
  [walkthrough](https://www.psypokes.com/gsc/walkthrough.php?part=12),
  [Route 42 map](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route42.blk), [Route 42 entrances](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route42.asm),
  [1F Outside bytes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MountMortar1FOutside.blk),
  [Outside warps](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MountMortar1FOutside.asm),
  [1F Inside bytes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MountMortar1FInside.blk),
  [Inside warps/boulder](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MountMortar1FInside.asm),
  [upper floor](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MountMortar2FInside.blk),
  [B1F bytes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MountMortarB1F.blk), [Kiyo](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/MountMortarB1F.asm).
- **Mt. Silver:** Room1 arrival (9,33) reaches Room2 via (15,1) and
  Room3 via Room2 (11,5) without Surf or Waterfall. These correspond to the main 1F/2F/Top encounter
  progression; no complete main encounter area waits for either move.
  Item-room warps remain inaccessible, but the pack's merged Mt. Silver
  area already opens at its earliest encounters. No additional gate.
  [Room1 map](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/SilverCaveRoom1.blk), [Room1 warps](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/SilverCaveRoom1.asm),
  [Room2 map](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/SilverCaveRoom2.blk), [Room2 warps](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/SilverCaveRoom2.asm),
  [Room3 map](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/SilverCaveRoom3.blk), [Room3 warps](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/SilverCaveRoom3.asm),
  [original encounter tables](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/wild/johto_grass.asm#L1297-L1516).
- **Controls:** Route 44's known Surf-gated grass gave 0/16 cells without
  Surf and 16/16 with Surf; Route 13's existing Cut gate gave 0/32 without
  Cut even with Surf, 32/32 with Cut. These permissive-boundary tests agree
  with the already cited Route 44 walkthrough and Route 13 collision audit.
  [Route 44 map](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route44.blk), [Route 13 map](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route13.blk).
- **Ice Path limitation:** from the first B1F ladder, no Strength reaches
  37 B2F Mahogany-side FLOOR cells but not B3F. Fallen boulders were hidden
  initially, following the original initialization flags. The 1F ice model
  failed to solve the known first sliding puzzle; no complete ice traversal
  or revised Strength gate is claimed. The remaining question records this
  limit instead of treating an incomplete model as proof.
  [B1F](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/IcePathB1F.asm), [B2F](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/IcePathB2FMahoganySide.asm),
  [initial flags](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/engine/events/std_scripts.asm).

### Pack metadata and artwork

- Original Johto/national dex bound 251 (tracking/import-validation limit,
  not proof of save-file reader support), New Bark start, generation II:
  https://www.serebii.net/gs/
  https://pokeapi.co/api/v2/pokedex/3/
- Johto/Kanto badge leaders including Janine and Blue:
  https://www.serebii.net/gs/gyms.shtml
  HM/kit acquisition:
  https://www.serebii.net/gs/tmhm.shtml
  Original field-move checks: Hive/Cut, Plain/Strength, Fog/Surf,
  Glacier/Whirlpool, Rising/Waterfall. Rock Smash has no badge restriction;
  Flash and Fly are not mandatory encounter-access kit in this pack:
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/engine/events/overworld.asm
- English PC: 14 boxes of 20; night begins at 18:00 (morning begins 04:00):
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/constants/pokemon_data_constants.asm#L118-L123
  https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/constants/misc_constants.asm#L37-L39
- Both versions deliberately share Gold's generation-II transparent art,
  including shiny and Unown A–Z. Inspected the upstream regular and shiny
  directory listings before requesting files; all 251 species and 26 forms
  exist in both. The downloader centers them and writes ring-fit metadata:
  https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-ii/gold/transparent
  Existing `g.jpg` and `si.jpg` covers reuse the libretro sources above.
  Ho-Oh's Fire/Flying and Lugia's Psychic/Flying types supply picker rings.

Bulbapedia automated access was not attempted. No original Gold/Silver guide
was available in the supplied local guide collection; Crystal/HGSS guides
were not substituted. Independent access review and manual game/browser
checks remain pending. Open cave mappings remain unresolved.

### Gold/Silver: Route 13 grass access

- Static traces show that the seven Route 13 walking species need `cut-hm`. Fishing and Surf rows are unaffected. The second pass decoded the pinned binary map with deliberately permissive boundary entrances and Surf: 0/32 grass cells without Cut; 32/32 with Cut. This is source/collision evidence, not emulator verification.
- Original sources at `pret/pokegold` revision `f2cde36f49b994c143bfd18582182302fdc76492`: [Route 13 map](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route13.blk), [map attributes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/maps/attributes.asm), [Kanto collision table](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/tilesets/kanto_collision.asm), and [Cut collision routine](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/engine/overworld/tile_events.asm). `CheckCutCollision` searches its `.blocks` table; the decoded tree at (44,4) is the grass entrance.

### Additional independent access checks

- Gold/Silver [Route 32](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route32.asm) uses `Route32CooltrainerMStopsYouScene` to push the player back before Union Cave. [Violet's Pokémon Center](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/VioletPokecenter1F.asm) changes that scene after accepting the egg. The existing chapter gate is retained.
- Gold/Silver [Tin Tower 1F](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/TinTower1F.asm) has a sage on the upstairs warp, hidden by `EVENT_TEAM_ROCKET_DISBANDED`. [Radio Tower 5F](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/RadioTower5F.asm) sets it in Gold's Rainbow Wing branch, while [Pewter City](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/PewterCity.asm) sets it in Silver's Rainbow Wing branch. Walk encounters begin above 1F, so the wing gate is retained.
- Gold/Silver [Burned Tower 1F](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/BurnedTower1F.asm) has Rock Smash objects at (4,3) and (16,13). Including those objects invalidated the first pass's path to the central hole and beast release; retain Rock Smash rather than using a terrain search that parsed no rocks.


### Gold/Silver night encounter corrections (2026-11-13)

The late original batch-4 audit raised two encounter mismatches absent from its
source report. Independently checked both against pinned pret/pokegold
`f2cde36f49b994c143bfd18582182302fdc76492` and the current PokeAPI cache:

- [Route 38 Silver night table](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/wild/johto_grass.asm#L2059-L2067): both the first and fourth slots say `db 16, MEOWTH`. PokeAPI assigns the 30% first slot to Rattata. The GS-only correction transfers that slot to Meowth, giving Meowth 40% at level 16 at night; Gold and Silver's daytime tables stay unchanged.
- [Route 18 night table](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/wild/kanto_grass.asm#L997-L1004): the fourth slot says `db 28, MUK`, followed by two level-30 Muk slots. PokeAPI assigns the 10% level-28 slot to Murkrow in both versions. Transfer it to Muk, giving 15% at levels 28–30 at night. Route 16's real Murkrow encounters remain unchanged.
- [Grass slot probabilities](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/wild/probabilities.asm) give 30/30/20/10/5/4/1 percent. The generator reassigns the original cached detail before aggregation, preserving this distribution, conditions and versions. Expected donor slot values are asserted so an upstream correction cannot silently apply twice.

No access gate changes follow from this delayed report. Mt. Mortar, Ice Path
and Diglett's Cave remain governed by the completed retry and second review.


### Gold/Silver Route 16 grass access (2026-11-13)

The delayed original access audit flagged the northern grass enclosure's Cut
tree. Independently verified the cached files byte-for-byte against pinned
pret/pokegold `f2cde36f49b994c143bfd18582182302fdc76492`:
[Route 16 blocks](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route16.blk),
[collision table](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/tilesets/kanto_collision.asm),
[events/warps](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route16.asm) and
[connections](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/maps/attributes.asm).

All eight grass cells at x12–15, y0–1 sit in the north enclosure. The only
entrance is the Cut tree at (15,4); the house door at (3,1) returns to this
same enclosure and the map has no north connection. A separate flood starting
from the east road, both western gate exits and all southern road entrances
reaches 0/8 grass cells without Cut and 8/8 with Cut, even over-allowing every
other non-wall collision. Add `cut-hm` to the walking rows for Fearow, Grimer,
Muk, Murkrow and Slugma in both versions. This is static source verification;
no emulator play-test was run.


- **Earlier audit exclusions:** Route 27's mandatory Tohjo Falls warps and
  western Kanto's Victory Road Gate guard / Route 19 construction rocks
  still invalidate the earlier terrain-only shortcuts. Existing gates remain;
  those source checks were not gameplay verification. #sources records
  the original exclusions. Mt. Mortar's Tyrogue platform is now independently
  traced in the Gold/Silver static map traces section there.


- Unown A–Z lists eventual local forms. The app does not track the four
  puzzles' individual letter groups; one `alph-puzzle` event opens the
  species encounter, not all letter groups in the actual game. The original
  puzzle scripts are linked in #sources if finer tracking is later wanted.

- Gold/Silver Ice Path: [initial event flags](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/engine/events/std_scripts.asm) set `EVENT_BOULDER_IN_ICE_PATH_1A` through `4A`, hiding B2F boulders until they fall. Correcting that initial state in the reviewer's slide model removed its claimed B3F access without Strength.

- Gold/Silver Route 27: [map warps](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route27.asm) include `warp_event 26, 5, TOHJO_FALLS, 1` and `warp_event 36, 5, TOHJO_FALLS, 2`; walking behind those cave warps was an invalid shortcut in the terrain model.

- Gold/Silver Kanto shortcut and western approaches: [Victory Road Gate](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/VictoryRoadGate.asm) keeps its east-door Black Belt until `EVENT_FOUGHT_SNORLAX`. [Route 19](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route19.asm) inserts rock blocks until `EVENT_CINNABAR_ROCKS_CLEARED`; merely reaching Fuchsia does not establish sea access. These checks reject the proposed shortcuts, rather than claiming exhaustive gameplay proof of every alternative.

## Open questions

- **Dark Cave aquatic access:** Surf alone reaches the Blackthorn room's
  southern encounter pocket (25 FLOOR cells), without Rock Smash. Its ledge
  prevents reaching Route 45 at (23,3), and no water or fishing shore is
  reachable from that pocket. Walking rows now need only Surf; aquatic rows
  retain their previous provisional Rock Smash requirement. Establish their
  earliest full route from Route 45 and replace that provisional requirement.
  Source: #sources, Gold/Silver static map traces.

- **Ice Path floors:** from B1F arrival (3,15), the no-Strength trace reaches
  B2F Mahogany-side floor (37 FLOOR cells), including falling through the
  four holes. It does not reach B3F's ladder (9,11) with fallen boulders
  initially hidden. The 1F sliding trace did not reproduce the known first
  puzzle solution, so it cannot certify the complete approach or reverse
  traversal. Keep existing Strength gates; independently validate sliding
  and one-way hole arrivals before closing this question.
  Sources: [B1F warps and boulders](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/IcePathB1F.asm),
  [B2F warps and hidden boulders](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/IcePathB2FMahoganySide.asm),
  [initial flags](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/engine/events/std_scripts.asm).
