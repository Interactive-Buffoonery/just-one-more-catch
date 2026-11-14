# Black and White (`bw`)

## Sources

Original Black (`black`, code `k`) and White (`white`, code `w`), not B2W2.
The supplied Bulbapedia raw-wikitext cache was read locally. No Bulbapedia
requests or bulk PokeAPI fetch were made. Individual `src` and `quote` fields
in `data/bw.json` record chapter, area, event and row evidence.

### Metadata and assets

- https://bulbapedia.bulbagarden.net/wiki/Pokémon_Black_and_White_Versions
  identifies Nintendo DS, generation V, Unova, 156 introduced Pokémon and
  the national bound of 649. The original Unova dex includes Victini #000:
  https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_by_Unova_Pokédex_number_in_Pokémon_Black_and_White
  https://pokeapi.co/api/v2/pokedex/8/
  The generator and regional visibility/counting now accept zero as a dex
  number. Existing pack generation was checked byte-for-byte.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_and_White/Part_1
  sources Nuvema Town and Snivy/Tepig/Oshawott starter gifts. The gift choice
  remains the existing shared starter interaction.
- https://www.serebii.net/blackwhite/gyms.shtml and walkthrough parts 2–11:
  Trio/Cilan-Chili-Cress, Basic/Lenora, Insect/Burgh, Bolt/Elesa,
  Quake/Clay, Jet/Skyla, Freeze/Brycen, Legend/Drayden (Black) or Iris (White).
  Shared pack leader labels show both version possibilities.
- https://bulbapedia.bulbagarden.net/wiki/HM#Generation_V
  and https://bulbapedia.bulbagarden.net/wiki/Badge#Unova_League
  explicitly say badges are not needed for field HMs in generation V.
  `hm` is empty. Cut, Surf, Strength and Waterfall remain checklist items;
  Rock Smash is not a field move here. Fly, Flash and Dive do not open any
  separately represented encounter area in this dataset and are not kit
  requirements. Dive's Abyssal Ruins has no wild encounter table.
- https://bulbapedia.bulbagarden.net/wiki/Pokémon_Storage_System
  gives 8/16/24 boxes of 30; the tracker uses the maximum 24. This page also
  sources the full-party/full-720-box-slots exception for the castle dragon.
- https://bulbapedia.bulbagarden.net/wiki/Time#Generation_V
  says seasons change monthly, time intervals vary with season, and wild
  Pokémon no longer vary with time of day. No fixed `nightFrom` is invented.
  PokeAPI season conditions remain visible as "Spring only", etc.; the
  tracker does not automatically evaluate seasons against the clock.
  The supplied `Season` cache page is about the anime, so it was not used
  as game-mechanic evidence.
- https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-v/black-white
  supplies both regular and shiny sprites 1–649, including the selected
  cosmetic forms. Downloaded and centred, with ring-fit data regenerated.
  https://github.com/PokeAPI/sprites/tree/master/sprites/badges supplies
  Unova badge sprites 33–40. Existing `bl.jpg` and `w.jpg` are reused; their
  libretro source URLs are recorded in the Box art section above.
  Cover legendary typings provide the two colour-ring pairs.

### Chapters, physical access and story events

- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_and_White
  and its parts 1–18 give the story sequence. Chapter grouping is a tracker
  convenience, not a claim that all optional visits occur in guide order.
- https://bulbapedia.bulbagarden.net/wiki/Unova_Route_8 and
  https://bulbapedia.bulbagarden.net/wiki/Unova_Route_9 establish that Tubeline
  Bridge blocks Route 9 until receiving the Light Stone/Dark Stone.
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_and_White/Part_10
  sources Lenora handing over the stone at Nacrene Museum after Relic Castle.
- https://bulbapedia.bulbagarden.net/wiki/Dreamyard
  separates the monkey gift outside the ruins from grass behind Cut. The
  basement and southern dark grass open after N and Ghetsis via the fence
  gap beside the tree, without Cut. Part 13 says
  the static Musharna is Friday-only after the main story. PokeAPI's B1F
  static omits Friday; a sourced row condition adds it and labels the
  encounter Dreamyard. PokeAPI also lists a second, aboveground Musharna
  static; `drop_rows` removes it. Dreamyard: "A Musharna appears in the
  basement every Friday after defeating Ghetsis." Part 13: "On Fridays only,
  a Musharna will appear in the eastern patch of grass" in the basement.
  PKHeX `Encounters5BW.cs` line 162 lists one Musharna static at Dreamyard:
  https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen5/Encounters5BW.cs#L162
  ("Musharna @ Dreamyard Friday Only", hidden ability).
  Gift Pansage/Pansear/Panpour depend on Tepig/Oshawott/Snivy respectively;
  sourced per-row conditions add the missing PokeAPI starter qualifiers.
- https://bulbapedia.bulbagarden.net/wiki/Pinwheel_Forest
  explicitly permits the exterior before Basic, but blocks the interior
  until Basic. The east interior opens with the Bicycle; Rumination Field
  opens after battling Cobalion. The latter is an event, not a badge proxy.
- https://bulbapedia.bulbagarden.net/wiki/Unova_Route_5
  blocks the drawbridge until Elesa; Route 5 itself is listed with Nimbasa.
  https://bulbapedia.bulbagarden.net/wiki/Unova_Route_16
  allows the ordinary Lostlorn path immediately from Nimbasa but requires
  Strength for dark grass. Marvelous Bridge waits for the postgame.
  Route 6 is grouped with Driftveil before defeating Clay; the web at
  Chargestone Cave is a separate Clay event, sourced by walkthrough part 7.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_and_White/Part_8
  gives Surf after the Jet-badge Cheren battle, and opens Routes 17/18,
  P2 Laboratory and Mistralton Cave. Surf side areas use a kit requirement,
  rather than inventing badge permission for a traded Surf user.
  https://bulbapedia.bulbagarden.net/wiki/Mistralton_Cave
  requires Surf to enter; the part-8 boulder path requires Strength for
  Guidance Chamber and Cobalion. Cobalion's static is displayed there even
  though PokeAPI places it under the cave-wide area.
- https://bulbapedia.bulbagarden.net/wiki/Dragonspiral_Tower
  permits the entrance before Freeze, but the ramp to the interior and
  outer grassland appears after Freeze. N awakening the dragon is a separate
  event, sourced by walkthrough part 9.
- https://bulbapedia.bulbagarden.net/wiki/Relic_Castle
  and walkthrough parts 5, 10 and 13 distinguish the initial two floors,
  deeper story floors after N awakens the dragon, and the postgame maze and
  Volcarona chamber. Cached encounter tables identify A as 1F/B1F (19–22),
  B as the deeper Krokorok/Cofagrigus table (34–37), C as the postgame maze,
  D as the Claydol/Volcarona rooms. Lettered areas stay distinct.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_and_White/Part_11
  sources Route 10, the eight badge-check gates, Victory Road and the
  Strength boulder before Trial Chamber. Ordinary Victory Road rooms are
  not blanket-gated by optional Surf/Strength. Unknown PokeAPI room labels
  are retained without pretending to know their floor mapping.
  https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)
  requires the Cobalion encounter before Trial Chamber. PokeAPI's Terrakion
  in "4F Middle Room" is displayed as Trial Chamber with these prerequisites.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_and_White/Part_12
  places the version-specific Reshiram/Zekrom catch in N's Castle after the
  Elite Four, before N/Ghetsis and the credits. `Elite Four` alone therefore
  does not open the postgame: the `ghetsis` event is also required.
  Dragonspiral Tower's fallback dragon additionally requires confirming
  that the castle catch was deferred by full storage.
- https://bulbapedia.bulbagarden.net/wiki/Unova_Route_11
  explicitly blocks the eastern circuit until Team Plasma is stopped.
  Walkthrough parts 16–18 cover Village Bridge, Routes 11–15, Giant Chasm,
  Undella and Marvelous Bridge. They are not delayed until the Alder rematch
  merely because the walkthrough visits them afterward. Route 11 dark
  grass uses Surf/Waterfall, while its initial grass remains accessible.
- https://bulbapedia.bulbagarden.net/wiki/Challenger's_Cave
  requires defeating the Elite Four and Team Plasma; the ordinary entrance
  floors have no blanket Surf gate. Full lowest-floor traversal needs Surf,
  but the source does not prove that the first encounter tile does.
- https://bulbapedia.bulbagarden.net/wiki/Abundant_Shrine
  requires Surf and Waterfall. Landorus also needs both roamers in the
  party, with the own-version roamer bearing the player's Trainer ID.
- https://bulbapedia.bulbagarden.net/wiki/Giant_Chasm
  sources the central-pond snow event that opens Kyurem's cave. This is not
  B2W2's Plasma Frigate or DNA Splicers quest.

### Gifts, special encounters, forms and missing data

- https://bulbapedia.bulbagarden.net/wiki/Phenomenon
  says rustling grass, dust clouds, flying shadows and rippling water only
  appear after the first badge. Early phenomenon rows explicitly need Trio;
  later chapters already imply it. Fishing ripples need Super Rod, water
  ripples need Surf. Dark grass is a separate walking method.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_and_White/Part_13
  gives Looker's Super Rod and Cedric's National Mode after the credits.
  Fishing requires the Super Rod kit item; national visibility follows the
  shared Elite Four switch, with postgame areas additionally requiring N
  and Ghetsis. That visibility simplification is listed in open questions.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_and_White/Part_5
  sources Cover/Plume choice and Nacrene revival. Part 14 sources the seven
  older fossils from the Twist Mountain worker in the postgame. PokeAPI's
  exact fossil item conditions are retained. Part 8 sources the Route 18
  Larvesta Egg; part 18 sources the Marvelous Bridge Magikarp seller.
- https://bulbapedia.bulbagarden.net/wiki/Liberty_Garden
  requires the discontinued event Liberty Pass for Victini. This is an
  explicit event checklist, not an assertion that the pass is still issued.
- https://bulbapedia.bulbagarden.net/wiki/Castelia_City
  requires a fateful-encounter Celebi and spare Poké Ball for Zorua.
  https://bulbapedia.bulbagarden.net/wiki/Lostlorn_Forest
  requires an event Shiny legendary beast to trigger Zoroark.
- https://www.serebii.net/blackwhite/evolution.shtml
  sources Chargestone Magnezone/Probopass, Pinwheel Leafeon, Twist Mountain
  Glaceon, Prism Scale Milotic, and Karrablast/Shelmet trade partners. These
  are pack-local overrides of modern PokeAPI evolution-chain text.
- https://www.serebii.net/blackwhite/forms.shtml
  sources both Basculin stripes (including the opposite stripe in rippling
  water), all seasonal Deerling/Sawsbuck and Route 9 appliance Rotom.
  These are collectible persistent forms; battle-only Darmanitan Zen Mode
  and Meloetta transformations are excluded. No Therian forms or fused
  Kyurem from B2W2 are added. The older transfer-only cosmetic catalog is
  not claimed complete; see open questions.
- https://bulbapedia.bulbagarden.net/wiki/Black_City and
  https://bulbapedia.bulbagarden.net/wiki/White_Forest
  distinguish the version-dependent settlements. PokeAPI supplies no White
  Forest encounters for White in this cache. No Black City wild encounters
  or fabricated White Forest rows are added.
### Supplemental trades, statues and roamers

The existing gap-fill path supplies these rows without changing shared code.
The empty `data/bw-bulbapedia.json` opts in; explicit rows are in
`extra_encounters`, and prerequisites are in `row_needs`. NPC trades retain
partner conditions; Munchlax also retains `season-summer`. The RageCandyBar
step sits in the Icirrus chapter, its earliest source.
Roamers use one region-wide entry per version, not a fictitious fixed Route 7
capture. Legend and the house-story release are separate prerequisites.

- [PKHeX trades, pinned lines 197–214](https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen5/Encounters5BW.cs#L197-L214):
  species, fixed levels and versions agree with the cached Bulbapedia trade
  table (lines 1328–1454):
  https://bulbapedia.bulbagarden.net/wiki/In-game_trade#Pokémon_Black_and_White
  Petilil L15 Black / Cottonee L15 White at Nacrene for the opposite species;
  Basculin L25 at Driftveil for Minccino (Red-Striped Black, Blue-Striped White);
  Emolga L30 on Route 7 for Boldore; Rotom L60 on Route 15 for Ditto;
  Munchlax L60 at Undella for Cinccino, summer only.
- Location-table cross-checks (BW sections, not their sequels):
  https://bulbapedia.bulbagarden.net/wiki/Nacrene_City (lines 173–174),
  https://bulbapedia.bulbagarden.net/wiki/Driftveil_City (lines 213–214),
  https://bulbapedia.bulbagarden.net/wiki/Unova_Route_7 (lines 27, 204),
  https://bulbapedia.bulbagarden.net/wiki/Unova_Route_15 (lines 21, 73),
  https://bulbapedia.bulbagarden.net/wiki/Undella_Town (lines 84, 117).
  Existing chapter access is preserved: Nacrene after Trio; Driftveil after
  Bolt; Route 7 after Quake and Clay clearing the web; Route 15 and Undella
  after the Elite Four and Ghetsis.
- [PKHeX Darmanitan, pinned line 166](https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen5/Encounters5BW.cs#L166)
  confirms level 35, Desert Resort and Hidden Ability. The cached second
  source, https://bulbapedia.bulbagarden.net/wiki/Desert_Resort, lines 112–124,
  gives five statues on the first visit, level 35 and a required RageCandyBar.
  The earliest RageCandyBar is a winter gift in Icirrus City:
  https://bulbapedia.bulbagarden.net/wiki/Icirrus_City (lines 43, 124) and
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_and_White/Part_9
  (lines 230–233, "Only during Winter"). Desert Resort (line 53) adds a
  second one from Professor Juniper after Ghetsis.
- [PKHeX Tornadus, pinned line 186](https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen5/Encounters5BW.cs#L186)
  and [Thundurus, pinned line 192](https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen5/Encounters5BW.cs#L192)
  confirm level 40, roaming and version exclusivity. Cached
  https://bulbapedia.bulbagarden.net/wiki/Roaming_Pokémon#Generation_V,
  lines 323–359, independently gives both versions/levels, Legend and the
  Route 7 house-story trigger, region-wide movement and stormy bulletin boards.
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_and_White/Part_11,
  lines 220–225, agrees on Legend, release, level 40 and storm tracking.

Cached Bulbapedia snapshots used above are pinned here by SHA-256 so the
line references identify the inspected content (no live revision ID is
available in the cache):

- `In-game trade.wiki`: `9cd662a7192e6d1e4d40da5bd9575eb63c22e0c85638e530bc586c8d60b7dd10`
- `Nacrene City.wiki`: `2dc3c9b0b4fe9d7e4f1a6a204d76482894c83de291209fb21b9d742b6c6991bf`
- `Driftveil City.wiki`: `fe183437e9553f43bc458279e7e6916da46b30b7a8a4bd73ff5886d5ffd927e6`
- `Unova Route 7.wiki`: `40922e825d2a4bed724cf01538d6e03f4de158a2704fb2c049aa6c8e928939cc`
- `Unova Route 15.wiki`: `eb72dc9ac1e47ce956ce383dff7577ae6499433d9005576c6b68960ff65dea00`
- `Undella Town.wiki`: `de6033c2ceb7dcdf45e111a5c68c25bc2e534fb3b6eae427f1e4bc68af55c30f`
- `Icirrus City.wiki`: `ee2b5435f0c3deb89aed40c00611634f27be3a40a38be0d86857988e3f5fc866`
- `Walkthrough:Pokémon Black and White_Part 9.wiki`: `e686e0da3ab29aad6bd1d8d9de3a04db353b4cfb4b4d487f4201b4a34cc8c2a2`
- `Desert Resort.wiki`: `38ec34aa040f007debda943125f12bf7200cf41774ff1629a94fdf80525d7ecc`
- `Roaming Pokémon.wiki`: `c9ad7646efe50bde1b0e875a2e330c8c37aa766babf69243bac66dccd301edb5`
- `Walkthrough:Pokémon Black and White_Part 11.wiki`: `df150c8d085d80264698a949e316e9bd01597c944d264105737e385f3b712797`

No save-file mappings or reader-support claims were added. No BW pret source
was available in the listed pret repositories, and no decompilation or game
was built. There was one source/terrain review in this implementation; the
Independent access review remains pending.


- **Review coverage:** all 87 retained encounter areas map to cached source
  pages; walkthrough and important exceptions were inspected once. No
  exhaustive independent access audit, scanned-guide cross-check, BW script
  verification, browser/guest/account-sync QA, save-file import, emulator
  or cartridge playthrough was performed. Missing second sources did not
  block integration. Three independent-review findings were checked against
  cached sources and corrected: the Route 9 stone gate, Black Landorus's
  deferred-catch condition, and Cut on Dreamyard dark grass/B1F.
  See `docs/bw-access-audit.md` for the reviewer work list.

The existing gap-fill format now supplies the six NPC-trade species and
  Desert Resort's level 35 Darmanitan statues, with trade partners, Munchlax's
  summer restriction and the RageCandyBar prerequisite.

- **Roamers:** Tornadus (Black) and Thundurus (White) now appear at level 40
  under Roaming Unova after Legend and the Route 7 release. Gate bulletin
  boards identify their stormy-weather route.

## Open questions

- **PokeAPI gaps:** White Forest encounters and swarm conditions remain absent.
 White Forest needs
  two-source population tables; swarms need two-source route/species tables.
  Do not add rows to Black City for White Forest.

   Exact time-of-day route filtering
  remains unmodeled; the broad roaming entry does not claim a fixed catch site.

- **Victory Road unknown rooms:** PokeAPI has `unknown-area-53` through
  `unknown-area-66` (with gaps) and `1f-unknown-room`. Their room identities
  and first encounter tiles need a map/script or game audit. They retain
  individual labels/tables under Legend, without invented Surf/Strength
  requirements. Terrakion is displayed in Trial Chamber with Cobalion and
  Strength, following walkthrough part 11 rather than PokeAPI's 4F label.

- **Combined cave tables:** Wellspring Cave is one PokeAPI area and Twist
  Mountain combines B1F–3F. The pack cannot separate Surf-only Wellspring
  basement encounters or winter-only Twist Mountain passages without more
  detailed encounter data. Mistralton Cave also combines ordinary floors;
  its earliest floor needs Surf while Cobalion/Guidance additionally needs
  Strength. Challenger's Cave B2F has a Surf traversal requirement, but the
  source does not settle whether the first encounter tile needs Surf. Its
  blanket gate is currently postgame only; verify this on the map/in game.

- **Seasons and time:** all PokeAPI `season-*` conditions remain, displayed
  as special requirements rather than automatically filtered by date. The
  cache's `Season` is the anime page; `Time#Generation_V` establishes monthly
  seasons and variable clock intervals. Winter changes in Icirrus/Route 8/
  Moor, snow paths and season-specific box forms need gameplay verification.
  No fixed night boundary is asserted and no wild time-of-day rows exist.

- **Forms:** local Basculin stripes, seasonal Deerling/Sawsbuck and Rotom
  appliances are sourced. Older transfer-only form families (Unown, Burmy,
  Shellos, Giratina and others) are not exhaustively catalogued for BW.
  Do not add B2W2-only Therian formes or fused Kyurem. Deferred additional
  catalogs need game-specific sources and regular/shiny sprite verification.

### Model limits

- **National visibility:** the shared UI exposes national species with the
  Elite Four switch, slightly before Cedric's post-credits upgrade. Areas
  after Team Plasma additionally require `ghetsis`; consider a future
  pack-specific national-unlock model if this distinction matters.

- **Choice tracking:** starter conditions label the appropriate Dreamyard
  monkey gift, but do not consume a gift choice. Fossils likewise keep all
  item-qualified choices. The existing tracker does not model those choices
  as exclusive state. No new acquisition rows were invented for them.
