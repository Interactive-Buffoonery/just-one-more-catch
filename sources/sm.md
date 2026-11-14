# Sun and Moon (`sm`)

## Sources

Original Nintendo 3DS releases only: `sun`/`S`, `moon`/`M`. USUM is a
structural example, never evidence for this pack. The source/access inventory
and remaining manual checks are in `docs/sm-access-audit.md` and
`#open-questions` (Sun/Moon). This is a partial encounter dataset, not a
claim that every obtainable Pokémon or condition is represented.

- **Generated encounters and numbering:** cached PokeAPI species 1–802,
  their varieties' encounter responses, generation VII and
  https://pokeapi.co/api/v2/pokedex/16/ (`original-alola`, 302 entries).
  https://pokeapi.co/api/v2/version/27/ (Sun) and
  https://pokeapi.co/api/v2/version/28/ (Moon). `scripts/build_data.py sm`
  retains the version-specific methods, chances, levels and supplied
  conditions; it does not supply missing encounters. National bound 802:
  https://bulbapedia.bulbagarden.net/wiki/Pokémon_Sun_and_Moon
  identifies 81 new species, bringing the total from 721 to 802.
- **Story chapters and trial/grand-trial order:**
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Sun_and_Moon
  and its `/Part_1` through `/Part_32` pages. Parts 1–4: Iki Town starters,
  Hau'oli, Ilima/Normalium; 5–6: Route 3, Hala/Fightinium, Ten Carat Hill;
  7–8: Akala, Paniola, Lana/Waterium; 9–10: Kiawe/Firium,
  Mallow/Grassium; 11–12: Diglett's Tunnel, Konikoni, Olivia/Rockium,
  Hano; 14–15: Malie, Sophocles/Electrium; 16–17: Route 12,
  Acerola/Ghostium; 18–19: Route 15–17, Nanu/Darkinium; 20–22:
  Aether rescue, Poni, Hapu/Groundium; 23: Vast Poni Canyon/Dragonium;
  24: Ultra Space rescue and the first Solgaleo (Sun) or Lunala (Moon);
  25–27: Mount Lanakila, League, Tapus; 28–32: UB missions, Necrozma,
  Cosmog, postgame Poni. Mina has no trial in these games. Each chapter's
  `src` identifies its principal part; the inventory links local area pages.
- **Ride Pager, rather than HMs:**
  https://bulbapedia.bulbagarden.net/wiki/Poké_Ride and walkthrough Parts
  6, 8, 16, 18, 21. Hala registers Tauros after his grand trial. Lana
  registers Lapras on entering Brooklet Hill, before her trial; the Fishing
  Rod is her completion reward. Hapu registers Mudsdale on Route 12,
  Grimsley registers Sharpedo on Route 15 after the Aether House detour,
  and Hapu's grandmother registers Machamp on Ancient Poni Path. The
  pack's `hm` entries enforce preceding story milestones for manually
  selected tools, not fictional badge permissions for rides. Sharpedo is
  an explicit event. Charizard/Stoutland are omitted as catch access tools.
- **Area gates:** `data/sm.json` includes verbatim source excerpts beside
  each requirement. Walkthrough Parts 4–6 and location pages establish
  Verdant Cavern after Ilima, Tauros for Route 1's southern area/Ten Carat
  Hill, and Lapras for Kala'e Bay/Melemele Sea. Brooklet Hill's Totem's Den
  permits ordinary encounters after Lana; Lush Jungle opens after Mallow,
  with its eastern cave behind Machamp. Route 12 requires Mudsdale.
  Acerola's trial opens ordinary Megamart encounters and the Haina Desert
  gate. Ruins of Life/Hope/Abundance have Machamp blocks. Sharpedo opens
  Route 16 and the subsequent Route 17/meadow/lake branch. Vast Poni
  Canyon's outside area is beyond the first cave's Tauros rock (Part 23);
  its coarse inside area opens at the first cave. Resolution Cave's
  encounter approach requires Mudsdale (Part 30); Tauros only guards an
  optional side path. Champion gates for Poni Grove and its continuation:
  https://bulbapedia.bulbagarden.net/wiki/Poni_Grove and Parts 29–32.
- **Species-specific gates and gifts:**
  https://bulbapedia.bulbagarden.net/wiki/Gift_Pokémon (Sun/Moon section)
  gives Rowlet/Litten/Popplio at Iki Town, Eevee's Nursery egg, Route 8
  fossil restoration, Aerodactyl at Seafolk, and Hall-of-Fame Type: Null
  and Porygon. Fossils are purchased at Olivia's Konikoni shop: Sun sells
  Skull/Cover; Moon sells Armor/Plume. The cache lists all four revival
  gifts in both versions, so possession events allow a traded fossil;
  this does not claim that all four can be purchased in one version.
  https://bulbapedia.bulbagarden.net/wiki/In-game_trade supplies the SM
  trades (requested species are not encoded in PokeAPI's SM conditions).
  https://bulbapedia.bulbagarden.net/wiki/SOS_Battle unlocks SOS after
  Ilima; early SOS rows explicitly need Normalium. Route 5's northern
  Diglett waits for the Firium route approach:
  https://bulbapedia.bulbagarden.net/wiki/Alola_Route_5 .
- **Legendaries and Ultra Beasts:** walkthrough Part 24 gates Nebby's
  capture behind the Ultra Space rescue, before the League. Part 27 and
  https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Conflict establish the
  post-Champion Tapu encounters. Part 31 requires a party Solgaleo at
  night or Lunala by day and the reverse world for Cosmog. Part 18 and
  https://www.serebii.net/sunmoon/forms.shtml establish Zygarde assembly
  with 10/50 Cells/Cores at Route 16. Parts 28–30 establish consecutive
  missions: Nihilego; Buzzwole (Sun)/Pheromosa (Moon); Xurkitree;
  Kartana (Sun)/Celesteela (Moon); Guzzlord; then report to Wicke before
  Necrozma at Ten Carat Hill. Each mission is a separate event and rows
  additionally require Champion. No USUM Wormhole legends are added.
- **Magearna QR gift (both original versions):** level 50, collected at
  Antiquities of the Ages in Hau'oli City's Shopping District mall after
  becoming Champion and scanning the regional QR Code. Sources agree:
  - PKHeX, pinned encounter definition:
    https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen7/Encounters7SM.cs#L52-L56
    lists species 801, level 50 for SM. Its location 40001 is the gift's
    met-location, not its physical pickup site.
  - Bulbanews, pinned revision 59354, December 6, 2016:
    https://bulbanews.bulbagarden.net/w/index.php?title=American_region_Magearna_QR_Code_released&oldid=59354
    confirms both games, level 50, the Champion/QR prerequisite and the
    deliveryman at Antiquities of the Ages in Hau'oli City mall.
  - Cached Bulbapedia QR Scanner page:
    https://bulbapedia.bulbagarden.net/wiki/QR_Scanner#Special_QR_Codes
    confirms the Champion requirement. Cached Hau'oli City Sun/Moon
    Shopping District table lists the level-50 gift in both games:
    https://bulbapedia.bulbagarden.net/wiki/Hau%27oli_City#Shopping_District
    Serebii independently agrees on level, pickup site and Champion gate:
    https://www.serebii.net/sunmoon/qrevents.shtml
  SM opts into an empty gap-fill candidate file plus this explicit gift.
  The existing Hau'oli City chapter supplies the place; `row_needs`
  adds Champion and the `sm-magearna-qr` event, matching USUM's
  `magearna-qr`.
- **Clock:** https://bulbapedia.bulbagarden.net/wiki/Time and walkthrough
  Part 1: Sun follows console time; Moon's day/night cycle is 12 hours
  ahead. SM morning begins at 06:00 and night at 18:00. Weekday events
  still follow the console calendar. Device mode offsets Moon's hour
  only; manual mode already denotes in-game time. This differs from
  USUM's dawn setting and is tested in `scripts/check_clock.ts`.
- **Storage:** https://bulbapedia.bulbagarden.net/wiki/Pokémon_Storage_System
  lists 8/16/24/32 boxes of 30 for SM; the pack uses the maximum 32×30.
- **Forms:** https://www.serebii.net/sunmoon/alolaforms.shtml independently
  enumerates all 18 Alolan species (API form names supply types/sprites).
  Local defaults are Alolan; standard counterparts are trade/transfer
  forms, including standard Raichu/Exeggutor/Marowak that cannot evolve
  locally. https://www.serebii.net/sunmoon/forms.shtml establishes
  persistent Oricorio styles, Midday/Midnight Lycanroc (both wild in the
  canyon; no Dusk form), Silvally's 18 memories/types, Minior's seven core
  colours and Zygarde's 10%/50% forms. Battle transformations are excluded.
  The catalog is deliberately limited; see open questions for other forms.
- **Historical evolution overrides:**
  https://www.serebii.net/sunmoon/evolution.shtml supplies Alolan
  Raticate/Marowak night levels, Sandslash/Ninetales Ice Stone, the
  Vast Poni Canyon magnetic evolutions (Magnezone/Probopass/Vikavolt),
  Lush Jungle Moss Rock, Mount Lanakila Icy Rock/Crabominable,
  version-specific Lycanroc evolution, and Cosmoem's version-specific
  level 53 evolution. Alolan Persian uses friendship:
  https://www.serebii.net/pokedex-sm/053.shtml . These overrides avoid
  importing later-game evolution locations/stones from the modern API.
- **Excluded artifact:** https://bulbapedia.bulbagarden.net/wiki/New_Mauville
  places New Mauville in Hoenn, in generations III/VI. Two cached Sun
  records (Voltorb and Electrode) at `new-mauville-area` are therefore
  dropped, with no replacement Alola encounters invented. The double-space
  Verdant Cavern trial-site alias is normalized, preserving both raw
  Pheromosa method records.
- **Art:** https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon
  supplies the generic regular/shiny art fallback used for generation VII
  and form IDs. Existing identical USUM assets seeded the download cache;
  `scripts/fetch_sprites.py` verifies/populates the SM paths and sprite-fit
  metrics. Existing sourced libretro Sun/Moon box covers `su.jpg`/`mo.jpg`
  are reused (see Coming Soon box art above). No save-file reader mapping
  is enabled by registering these games.
- **In-game trade requests and Zygarde gift levels:** the seven NPC trades
  carry a `trade-<species>` condition through `row_needs`: Machop (Route 2)
  for Spearow, Bounsweet (Route 5) for Lillipup, Poliwhirl (Konikoni City)
  for Zubat, Happiny (Malie City) for Pancham, Alolan Graveler (Tapu
  Village) for Haunter, Steenee (Seafolk Village) for Granbull and
  Talonflame (Poni Gauntlet) for Bewear. Requested species: each location's
  cached Bulbapedia `Catch/entry7` Trade row (`tradename=`), agreeing with
  https://www.serebii.net/sunmoon/ingametrades.shtml ("Trader requests a").
  Offered species and levels (9, 16, 22, 27, 32, 43, 59):
  https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen7/Encounters7SM.cs#L128-L138
  (`TradeGift_SM`). The existing Zygarde gift row (levels 30 and 50) matches
  PKHeX's two Zygarde gift levels at Route 16 (location 118), each for
  both forms:
  https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen7/Encounters7SM.cs#L42-L50
  and walkthrough Part 18.

### Sun/Moon ambush terrain review

The cached location pages linked in `data/sm.json`'s `area_methods` establish
rustling grass/trees/bushes, flying shadows, dirt/sand clouds and Hano Beach's
water splashes. PokeAPI calls these `bubbling-spots` too. Only SM opts into
these place/species method corrections. Walkthrough Part 21 (linked above)
places Machamp registration after Part 20's Aether rescue; every SM Machamp
area also requires the existing Aether event.


- Requested trade species are now sourced.

## Open questions

The initial pack is partial. Its sourced access work list is
`docs/sm-access-audit.md`; independent review and gameplay checks remain.


- **Ambush source granularity:** land ambushes are now classified by cached
  terrain tables and no longer require the Fishing Rod. Haina's corrected
  SOS rows still lack weather conditions. Poni Wilds' Wailmer bubbling row
  combines fishing bubbles and water splashes under one PokeAPI method;
  Wailord's direct row is corrected to a Lapras water splash; its fishing
  SOS still requires the rod. Splitting Wailmer's mixed water table needs
  source-backed encounter overrides. USUM's analogous
  land rows remain unchanged; see `docs/sm-access-audit.md` for the list.

- **Missing PokeAPI conditions:** nearly every SM encounter-detail record
  has an empty condition list (Necrozma is the exception). Day/night
  availability, Island Scan weekdays and weather-dependent SOS allies
  therefore cannot be represented from this cache; the pack keeps the
  supplied rows/odds without inventing conditions. Both versions have 28
  Island Scan detail records; their weekday schedule is absent. Moon's
  clock is implemented, but cannot repair missing time-specific tables.


- **Missing places/gifts:** Trainers' School and the initial Akala-stage
  Poké Pelago table still need two agreeing sources for species, levels,
  versions and gates before adding supplemental rows. The existing pack
  format supports these rows; no build change is needed. Poké Pelago
  currently contains only Ula'ula/Poni/Champion-stage areas
  (https://bulbapedia.bulbagarden.net/wiki/Poké_Pelago).
  Marshadow is a distribution-only dex entry without an encounter row.

- **Zygarde level/form granularity:** the single gift row (Lv. 30-50)
  opens at 10 Cells. Walkthrough Part 18 lists Lv. 30 before Champion and
  Lv. 50 after, and the 50% Forme needs 50 Cells. PKHeX confirms both
  levels for both forms at Route 16:
  https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen7/Encounters7SM.cs#L42-L50 .
  Splitting by level and form needs per-form gift rows.

- **Coarse area/terrain gates:** independently trace the first reachable
  encounter tiles inside Vast Poni Canyon's combined `Inside` and
  `Northwest` records, including later Machamp/Lapras paths. The first
  cave opens with the Poni grand-trial chapter; the `Outside` record
  requires Tauros according to walkthrough Part 23. A single cache record
  can mix later terrain with earlier encounters; no unsourced whole-area
  Machamp/Surf requirement was added. Also verify whether Route 8's
  Wimpod chase needs any tool beyond normal route access; the cached
  location/walkthrough does not establish a compulsory tool gate.

- **Resolution Cave:** Part 30 establishes Mudsdale for the approach and
  puts Tauros on an optional item path. Verify the earliest encounter
  tiles on a map/in-game; the pack requires Mudsdale, not Tauros.

- **Pelago timing:** the cached Poni-stage table follows the sourced Poni
  arrival chapter; Ula'ula has an explicit arrival event and the last
  table requires Champion. Independently confirm stage-change timing and
  Isle Abeens upgrade/visitation mechanics; these are coarse progression
  stages rather than a complete Pelago simulation.

- **Form catalog:** all 18 regional defaults/counterparts plus persistent
  Zygarde, Oricorio, Lycanroc, Silvally and Minior forms are included.
  Other transferred/cosmetic forms (for example Shellos, Basculin,
  Pumpkaboo and cap Pikachu) are not exhaustively catalogued. Battle-only
  forms are intentionally excluded. Independently audit the remaining
  generation-VII transfer/form collection before calling it complete.

- **Evolution text:** the source-backed overrides cover the known regional
  and Alola-location differences. Independently audit remaining modern
  API evolution text for any other historical differences; no exhaustive
  SM evolution-chain/playthrough verification was performed.

- **Second-source access review:** the cached Bulbapedia walkthrough and
  local pages cover all 101 retained PokeAPI areas. Most terrain gates do
  not yet have an independent map/second-source confirmation. No pret SM
  decompilation or official SM guide was available. This is not a reason
  to replace sourced gates with remembered USUM mechanics.

### Model limits

- **Fossil granularity:** all four fossil revival species occur in both
  cached versions; ownership events permit a traded fossil. Only
  Skull/Cover are sold in Sun and Armor/Plume in Moon. Foreign fossil
  acquisition is not inventory-validated.
