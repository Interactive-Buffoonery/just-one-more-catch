# Omega Ruby and Alpha Sapphire (`oras`)

## Sources

- PokeAPI raw encounter table: https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/encounters.csv
  joined to `versions.csv`, `encounter_slots.csv` and `encounter_methods.csv`
  from the same directory. Version IDs 25 (`omega-ruby`) and 26
  (`alpha-sapphire`) each have 302 raw slots, 115 distinct location-area IDs
  and 132 distinct Pokémon IDs. These are raw source counts, not generated
  tracker rows. Each version has gift 21, gift-egg 2, static 39,
  devon-scope 6, horde 127, walk 94 and rock-smash 13 slots.
- API spot checks through `scripts/fetch_pokeapi.py`'s cache reader:
  https://pokeapi.co/api/v2/pokemon/383/encounters (Groudon: Omega Ruby),
  https://pokeapi.co/api/v2/pokemon/382/encounters (Kyogre: Alpha Sapphire),
  https://pokeapi.co/api/v2/pokemon/384/encounters (Rayquaza: both), and
  https://pokeapi.co/api/v2/pokemon/261/encounters (Poochyena: both).
- No Surf, Old Rod, Good Rod or Super Rod slots exist for either version
  in the audited raw table. No DexNav-specific method exists in these rows;
  this does not establish whether hidden encounters were encoded another way.
  The ORAS-only supplement below fills the missing tables.

- Coverage decision: PokeAPI remains primary. `scripts/bulbapedia_encounters.py`
  reads cached ORAS location tables into `data/oras-bulbapedia.json`.
  `scripts/build_data.py` uses a candidate only if the current cache has no
  PokeAPI row for its `(version, pre-rename area, method)` table, regardless
  of species. It never replaces an existing API table. Generated fallback
  rows carry `src: "bulbapedia"` and the location `url`. Rebuild after each
  API refresh to retire newly covered tables. Other packs do not opt in.
  The candidate file also retains the source section, habitat and rate text.
  Unknown rates use `c: 0` (the UI omits the percentage), with the source's
  unknown or qualitative rate retained as a condition. They are not 0% odds.
- All candidate URLs in `data/oras-bulbapedia.json` cite the exact cached
  location page; only `Catch/entryoras` rows are read, case-insensitively.
  Walkthrough and Horde Encounter summary tables are excluded to avoid
  duplicated encounters. Nested templates, form arguments, per-version
  flags, comma-separated levels, ranges, rate tooltips, DexNav divisions,
  route halves, cave floors and underwater sections are retained. Grass
  habitats sharing an area use their best table's odds, rather than adding
  the probabilities of two different patches of grass.
- Chapter access and story sequence use the ORAS walkthrough, not Emerald:
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Omega_Ruby_and_Alpha_Sapphire
  Parts 1–2 cover western Hoenn and the Devon Parts; Part 3 covers Briney's
  ferry and Steven's letter; Parts 4–6 cover Slateport, Mauville, rods, bikes
  and Rock Smash; Parts 7–10 cover the northern land route, Meteor Falls,
  Mt. Chimney, Lavaridge, Go-Goggles, fossils and Surf; Parts 11–14 cover
  the Weather Institute, Devon Scope, Fortree, Mt. Pyre and submarine raid;
  Parts 15–17 cover the eastern sea, Dive, Seafloor Cavern, Cave of Origin
  and Eon Flute; Parts 18–21 cover optional areas and Victory Road;
  Parts 22–25 cover the League, Delta Episode, starter gifts and Battle Resort.
  Each chapter/event in `data/oras.json` links its specific part. Earliest
  access to broad routes is separate from their underwater/northern grass.
- https://bulbapedia.bulbagarden.net/wiki/Badge
  Hoenn League's Generation VI entries establish the leaders and field-use
  rules: Stone/Cut, Dynamo/Rock Smash, Heat/Strength, Balance/Surf,
  Feather/Fly, Mind/Dive and Rain/Waterfall. Knuckle only gates Flash in
  RSE, not ORAS; no Flash badge rule is copied from Emerald. Fly is not a
  kit requirement for ordinary travel; the Registeel puzzle has its own event.
- https://bulbapedia.bulbagarden.net/wiki/HM
  The game-specific Hoenn move list agrees with the Badge table; ORAS uses
  seven HMs. Rock Smash is HM06 and Dive is HM07.
- https://bulbapedia.bulbagarden.net/wiki/Pokémon_Omega_Ruby_and_Alpha_Sapphire
  establishes the 3DS/Gen VI setting and starters. PokeAPI `pokedex/15`
  (`updated-hoenn`) supplies 211 regional entries; Generation VI ends at
  national #721. The main-game start gift is Treecko, Torchic or Mudkip on
  Route 101 (walkthrough Part 1 and API gift rows).
- https://bulbapedia.bulbagarden.net/wiki/Time#Generation_VI
  ORAS uses the 3DS clock after setting the bedroom clock; night starts at
  21:00. `nightFrom: 21` uses the existing coarse clock model; minute-window
  and party conditions from PokeAPI remain explicit special conditions.
- https://bulbapedia.bulbagarden.net/wiki/Pokémon_Storage_System
  Generation VI has up to 31 boxes of 30, with the last box unlocked after
  Rayquaza. The tracker uses maximum capacity, not progressive box unlocks.
- https://bulbapedia.bulbagarden.net/wiki/Granite_Cave
  “The player cannot access lower floors without the Mach Bike.” Both
  basement areas require the bike; the ground floor does not require Brawly.
- https://bulbapedia.bulbagarden.net/wiki/Meteor_Falls
  ORAS item locations explicitly require Surf/Waterfall for the inner cave,
  B1F and dead-end back room. Their source tables map to API's Back, B1F
  and Backsmall Room; the first room remains open on the initial visit.
- https://bulbapedia.bulbagarden.net/wiki/Hoenn_Route_115
  The northern section requires Surf. Grass/horde rows are gated separately
  from shore fishing; the whole route is not Surf-gated.
- https://bulbapedia.bulbagarden.net/wiki/Hoenn_Safari_Zone
  Generation VI Area 1/2/3/4 map to API SW/SE/NW/NE areas. ORAS allows
  either Bike plus Surf to access the northern areas; a confirmation event
  models that alternative without requiring both bikes. Long grass remains
  a source condition. Xatu (Area 2 grass) and Donphan (Area 4 grass) permit
  breeding Natu and Phanpy; neither has a direct ORAS row on this page.
- https://bulbapedia.bulbagarden.net/wiki/Scorched_Slab
  Surf is required for entry; Strength only makes a shortcut. Heatran waits
  for the Cave of Origin crisis. The shared B2F/B3F table is expanded over
  the matching API floors.
- https://bulbapedia.bulbagarden.net/wiki/Shoal_Cave
  High/low tide stays conditional. Ice-room access permits Strength OR the
  Mach Bike in ORAS, expressed as a condition rather than requiring both.
- https://bulbapedia.bulbagarden.net/wiki/New_Mauville
  ORAS requires Wattson's eye registration after Groudon/Kyogre, modelled by
  its own event. This replaces neither a key nor an Emerald story gate.
- https://bulbapedia.bulbagarden.net/wiki/Sea_Mauville
  Ordinary surface/interior water tables are separate. Spiritomb waits for
  the crisis; the Scanner requires Dive and the crisis, then Stern exchanges
  it for the version's bell. Both bell legendaries require the exchange.
- https://bulbapedia.bulbagarden.net/wiki/Southern_Island
  The main story gift is Latios in OR and Latias in AS. The Eon Ticket
  battle is the opposite species: "At the back of the island's forest is
  Latias (OR)/Latios (AS)". The API lists both statics in both versions, so
  `drop_rows` keeps one per version. They stay behind an explicit Eon Ticket
  event and do not claim the historical distribution is available today.
  The story visit starts with Steven "on the east side of Route 118", past
  the inlet, so Southern Island keeps its Surf gate.
- https://bulbapedia.bulbagarden.net/wiki/Hoenn_Route_118
  "From Mauville, the route is straightforward ... The western half of this
  path is composed of grassy terrain". Route 118 opens with Mauville; its
  water rows still need Surf or a rod through the encounter method.
- https://bulbapedia.bulbagarden.net/wiki/Hoenn_Route_111
  The Sandshrew Horde Encounter is only in the desert's sand table. The API
  files it under Route 111, so that copy is dropped in favour of the gated
  Route 111 Desert row.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Omega_Ruby_and_Alpha_Sapphire/Part_19
  Sealed Chamber uses Dig, Relicanth first and Wailord last. Separate puzzle
  confirmations gate Regirock (Strength), Regice (wait) and Registeel (Fly).
  Regigigas also waits for the crisis; API party/item/day conditions remain.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Omega_Ruby_and_Alpha_Sapphire/Soaring_Legendaries
  supplies Ho-Oh/Lugia for Trackless Forest, maximum friendship for Nameless
  Cavern, maximum EVs for Pathless Plain and the party prerequisites for the
  sky rifts, Fabled Cave and Gnarled Den. Version flags and API time/day
  conditions stay intact. These are special conditions, not automatic party
  inspection; the app cannot inspect the player's cartridge party.
- https://bulbapedia.bulbagarden.net/wiki/Mirage_spot
  Daily Mirage spots require the Eon Flute and are selected daily or received
  by StreetPass. The 32 API daily-spot areas and Crescent Isle stay conditional;
  no missing individual Mirage table is reconstructed from another game.
- https://bulbapedia.bulbagarden.net/wiki/DexNav
  Hidden Pokémon unlocked after defeating/capturing Groudon/Kyogre retain
  their source divisions and receive the `primal` event gate. Ordinary
  DexNav encounters are labelled special; no search-level bonus is invented.
- https://bulbapedia.bulbagarden.net/wiki/Fossil
- https://bulbapedia.bulbagarden.net/wiki/Gift_Pokémon#Pokémon_Omega_Ruby_and_Alpha_Sapphire
  supply the nine level-20 Devon revivals. Root/Claw follow Go-Goggles;
  Mirage fossils follow the crisis. OR: Dome/Armor/Plume; AS: Helix/Skull/Cover;
  Old Amber is shared. Root/Claw are a choice, not two guaranteed gifts.
  Each hand-written row carries this source and its required fossil condition.
- https://bulbapedia.bulbagarden.net/wiki/Mossdeep_City
  Beldum is a level-1 gift after the Hall of Fame; Space Center Kecleon is
  after the Delta Episode. Cosplay Pikachu follows the first Contest (Part 4),
  Castform follows the Weather Institute (Part 11), and the Togepi egg follows
  the crisis (Lavaridge location page). API gifts/eggs remain primary.
- https://bulbapedia.bulbagarden.net/wiki/In-game_trade
  The three location-table trades retain their offered species conditions:
  Slakoth/Makuhita, Spinda/Skitty and Bellossom/Corsola. They are not gifts.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Omega_Ruby_and_Alpha_Sapphire/Part_23
  Sky Pillar opens during Delta; Rayquaza precedes Deoxys. Part 24 supplies
  the S.S. Ticket and Unova starter gift; Part 25 supplies the Sinnoh starter
  after a League rematch. The Johto gift follows the first Hall of Fame.
  The game article describes Deoxys's four freely changeable persistent forms
  using the meteorite in Cozmo's house; battle-only Mega/Primal forms are omitted.
- Second source (PKHeX, GPL; facts only, nothing copied): https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen6/Encounters6AO.cs
  Lists the ORAS tables by location ID, with levels. Starters (level 5, Route 101,
  L39-L54), Rustboro fossil revivals (level 20, L56-L67), Hot Springs Wynaut and
  Togepi eggs (level 1, L69-L71), Beldum (level 1), Castform (30), Sharpedo and
  Camerupt (40), the three Regis (40), Regigigas (50), Rayquaza (70), Deoxys (80)
  (L73-L85), the Hoopa-ring legendaries (50, L87-L101), Kecleon (40 Lavaridge, 45
  Mossdeep), Spiritomb (50, Sea Mauville), the Soaring group (L112-L120), the version
  statics (L129-L151: Latias/Latios 30, Groudon/Kyogre 45, Ho-Oh/Lugia 50, the
  Electrode at the Magma/Aqua hideout 40) and the three trades (L157-L161: Makuhita 9,
  Skitty 30, Corsola 50) all match the generated rows. Location IDs resolve through
  https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Resources/text/locations/gen6/text_xy_00000_en.txt (line = ID + 1; e.g. 302
  New Mauville, 304 Sea Mauville, 190 Rustboro City). Two differences, both left
  unchanged and listed in [Open questions](#open-questions): Voltorb at New Mauville is level 20
  here (L109) but 25 in PokeAPI and on the New Mauville page, and Tyrunt/Amaura are
  listed as Rustboro revivals (L66-L67) while the Fossil page says Jaw/Sail Fossils
  are absent from ORAS and only transferable. The same file has one location ID per
  cave (Seafloor Cavern 294, Victory Road 298, Shoal Cave 300), so it does not
  separate floors or rooms. pk3DS
  https://github.com/kwsch/pk3DS/blob/6daaca934ca2284a73ab743bf89c848c57cd9de1/pk3DS.WinForms/Subforms/Gen6/RSWE.cs#L318-L329
  labels each ORAS encounter file with the ROM's met-location name for its zone,
  so floors of one cave share a name and it cannot map PokeAPI's numbered cave
  areas either.
- Sprites: https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon
  ORAS uses the same supplied static regular/shiny national artwork fallback
  as USUM. The Gen VI folders primarily supply animated artwork, whereas the
  existing tracker requires static PNGs. Generic files already present are
  reused byte-for-byte, excluding USUM's Alolan replacements. Deoxys form
  sprites use the same upstream set. Existing Hoenn badge art (IDs 17–24)
  and full box covers `or.jpg` / `as.jpg` are reused; cover sources are in
  the box-art section above. No artwork or UI redesign is introduced.

ORAS evolution-location overrides: [New Mauville](https://bulbapedia.bulbagarden.net/wiki/New_Mauville) identifies the Gen VI magnetic field for Magnezone/Probopass; [Petalburg Woods](https://bulbapedia.bulbagarden.net/wiki/Petalburg_Woods) identifies its ORAS Moss Rock; [Shoal Cave](https://bulbapedia.bulbagarden.net/wiki/Shoal_Cave) identifies the ORAS Ice Rock. These replace the API evolution chain’s Sinnoh locations.

Sylveon retains the cached [PokeAPI Eevee chain](https://pokeapi.co/api/v2/evolution-chain/67/) Gen VI affection threshold of 2 plus a Fairy move, explicitly restored in its pack override because the generic text renderer omits affection. The [ORAS game article](https://bulbapedia.bulbagarden.net/wiki/Pokémon_Omega_Ruby_and_Alpha_Sapphire) confirms all contemporary Eevee evolutions are obtainable. Seafloor Cavern rooms 5/6 water rows also receive Rock Smash and Strength: walkthrough Part 16 describes both obstacles in room 1 before these rooms. Generic API walking rows retain the broad entry gate pending a tile-level audit.

Implementation verification: 721 catalog entries, 272 directly encountered species, 154 distinct generated areas, 1,328 combined-version rows (306 API; 1,013 location-table gap fills; nine hand-written fossil revivals), 19 chapters and 24 events. Hoenn dex: 132/211 have direct encounters; family closure through evolution/breeding reaches 210/211, excluding event-only Jirachi. All eight existing generated encounter packs rebuild byte-identically. The supplied cache omitted `pokedex_4.json`; for this comparison it was reconstructed locally from the supplied read-only PokeAPI `pokemon_dex_numbers.csv` and `pokemon_species.csv`, without fetching the API.


- **Second source and runtime:** PKHeX now second-sources the starters,
  fossil revivals, eggs, gifts, statics, Hoopa-ring and Soaring legendaries,
  Kecleon and the three trades (levels and locations; see [Sources](#sources)). No ORAS
  guide PDF, independent two-pass access audit, browser QA, guest persistence,
  account sync, cartridge or emulator gameplay was verified. One independent
  review checked about
  36 gap-fill rows against the cached pages and fixed the Eon Ticket statics,
  western Route 118 and the duplicate desert Sandshrew horde. Save-file
  import is not enabled.

## Open questions

- **Upstream coverage remains partial.** The pack now fills missing ORAS
  tables from cached Bulbapedia location pages, keeping PokeAPI primary per
  version/area/method. The generated rows retain provenance. Rebuild after
  refreshing the API cache to retire covered fallback tables. Upstream
  issues #1456/#621 and partial PR #1542 remain the background for this gap.

- **Daily Mirage tables:** all 32 API daily-spot areas are retained, but only
  the generic Mirage spot page was cached. Individual spot ordinary-water,
  hidden and Rock Smash completeness was not independently established.
  Do not claim the national encounter catalog is exhaustive. Check those
  individual ORAS pages when they become available. Random daily/StreetPass
  availability is displayed as a condition, not predicted.

- **Regional coverage:** 211 dex entries; 132 have direct encounter rows
  across the pair. Family closure via evolution and breeding reaches 210;
  Jirachi is event-only and deliberately has no rows. Natu and Phanpy have
  no direct ORAS table entries; Xatu and Donphan occur in the Gen VI Safari
  tables and provide breeding paths. The existing app does not infer every
  reverse breeding path in its recommendation text, so these two may still
  read as trade-only rather than describing breeding. No Gen III Safari
  encounters were copied.

- **Source-table granularity:** API's generic Seafloor Cavern table is kept;
  supplemental room annotations distinguish its water/walking tables.
  Water encounters in rooms 5/6 also require the sourced Rock Smash/Strength
  traversal. The generic API walking table only requires Dive for entry;
  review first reachable walking tiles independently before calling every
  encounter "catchable now" exact.
  Victory Road B1F/2F first encounter tiles similarly need a floor-by-floor
  check against the Surf/Strength route; the entrance area only needs Waterfall.
  Neither PKHeX nor pk3DS can settle this: PKHeX's ORAS location list has one
  ID per cave ([Seafloor Cavern 294, Victory Road 298, Shoal Cave 300](https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Resources/text/locations/gen6/text_xy_00000_en.txt#L295)),
  and pk3DS labels each ORAS encounter file with the ROM's met-location name
  ([RSWE.cs L318-L329](https://github.com/kwsch/pk3DS/blob/6daaca934ca2284a73ab743bf89c848c57cd9de1/pk3DS.WinForms/Subforms/Gen6/RSWE.cs#L318-L329)), so every floor shares that one name.

- **Safari grass/bike alternatives:** the northern-area confirmation models
  either bike plus Surf. Specific long-grass access may need the other bike;
  the condition is retained, but individual grass patches have not been traced.

- **Shoal Cave:** low/high tide conditions are retained and the ice room
  states Strength OR Mach Bike. Mapping the API B1F/B2F areas to the location
  page's shared low-tide table remains uncertain; no extra floor rows were
  guessed. The generic low-tide walking table is included.
  The PKHeX/pk3DS limit above applies here too.

- **Access details awaiting independent review:** Route 123's western access
  versus encounter grass, Route 120's east/west grass, optional Kecleon timing
  on Route 119/Lavaridge, and the earliest northern Route 115 approach. Source
  location/walkthrough citations are recorded; there is no ORAS decompilation
  or cartridge collision-path proof in this implementation.

- **Forms:** Deoxys's four persistent forms are cataloged. Cosplay Pikachu
  uses the existing species gift row but its outfits are not separately tracked;
  other imported/persistent form catalogs (Rotom, Kyurem, Therian formes,
  seasonal/cosmetic variants) need a separate verified catalog pass. Mega and
  Primal battle transformations remain excluded.

- **From that review, still open:** Route 120's western part (Ancient Tomb
  side) has no Feather Badge gate, which only affects Goldeen by fishing.
  Regigigas's three-Regi party requirement is shown as a condition rather
  than a gate.

- **New Mauville Voltorb level:** PKHeX lists the static Voltorb at level 20
  ([Encounters6AO.cs L109](https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen6/Encounters6AO.cs#L109),
  location 302); PokeAPI and the Bulbapedia New Mauville page say 25. Data is
  unchanged. Needs a cartridge check.

- **Jaw and Sail Fossils:** PKHeX lists Tyrunt and Amaura as level 20 Devon
  revivals at Rustboro
  ([L66-L67](https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen6/Encounters6AO.cs#L66-L67)),
  and Bulbapedia's Fossil page says the fossils are absent from ORAS but can
  be transferred from X/Y. No rows are added: should the Devon gift rows offer
  "Bring Jaw Fossil / Sail Fossil (from X/Y)"?


- Gen 4 Masuda odds: Serebii gives 1/2048; approximately 1/1638 is reported elsewhere. Unsettled; Masuda is disabled for Gen 4.

- NPC trades assumed not reset-huntable (unchecked)

- egg groups taken from current PokeAPI data; per-game changes before Sword/Shield not spot-checked

### Model limits

- **National/clock limitations:** the existing tracker treats nonregional
  species as post-League in recommendations even though ORAS's crisis can
  unlock DexNav and Soaring species before the League. Minute windows, party
  prerequisites, tide and daily spots remain special conditions rather than
  live cartridge checks. The coarse clock model does not expose Gen VI's
  evening separately. No shared progression redesign was made.
