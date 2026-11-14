# Diamond and Pearl (`dp`)

## Sources

Encounter rows, species types, levels, rates, version membership, encounter
conditions and evolution text come from the pre-cached PokeAPI responses,
processed by `scripts/build_data.py dp`. Regional ordering uses PokeAPI
Pokédex 5 (`original-sinnoh`, 151 entries); the national catalog ends at 493.
The Giratina static supplements the missing PokeAPI encounter (sources below).
The following cached Bulbapedia articles were read as raw wikitext; URLs identify the source pages.
Each hand-written gate/event also carries its source in `data/dp.json`.

- Chapter sequence and starter choice/location:
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Diamond_and_Pearl
  Parts 1–4 cover Twinleaf, Lake Verity (Turtwig, Chimchar, Piplup), Jubilife,
  Oreburgh and the Old Rod. Parts 5–7 cover Rock Smash north through Route
  204, Mars clearing Route 205, the Friday Drifloon, Eterna, Explorer Kit,
  Cut, Jupiter's Bicycle reward and Wayward Cave. Its basement requires
  Strength in D/P; Platinum's earlier access does not apply.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Diamond_and_Pearl/Part_8
  and Parts 9–13 cover Hearthome's Happiny Egg, Good Rod on Route 209,
  Strength at Lost Tower, Solaceon, the southern routes, Defog in the Great
  Marsh, SecretPotion and Celestic's Surf. Defog helps visibility on Route
  210 but is not required to proceed; no blanket Defog gate is applied.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Diamond_and_Pearl/Part_14
  and Parts 15–20 cover Surf to Canalave, Riley's Egg after the Grunts,
  Strength through northern Mt. Coronet, Icicle Badge opening Lake Acuity,
  Galactic HQ, the summit's Surf/Rock Climb route, Cyrus before Dialga or
  Palkia, the Route 222 power outage ending, and Waterfall to Victory Road.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Diamond_and_Pearl/Part_22
  establishes Oak's National Dex upgrade after seeing the required 150
  Sinnoh species (Manaphy is optional), Poké Radar, swarms and dual-slot
  encounters after that upgrade. The National Dex is an explicit event,
  separate from Hall of Fame; D/P conditions do not use the shared
  "After the Elite Four" display shortcut. Five individual GBA cartridge
  conditions remain attached to their original rows, rather than inventing
  one combined encounter method. Parts 23–26 establish Battle Zone access,
  the mainland's National Dex guard, Super Rod and Buck returning the Magma
  Stone before Heatran, plus Rock Smash/Strength within Stark Mountain.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Diamond_and_Pearl/Part_28
  and Parts 29–30 source the lake guardians after Cyrus, speaking to Mesprit
  before it roams, Cresselia's Fullmoon Island encounter after the nightmare
  quest, Rotom's National Dex/night restriction, Snowpoint Temple's Hall of
  Fame/National Dex entrance and Strength to B5F, Regigigas needing all three
  Regis, and the eastern Victory Road/Route 224 opening. Giratina is described
  here and supplemented from the two agreeing sources below.
- https://bulbapedia.bulbagarden.net/wiki/Mount_Coronet
  explicitly places the Galactic-HQ mural blocker before 3F.
  https://bulbapedia.bulbagarden.net/wiki/Sinnoh_Route_206
  sources Cut to the encounter area below Cycling Road.
  https://bulbapedia.bulbagarden.net/wiki/Sinnoh_Route_207
  sources the Bicycle slope above its early grass and the later Honey Tree.
  https://bulbapedia.bulbagarden.net/wiki/Sinnoh_Route_218
  places the encounter grass/tree beyond Surf while early fishing remains
  available from Jubilife's shore.
  https://bulbapedia.bulbagarden.net/wiki/Eterna_Forest
  puts its Honey Tree on the Cut bypass.
  https://bulbapedia.bulbagarden.net/wiki/Ravaged_Path
  distinguishes the early cave entrance from Rock Smash traversal/water.
  https://bulbapedia.bulbagarden.net/wiki/Sendoff_Spring
  specifies Hall of Fame access in D/P.
- https://bulbapedia.bulbagarden.net/wiki/Badge#Sinnoh_League
  gives D/P leaders and field-move badges: Coal/Roark/Rock Smash,
  Forest/Gardenia/Cut, Cobble/Maylene/Fly, Fen/Crasher Wake/Defog,
  Relic/Fantina/Surf, Mine/Byron/Strength, Icicle/Candice/Rock Climb,
  Beacon/Volkner/Waterfall. Platinum's swapped Surf/Defog badges do not apply.
  https://bulbapedia.bulbagarden.net/wiki/Time gives Gen IV morning
  04:00–09:59, day 10:00–19:59 and night 20:00–03:59.
  https://bulbapedia.bulbagarden.net/wiki/Pokémon_Storage_System gives
  18 boxes of 30. https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_by_Sinnoh_Pokédex_number
  confirms the original 151-entry regional dex.
- https://bulbapedia.bulbagarden.net/wiki/Gift_Pokémon sources Bebe's
  National Dex Eevee; the walkthrough sources the two gift Eggs.
  https://bulbapedia.bulbagarden.net/wiki/Pokémon_Diamond_and_Pearl_Versions
  sources Manaphy's Pokémon Ranger transfer; an explicit received-Egg event
  prevents it appearing as an ordinary freely available gift.
  https://bulbapedia.bulbagarden.net/wiki/In-game_trade sources NPC trades;
  PokeAPI retains the requested-species conditions and version membership.
  The walkthrough Part 8 Hallowed Tower section sources Spiritomb's Odd
  Keystone and 32 Underground player conversations; these remain conditions
  on its original PokeAPI static rather than an invented gift.
- https://bulbapedia.bulbagarden.net/wiki/Fossil and
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Diamond_and_Pearl/Underground
  source the Explorer Kit, Diamond's local Skull Fossils/Pearl's Armor
  Fossils, and the five older fossils after the National Dex. PokeAPI offers
  both revival gifts in both versions subject to their held fossil; traded
  fossil items can be revived, so these gift rows are not version-filtered.
  A second source confirms item/species revival pairs and item possession:
  https://github.com/pret/pokediamond/blob/b623abef1b4dfe204ca50aab42447ac00c134290/arm9/src/scrcmd_fossils.c
- https://bulbapedia.bulbagarden.net/wiki/Honey_Tree sources the six-hour
  wait, 24-hour expiration and groups A/B/C. PokeAPI group rates remain
  conditional table rates, not overall per-tree probabilities.
  https://bulbapedia.bulbagarden.net/wiki/Great_Marsh sources daily selections
  and the National Dex expansion; raw daily-slot conditions remain visible.
  https://bulbapedia.bulbagarden.net/wiki/Trophy_Garden sources Backlot's
  National Dex guests and the last two daily selections remaining available.
  https://bulbapedia.bulbagarden.net/wiki/Poké_Radar and
  https://bulbapedia.bulbagarden.net/wiki/Roaming_Pokémon provide mechanic
  cross-checks. This pack has no Platinum-only roaming legendary birds.
- https://bulbapedia.bulbagarden.net/wiki/Solaceon_Ruins sources Unown's
  letter chambers and the upper !/? room through Maniac Tunnel.
  https://www.serebii.net/games/forms.shtml cross-checks Burmy's three
  terrain cloaks, permanent Wormadam cloaks and western/eastern Shellos and
  Gastrodon. These plus Unown are the local form catalogs. Rotom appliances,
  Origin Giratina and Sky Shaymin are not enabled for original D/P.
- Unown event wording: Solaceon Ruins says the Ruin Maniac finishes
  Maniac Tunnel "after seeing 26 different forms of Unown". The game's own
  code agrees with "seen": the Pokédex records Unown letters when one is seen
  (`SetSeenUnownLetter`,
  https://github.com/pret/pokediamond/blob/b623abef1b4dfe204ca50aab42447ac00c134290/arm9/src/pokedex.c#L226-L237)
  and the only Unown-counting script command is `ScrCmd_CountSeenUnown`
  (https://github.com/pret/pokediamond/blob/b623abef1b4dfe204ca50aab42447ac00c134290/arm9/src/scrcmd.c#L4419-L4424).
  The Maniac's own script is a binary file in the decomp, so the exact
  command it calls is inferred, not read.
- Giratina static supplement: PKHeX's shared D/P static table lists species
  487, Level 70, location 62 (Turnback Cave), Altered Forme:
  https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen4/Encounters4DPPt.cs#L57
  The cached Turnback Cave article agrees under Special encounters → Pokémon
  Diamond and Pearl (wikitext L154–168): Giratina, level 70. Its introduction
  (L15) restricts entry to the Hall of Fame; the generated static uses the
  existing postgame chapter and an explicit Elite Four row requirement.
  Pinned article revision:
  https://bulbapedia.bulbagarden.net/w/index.php?title=Turnback_Cave&oldid=4663925
  An empty gap-fill file opts into the supplement path; only this
  sourced static is added, with no National Dex or provisional Rock Climb gate.
- Cross-checks (cite facts only): PokeFinder lists the
  D/P Great Marsh daily pool as 12 species before the National Dex and a
  different 14-species list after it
  (https://github.com/Admiral-Fish/PokeFinder/blob/3624cb7737da247f22d3afa5265a0698f8be8fc1/Core/Gen4/Encounters4.cpp#L194-L195),
  and swaps the pick into grass slots 6 and 7
  (same file, `modifyGreatMarsh`, L280-L287); every pool species has a Great
  Marsh row in the pack. PKHeX lists the D/P Giratina static at Level 70 in
  Turnback Cave, location 62
  (https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen4/Encounters4DPPt.cs#L57).
  pret/pokediamond keeps map collision, scripts and encounter tables as binary
  NARC files (`files/fielddata/land_data`, `script/scr_seq_release`,
  `encountdata`, at
  https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290/files/fielddata),
  so no map or script text could be read for gate tracing.
- https://bulbapedia.bulbagarden.net/wiki/Newmoon_Island,
  https://bulbapedia.bulbagarden.net/wiki/Flower_Paradise and
  https://bulbapedia.bulbagarden.net/wiki/Hall_of_Origin establish that the
  corresponding D/P event items were never legitimately distributed.
  Their PokeAPI encounter areas are excluded; external distribution/trade
  availability does not create native encounter rows.
- Art: https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-iv/diamond-pearl
  supplies regular/shiny art and form sprites. Sinnoh badge sprites use
  PokeAPI IDs 25–32; Fly/Defog use its Flying-type TM icon. Existing sourced
  `public/covers/d.jpg` and `p.jpg` are reused. Save import stays disabled.

- **Transfer/event exclusions:** PokeAPI supplies no Pal Park transfer
  encounters; those are not ordinary local catches. The 161 raw areas become
  158 after the three never-released native event areas are excluded
  (Newmoon Island, Flower Paradise and Hall of Origin).


- **Source coverage:** no official guide PDF or emulator/gameplay validation
  was available. The cached walkthrough/location pages supply chapter/gate
  evidence; a second independent source for every gate remains pending.
  `pret/pokediamond` map collision, scripts and encounter tables are binary
  NARC files, so access can't be audited from readable source; fossil
  revival code and the Unown seen-letter code are the readable parts.
  Imported form catalogs (for example Deoxys) are not claimed complete by
  this local-form implementation. No browser, DS hardware, clock transition
  or Ranger/GBA transfer interaction was exercised.

## Open questions

- The title remains a required Diamond/Pearl choice; tested Platinum and HGSS layouts stay separate.

- **Route 205 South:** the cached Route 205 description places the first
  grass and Honey Tree across the bridge blocked until Valley Windworks is
  freed. Keep the walking/tree rows gated; a blanket move to chapter 1 would
  open them too early. Independently trace the southern bank's fishing/Surf
  access before splitting those methods into an earlier chapter. Sources:
  `Sinnoh_Route_205` (Before the Eterna Forest) and walkthrough Part 5
  (Route 205 Southwest). The walkthrough lists grass and fishing together
  but does not establish grass access before the bridge opens.

- **Earliest encounter tiles:** walkthrough traversal requirements support
  the provisional Victory Road floor gates, but an independent collision-map
  trace is still needed for the first encounter tile on 2F/B1F and eastern
  passage. Check whether Strength/Rock Smash/Rock Climb are required before
  those earliest tiles, rather than merely for full traversal. Likewise,
  check Mt. Coronet 2F's earliest tiles before blanket Surf/Rock Climb and
  Turnback Cave's basin entrance before adding any Rock Climb gate. Turnback
  Cave currently uses only the sourced Hall of Fame requirement.

- **Ravaged Path:** the initial cave is available before Rock Smash; its
  water/fishing rows use Rock Smash provisionally because water lies beyond
  the rocks. Independently trace the original D/P map to verify the first
  reachable fishing tile. Route 218 grass/tree Surf and Eterna Forest's Cut
  Honey Tree bypass are separately sourced and modeled at row level.

- **Ruin Maniac:** the event now says "seen" (Bulbapedia wording plus the
  decomp's seen-letter Pokédex; see [Sources](#sources)). Still open: the exact
  original flag, since the Maniac's script is binary, and whether the
  10–25 intermediate cave's whole table should wait for the threshold. It
  currently shares the early cave chapter; only Maniac Tunnel and the !/?
  upper room need the event.

### Model limits

- **Conditional encounters:** the app labels GBA dual-slot cartridge, Radar,
  swarm, Honey Tree group, Great Marsh selection, Backlot guest, held fossil,
  NPC trade request and Regigigas party conditions. It does not configure a
  cartridge, daily roll, Honey Tree timer/group or trade-party inventory.
  Honey Tree rates describe the PokeAPI group table, not overall Munchlax
  probability. Great Marsh slot numbers remain in the generated data, while
  the UI labels them as daily Pokémon. PokeFinder's daily pool and slots 6–7
  match the pack, but it takes the pick as input, so the selection odds are
  still unverified.
