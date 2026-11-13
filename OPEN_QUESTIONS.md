# Open questions

Access questions the sources haven't settled yet. Answer one, then delete it.

## Crystal

- Ruins of Alph Outside: is the Natu and Smeargle grass only reachable through Union Cave (Surf and Strength)?
- Ice Path B2F: can you catch anything there before the B1F boulder puzzle?
- Whirl Islands: does any floor need Waterfall?
- Mt. Silver: which floors need Surf or Waterfall?

## HeartGold and SoulSilver

- Ruins of Alph Outside: same grass question as Crystal.
- Route 42: do any grass patches need Surf or Strength?
- Route 44: is all the grass reachable on foot?
- Whirl Islands B3F: does it need Waterfall?
- Tohjo Falls: is Surf enough for every part?
- Mt. Silver: how do 1F Top, 2F to 4F and Top map to the cave, and which of them need Rock Climb? (Only Mountainside and Sneasel are gated so far.)
- Fuchsia City: are the headbutt trees behind a Cut tree?
- Safari Zone Desert and Rocky Beach: they need Baoba's second challenge. Model it?
- Violet City Pokémon Center: Primo's egg codes. Model them?

## FireRed and LeafGreen

- Route 23: do the badge checkpoints block any encounters?
- S.S. Anne: what can you catch before it leaves?

## Ultra Sun and Ultra Moon

- Haina Desert weather SOS: cached PokeAPI rows omit the weather conditions for Castform and Gabite. Their corrected plain SOS rows still need a sourced weather representation.
- Lush Jungle South/West: PokeAPI duplicates Steenee, Oranguru, Passimian and Trumbeak ambush records in both subareas, while the cached USUM location table places the rustling-grass block in the south. Terrain is corrected in both existing subareas; confirm whether the West duplicates should be removed.
- Poni Breaker Coast Wailmer: the cached bubbling-spots record combines fishing and water-splash encounters (10–49, 100%). Leave its rod requirement unchanged until those encounters can be split with sourced levels and odds. Wailord, Dragalge and Clawitzer have distinct splash rows and now require Lapras.

- Brooklet Hill Main and North: are these the first lake (open before Lana's trial) or the trial pools (Waterium)? South is gated.
- Route 13: the guide has Mudsdale given at the start of Route 12, so Gallop is likely in hand. Confirm nothing on Route 13 needs more.
- Route 15 Main: the guide says more than half the route waits for a Ride Pokémon that breaks the rocks in the water. Which encounter rows are out there?
- Poni Breaker Coast: can the fishing spots and Wimpod be reached from shore?
- Mahalo Trail: Solgaleo and Lunala now open with the Dragonium (the Ultra Megalopolis chapter). In the game they come right after Ultra Necrozma, during Mina's trial.
- Totem Stickers 70: sticker 70 is on Route 15's large island. If that needs Sharpedo Jet, 70 waits for the Haina Desert chapter (as set). Confirm.

## Yellow implementation handoff

- **S.S. Anne dock timing:** its three Super Rod rows (72, 90, 120) remain
  timing-dependent. The guard refuses re-entry after the ship leaves, but the
  review did not settle whether departure can be avoided until the Super Rod
  is acquired. Do not call the encounters impossible or add an unsupported
  monotonic gate. Test obtaining the rod while preserving dock access, then
  confirm the three rows and post-departure refusal. Source:
  [Vermilion City](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/VermilionCity.asm),
  `CheckEvent EVENT_SS_ANNE_LEFT` / `.ship_departed`.

- **Safari interior paths:** the full pinned Yellow source has interior maps,
  but the independent reviews did not settle the on-foot collision path to
  Middle and Area 2 North encounter grass. Test both from the entry without
  Surf or Strength. The centre warp table links the north map, but a warp
  alone does not prove access to all encounter tiles. Source:
  [SafariZoneCenter objects](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/SafariZoneCenter.asm).
- **Articuno from the west:** retain its Strength requirement until a tester
  reaches an interaction-adjacent tile without pushing any Seafoam boulder.
  Both reviews left this unclear: static collision reachability does not
  reproduce B3F/B4F forced-surf and current scripts. Source:
  [Seafoam B4F](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/SeafoamIslandsB4F.asm).

- **Cerulean City fishing review disagreement:** first-pass access batch 2
  called the shore reachable on foot, citing the separate Bulbasaur happiness
  script. The coordinator independently decoded pinned Yellow Cerulean/Route 4
  maps, blockset, collisions and ledges and found no reachable fishing land
  without Surf; Surf reaches the cave-door shore. Fishing itself is refused
  while surfing. Resolve this discrepancy in the second review before treating
  the four species' five fishing rows as verified. The Bulbasaur gift remains
  separate. Source: [original fishing code](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/engine/items/item_effects.asm),
  `cp 2 ; Surfing?` / `jr z, .cannotFish`; map and collision files at the same
  revision. Tester check: try all outdoor water edges with a rod before Surf,
  then reach the cave-door shore with Surf and fish from land. No data change
  was applied while the two reviews disagree. A subsequent independent Codex
  reviewer confirmed the coordinator's Surf result against the original
  Yellow maps and fishing script; the initial Claude verdict still conflicts,
  so the access-audit disagreement policy keeps this on the tester checklist.

- Independent `audit-access` reviewer passes have not run in this implementation
  worktree; the coordinator owns them. In particular, independently confirm the
  Seafoam lower-floor approach from the west before accepting that ordinary
  floor encounters need Surf but not Strength (Articuno does need Strength).
  The location article's west-to-east traversal statement is marked citation
  needed, although the original scripts and accessible walkthrough explain the
  current/boulder puzzle. Sources are in the Yellow section of SOURCES.md.
- No Yellow guide PDF was supplied. Bulbapedia Yellow walkthrough parts 7 and
  11 returned HTTP 403. No access-control bypass was attempted; accessible
  walkthroughs and original pret/pokeyellow scripts were used instead.
- The shared tracker can mark shininess/gender even for Generation I. This
  implementation does not redesign those controls. Yellow supplies identical
  original sprites at regular/shiny paths because the game has no shiny
  palette; it supplies no alternate forms. Coordinator should independently
  verify the desired Gen 1 control behaviour across Red/Blue and Yellow.
- Manual picker, guest persistence, chapter/HM/story progression, gifts/statics,
  sprites and generated-page browser QA remain unperformed. No cartridge or
  emulator gameplay, account sync or save-file import verification was run.
  Yellow tracking does not enable file import.

## Red and Blue

- Independent access audit remains for the coordinator, particularly the
  first reachable parts of Seafoam's basement floors, Route 12's southern
  grass, and the Route 2 trade-house approach. The implementation cites
  original pret scripts/maps and accessible walkthroughs, but no local
  Red/Blue scanned guide or emulator confirmation was available.
- PokeAPI's NPC-trade levels are fixed example levels; original NPC trades
  retain the offered Pokémon's level (`engine/events/in_game_trades.asm`).
  The shared encounter row schema only supports numeric ranges, so these
  source levels are retained, not claimed as mandatory in-game levels.
  Coordinator should decide a shared variable-level presentation rather
  than introducing Red/Blue-only UI changes in this pack task.
- The S.S. Anne dock is a temporary location after the ship departs. The
  tracker models access via Bill's ticket but does not model losing access
  after departure. Its source-backed PokeAPI fishing rows are retained;
  verify an appropriate shared temporary-area presentation before claiming
  all currently available encounters are exact.
- The shared box editor still offers later-generation metadata (gender,
  shiny and held-item fields). Red/Blue has no visible shiny art or held
  items; regular sprites intentionally fill shiny paths. Do not interpret
  these fields as original-game mechanics or save-file support. No box UI
  or save-import UI was changed in this task.

## Gold and Silver (`gs`)

- **Route 44 alternative approach:** with four badges, Surf and Rock Smash
  but no Glacier badge, test Dark Cave -> Route 45 -> Blackthorn -> Ice Path
  -> Route 44, respecting one-way ledges and forced cave warps. Record the
  first blocker and whether Strength is needed in the reverse Ice Path path.
  Normal Mahogany access supports the current chapter; neither review proved
  this alternate route. Source:
  [Dark Cave warps](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/DarkCaveBlackthornEntrance.asm).

- **Route 8 Cut gate:** first pass proposed Cut for the grass, while the
  second pass could not settle a southern approach across directional-wall
  tiles. Test from both Lavender and Saffron without Cut, including the south
  grass edge. If blocked, gate walking rows only. No data change was applied.
  Sources: [Route 8 map](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route8.blk)
  and [movement permissions](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/engine/overworld/player_movement.asm).
- **Pewter / Route 3 Cut gate:** Diglett's Cave's tree passage is insufficient
  proof of a whole-area gate. After Snorlax, the east Victory Road Gate guard
  disappears, opening a Route 22 approach to Viridian. Test every legitimate
  northbound Route 2 route without Cut, respecting one-way ledges, before
  adding requirements to the Pewter trade or Route 3 encounters. Source:
  [VictoryRoadGate](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/VictoryRoadGate.asm).
- **Blackthorn / Route 45 alternative approach:** their lack of local
  boulders does not disprove the preceding Ice Path Strength requirement.
  Separately test whether Dark Cave and northbound Route 45 ledges permit
  arrival without Strength before seven badges. Neither review established
  that alternative; retain current gates.
- **Mt. Mortar upper-floor landing:** with Surf but no Waterfall, trace each
  legitimate Route 42 entrance to the 1F Inside stairs (9,9), then test upper
  floor encounters. The raw upper map differs from the B1F pocket and Tyrogue
  platform; partial or decorative exterior paths do not settle its gate.

- **Route 1 grass access:** batch 4 suggested a Cut requirement, but its
  approach was not independently established. After normal western-Kanto
  access, test both Viridian and Pallet approaches without Cut. Keep current
  data until the grass requirement is resolved. The suggested early Kanto
  shortcut is blocked by the east-door Black Belt in
  [VictoryRoadGate.asm](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/VictoryRoadGate.asm),
  whose object remains until `EVENT_FOUGHT_SNORLAX`.
- **Audit terrain-model limitations:** a second review rejected proposed
  earlier access to Ice Path B3F (fallen B2F boulders initially hidden),
  Route 27 grass (mandatory Tohjo Falls cave warps), and western Kanto via
  Victory Road Gate or Route 19 (Black Belt and construction rocks).
  Existing gates remain. Mt. Mortar's Tyrogue platform still needs complete
  independent proof: the no-Surf path in batch 4 walked behind an exterior
  cave warp, which is not a valid path. These source/model checks were not
  emulator or gameplay verification.

- **Dark Cave Blackthorn-room earliest entrance:** the original scripts link
  Violet-room warp (17,1) to the Blackthorn room, and the Psypoke maps show
  an earlier approach. The current provisional gate is Surf + Rock Smash
  in the initial chapter. Independently trace the Violet room's shoreline,
  smashable rock and ledges to establish whether both moves are necessary.
  Do not confuse entry into this room with reaching Route 45/Blackthorn
  City past the one-way ledge. Sources: SOURCES.md, Gold/Silver access list.
- **Mt. Mortar basement and Ice Path floors:** independently map PokeAPI's
  basement to the lower Surf entrance versus the raised Tyrogue platform;
  the basement currently needs Surf, Tyrogue also needs Waterfall. Confirm
  whether Ice Path B2F encounters are accessible before solving the boulder
  puzzle (only B3F/Blackthorn are currently Strength-gated).
- **Mt. Silver:** map PokeAPI's 1F/2F/Top rooms to original GS collision maps.
  The main cave is open after Oak, but confirm whether any complete encounter
  area waits for Surf/Waterfall. Do not use HGSS's Rock Climb layout.
- **Route 42 grass:** the Mt. Mortar walking bypass reaches Mahogany without
  Surf; independently verify the encounter grass's earliest path rather
  than extending the route's lack of a blanket gate to every patch.
- Unown A–Z lists eventual local forms. The app does not track the four
  puzzles' individual letter groups; one `alph-puzzle` event opens the
  species encounter, not all letter groups in the actual game. The original
  puzzle scripts are linked in SOURCES.md if finer tracking is later wanted.

## Emerald

- Victory Road B2F: does the first reachable encounter tile require Rock
  Smash as well as Strength? Trace the map or check in-game; the walkthrough
  establishes Rock Smash for full traversal, not the earliest encounter.

## Ruby and Sapphire (`rs`)

- **Save imports:** reader 0.1.3 verifies synthetic 128 KiB RS files through
  native Core, raw National Dex flags and the published WASM worker. It cannot
  distinguish Ruby from Sapphire; players choose the title. Obtain permitted
  real cartridge/emulator exports and a legitimate in-game zero-caught save
  for comparison. Real 64 KiB RS exports remain unverified and unsupported;
  the Emerald-only recovery path must not be applied to them.

- **Independent access audit:** coordinator's Opus review remains. The local
  103-area work list is `.cache/areas-rs.json` (regenerate with
  `python3 scripts/access_audit.py areas rs`). All areas have cached source
  pages; Weather Institute uses walkthrough Part 11. No second guide/source
  confirms every access path. No gate was entered without a source, but the
  following earliest-tile questions need independent map/gameplay proof.
- **Victory Road B2F:** the forward route in R/S walkthrough Part 21 uses
  both Strength and Rock Smash; the pack conservatively requires both.
  Check whether either legitimate approach reaches any B2F encounter tile
  with Strength alone. B1F is open before its initial boulders. Do not infer
  this from Emerald's traversal or layout.
- **Route 123 western approach:** the location article describes westward
  ledges and the separate Berry Master terminus; the pack keeps encounter
  grass behind the Route 122 approach (Surf + Devon Scope). Independently
  trace the original R/S western entrance to confirm no early grass/water
  encounter tile can be reached. Route 118 walking rows separately need
  Surf; fishing stays open from the western beach.
- **Shoal Cave clock:** cached PokeAPI has no time conditions for its named
  High Tide / Low Tide or basement areas. The clock changes at 03:00, 09:00,
  15:00, 21:00; low tide is 03:00–09:00 and 15:00–21:00 (Time page).
  The pack preserves both sets and gates B3F (ice room) with Strength, but
  cannot automatically hide low-tide rooms or high-tide fishing. A shared
  tide model, plus original floor-name mapping verification, remains.
- **Temporary hideout:** Ruby/Sapphire's Lilycove hideout eventually closes
  after defeating Tate and Liza (Mind Badge; location articles); the tracker
  models its opening after submarine theft, not loss of access. Verify a shared temporary-area
  model before claiming all currently available Electrode rows are exact.
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
- **Choice/state limits:** one desert fossil can be selected; its counterpart
  sinks. The tracker offers independent possession events for imported or
  traded fossils and does not enforce mutual exclusion. Mirage Island's
  event must be kept in sync with today's game. Regi events represent full
  puzzle completion, including Sealed Chamber, Dig, Relicanth/Wailord and
  the individual puzzle; they do not automatically prove party composition.
  Eon Ticket voyages require historical distribution access. These are
  existing tracker-model limits, not invented encounter rows.
- **Unverified:** no browser picker/guest persistence/account sync, cartridge
  or emulator gameplay, clock manipulation, historical ticket distribution,
  save-file import, or independent form-catalog expansion was tested.
  No R/S file-import mapping or Works-with claim was enabled.
## Black and White (`bw`)

- **Save imports:** synthetic 512 KiB B/W and B2/W2 fixtures verify distinct
  identities and complete National Dex caught flags through native Core, raw
  bits and published reader 0.1.3 WASM. Obtain permitted real cartridge/emulator
  exports and a legitimate in-game zero-caught save for comparison. Live account
  imports and mobile Safari remain unverified. PKHeX exposes Gen V adventure
  start seconds, but its epoch/bounds, invalid values, leap days and exported
  date behavior are not verified for reader date import; use import day.

This pack is integrated with provisional access details; it is not a certified
complete representation of all original BW acquisition methods.

- **PokeAPI gaps:** no White Forest area/encounters in White, no NPC-trade
  rows in either version, no swarm conditions, and no Desert Resort Zen Mode
  Darmanitan statue encounter. Do not invent these rows. No wild encounters
  should be added to Black City to compensate for White Forest's absence.
- **Roamers:** the cache places Tornadus (Black) and Thundurus (White) at
  `team-flare-secret-hq-area`, method `static`. That location is excluded.
  Actual roaming routes, rates and levels need corrected PokeAPI data.
  Walkthrough part 11 sources their Route 7 release after Legend. Landorus
  remains represented with the both-roamers/own-Trainer-ID party gate, but
  this pack cannot guide catching the roamers themselves.
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
- **Dreamyard duplicates:** PokeAPI supplies Friday Musharna twice (area and
  B1F), with Friday/Ghetsis omitted from B1F. Both are now Friday/postgame
  gated and displayed as Dreamyard, but are retained as distinct source rows.
  Confirm whether both entries should collapse upstream; dark grass and
  ordinary ruins grass have separate needs: dark grass and the basement
  require the postgame, while grass behind the tree keeps Cut.
- **National visibility:** the shared UI exposes national species with the
  Elite Four switch, slightly before Cedric's post-credits upgrade. Areas
  after Team Plasma additionally require `ghetsis`; consider a future
  pack-specific national-unlock model if this distinction matters.
- **Choice tracking:** starter conditions label the appropriate Dreamyard
  monkey gift, but do not consume a gift choice. Fossils likewise keep all
  item-qualified choices. The existing tracker does not model those choices
  as exclusive state. No new acquisition rows were invented for them.
- **Forms:** local Basculin stripes, seasonal Deerling/Sawsbuck and Rotom
  appliances are sourced. Older transfer-only form families (Unown, Burmy,
  Shellos, Giratina and others) are not exhaustively catalogued for BW.
  Do not add B2W2-only Therian formes or fused Kyurem. Deferred additional
  catalogs need game-specific sources and regular/shiny sprite verification.
- **Review coverage:** all 87 retained encounter areas map to cached source
  pages; walkthrough and important exceptions were inspected once. No
  exhaustive independent access audit, scanned-guide cross-check, BW script
  verification, browser/guest/account-sync QA, save-file import, emulator
  or cartridge playthrough was performed. Missing second sources did not
  block integration. Three independent-review findings were checked against
  cached sources and corrected: the Route 9 stone gate, Black Landorus's
  deferred-catch condition, and Cut on Dreamyard dark grass/B1F.
  See `docs/bw-access-audit.md` for the reviewer work list.
## X and Y (`xy`) implementation handoff

- **Save imports:** synthetic X/Y caught/empty files verify individual titles and
  complete National Dex flags through native Core, independent raw bits and
  published reader 0.1.3 WASM. Obtain permitted real cartridge/emulator exports
  and a legitimate in-game zero-caught save. Live account imports, encrypted
  backup extraction, mobile Safari and physical mobile performance remain
  unverified. Gen VI adventure-start date import needs separate epoch/bounds,
  invalid-value, leap-day and exported-date checks; use import day for now.

This is a partial, integrated pack pending independent review. Do not interpret
its successful generation/check/build as verified game access.

- **Opaque cave areas:** map Glittering Cave IDs 303/304, Reflection Cave
  305–308, Frost Cavern 313–317 and Victory Road 322/324/326/328 to actual
  rooms/floors. Distinct source areas are retained. In particular, identify
  the Frost Cavern Ice Rock room behind Surf; check each Victory Road room's
  first reachable encounter tile, rather than applying all full-traversal HMs
  everywhere. The main chapters are sourced; finer Surf/Strength/Rock Smash/
  Waterfall gates are deliberately unverified, not invented.
- **Terminus side chambers:** map PokeAPI B1F Left/Right to the small exterior
  entrances versus the main dungeon. The location page says small chamber
  one needs Rock Smash, but does not map its label to these API areas.
  Check the earliest path to B2F and Zygarde as well. Only the sourced
  Hall-of-Fame restriction is applied to Zygarde's chamber.
- **Route 21:** confirm access to each purple-flower patch before Iceberg,
  and which walking/flower rows require Strength. Snowbelle's west connection
  is sourced, but no whole-route Strength gate is inferred from item puzzles.
- **Route 12 shoreline:** verify the near-Shalour shore supports each rod's
  listed species before Surf. Walking/flower/horde/Rock Smash rows wait for
  Surf, while the Rumble-gated Lapras gift does not need Surf itself.
- **PokeAPI gaps, not fabricated rows:** the cached X/Y data has no NPC-trade
  rows. Missing acquisitions are Santalune Farfetch'd (Bunnelby), Cyllage
  Steelix (Luvdisc), Snowbelle Bisharp (Jigglypuff), Shauna's postgame starter
  (Chespin after Fennekin, Fennekin after Froakie, Froakie after Chespin),
  Diantha's postgame Ralts, and the hotel Magikarp/Eevee trades. No encounter
  rows for those trades were added by hand. Sources: In-game trade X/Y
  section and walkthrough Parts 2, 5, 13 and 16 in SOURCES.md.
- **Missing restored-fossil gifts:** PokeAPI supplies Tyrunt/Amaura but not
  restored Aerodactyl, Omanyte, Kabuto, Lileep, Anorith, Cranidos, Shieldon,
  Tirtouga or Archen gifts. Older fossils except Old Amber are post-League;
  Root/Claw are X-only and Helix/Dome Y-only. These missing gift rows were
  not invented, even when a species may have another acquisition. Tyrunt/
  Amaura are displayed at Ambrette instead of PokeAPI's Glittering Cave.
- **Choices and online/friend state:** the shared tracker displays starter
  conditions and Safari slot requirements as special text. It does not
  enforce one Kanto starter, one fossil choice, each individual registered
  friend's Safari type, their League clear, or their PSS recognition. The
  friend-ready event is a broad player confirmation. Third-slot access now
  requires local shared play if it was not already unlocked before the
  online shutdown; verify on actual hardware. Do not promise all Safari
  species merely because the player has one friend.
- **Regional numbering:** 457 includes the three optional Central mythicals.
  The UI's single regional index concatenates all three lists; it does not
  label Central/Coastal/Mountain or restart each section at 1. A future UI
  change could expose section-specific numbers; no redesign is included here.
- **Forms/evolutions:** local flower colours, Pumpkaboo/Gourgeist sizes,
  Rotom appliances and ordinary Vivillon patterns are sourced. Audit other
  transferable older form families separately; this catalog is not complete.
  New Gen VI and known location-evolution overrides are sourced, but the
  entire inherited national evolution text has not been game-tested.
- No second independent access review, scanned guide, Gen VI game scripts,
  browser/picker/guest persistence/account-sync checks, cartridge/emulator
  gameplay, or save-file import checks were performed. Save-file support is
  intentionally not enabled. Coordinator owns the independent review/rollup.
- **Clock presentation:** the existing shared clock changes morning to day
  at 10:00, whereas X/Y's source says 11:00 and has a separate evening.
  Night is correctly configured at 21:00. Cached X/Y rows have no ordinary
  time-of-day encounter conditions, so this does not hide a cached daytime
  encounter, but precise clock-period UI remains unverified/out of scope.
## Diamond and Pearl (`dp`)

- **Save imports:** synthetic DP caught/empty fixtures agree through native
  Core, independent raw bits and published reader 0.1.3 WASM. The title remains
  a required Diamond/Pearl choice; tested Platinum and HGSS layouts stay
  separate. Obtain permitted real cartridge/emulator exports and a legitimate
  in-game zero-caught save. Live account imports, mobile Safari and physical
  mobile performance remain unverified. DP adventure-start date import needs
  separate epoch/bounds, invalid-value, leap-day and exported-date checks;
  imports use import day until those checks are complete.

- **Route 205 South:** the cached Route 205 description places the first
  grass and Honey Tree across the bridge blocked until Valley Windworks is
  freed. Keep the walking/tree rows gated; a blanket move to chapter 1 would
  open them too early. Independently trace the southern bank's fishing/Surf
  access before splitting those methods into an earlier chapter. Sources:
  `Sinnoh_Route_205` (Before the Eterna Forest) and walkthrough Part 5
  (Route 205 Southwest). The walkthrough lists grass and fishing together
  but does not establish grass access before the bridge opens.
- **PokeAPI gap:** species 487 (Giratina), including its alternate variety,
  has no Diamond/Pearl encounter detail, despite the sourced Turnback Cave
  static. The catalog includes Giratina with zero encounter rows; no static
  was invented. PokeAPI also supplies no Pal Park transfer encounters; those
  are not ordinary local catches. The 161 raw areas become 158 after the
  three never-released native event areas are excluded (Newmoon Island,
  Flower Paradise and Hall of Origin).
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
- **Ruin Maniac:** reconcile source wording about seeing versus catching all
  26 letter Unown. The explicit event asks whether the player collected them;
  independently confirm the exact original D/P flag and whether the 10–25
  intermediate cave's whole encounter table should wait for that threshold.
  It currently shares the early cave chapter; only completed Maniac Tunnel
  and the !/? upper room need the 26-form event.
- **Conditional encounters:** the app labels GBA dual-slot cartridge, Radar,
  swarm, Honey Tree group, Great Marsh selection, Backlot guest, held fossil,
  NPC trade request and Regigigas party conditions. It does not configure a
  cartridge, daily roll, Honey Tree timer/group or trade-party inventory.
  Honey Tree rates describe the PokeAPI group table, not overall Munchlax
  probability. Great Marsh slot numbers remain in the generated data, while
  the UI labels them as daily Pokémon; their independent selection odds
  have not been verified.
- **Source coverage:** no official guide PDF or emulator/gameplay validation
  was available. The cached walkthrough/location pages supply chapter/gate
  evidence; a second independent source for every gate remains pending.
  `pret/pokediamond` fossil revival code was checked, but its binary map
  scripts were not decoded for an independent access audit. Imported form
  catalogs (for example Deoxys) are not claimed complete by this local-form
  implementation. No browser, DS hardware, clock transition or Ranger/GBA
  transfer interaction was exercised.
## Black 2 / White 2 (`b2w2`)

- **Save imports:** synthetic caught/empty BW and B2W2 saves agree through
  native Core, raw flags and reader 0.1.3 WASM. Obtain permitted real exports
  and legitimate in-game zero-caught saves. Gen V recorded-date epoch/bounds,
  invalid values, leap days and exported dates remain unverified; use import
  day. Regional/corrupt/modified variants, live account imports, mobile Safari
  and physical mobile performance remain separate checks.


This is a sourced first implementation awaiting independent access review,
not a claim that all earliest encounter tiles are proven. PokeAPI is the main encounter source; cached location tables now fill the
missing outbreak rows with per-row provenance. See SOURCES.md
and the 137-area work list in `docs/b2w2-access.md`.

- **Numbered room mappings:** PokeAPI's Reversal Mountain Unknown Areas
  48–60, Victory Road 2 Unknown Areas 71–80 / Victory Road 7F, and Castelia
  Sewers Unknown Area 38 lack an established room-to-map correspondence.
  They retain their labels and parent journey gates. Independently map
  each room before assigning additional floor-specific Surf/Strength,
  seasonal water-level or version-layout restrictions. Relic Castle A/C/D
  likewise need a precise mapping; C/D currently follow the sourced
  Strength approach through Relic Passage, A the desert approach.
- **Earliest tiles:** confirm whether Route 4's first encounter patch is
  reachable before Colress clears the Crustle (currently the whole route
  follows that milestone), whether Route 6/Chargestone first tiles precede
  the Driftveil Frigate sequence (Route 6 currently follows Driftveil,
  Chargestone follows the Frigate), and whether the PWT entrance to Relic
  Passage can be used before Clay (currently after Quake). Guidance Chamber
  has the walkthrough's Surf/Strength route; prove alternative approaches
  before weakening it. These gates need map/script or in-game evidence,
  not Black/White assumptions.
- **Seaside Cave and Giant Chasm:** distinguish any encounter tiles reachable
  before the Rocky blockage from the rest of Seaside Cave; currently both
  floors require clearing Opelucid Plasma and Surf. Giant Chasm outside /
  first approach follows Opelucid; forest/cave/grotto sections follow the
  seaside Frigate. Check those boundaries against maps. Route 23/Victory
  Road currently follow Ghetsis without a blanket extra HM requirement;
  floor-specific encounter tiles still need tracing.
- **Azelf:** the walkthrough places it on the western Route 23 platform
  near the Strength puzzle, but does not alone prove Cut/Strength are
  unavoidable to that tile. Only the established lake-guardian event,
  League, Surf and Waterfall are applied. Trace the platform approach.
- **Key System:** `iron-room` has no standalone cached Bulbapedia page.
  Underground Ruins supports the keys, chambers and giants, but exact
  PokeAPI Rocky Mountain Room / Iron Room / Glacier Room wild-table mapping
  still needs independent proof. Both keys can be shared between versions;
  activation is manual. No Challenger's Cave encounter area exists in these
  cached B2W2 rows; do not borrow its Black/White tables or gates. Its B2W2
  absence/inaccessibility and any proposed Lostlorn key rule need the game's
  own evidence before adding anything.
- **Weekdays and respawns:** raw PokeAPI static rows do not encode all
  weekday rules. The cached Route 4 page describes Monday Braviary (White 2)
  and Thursday Mandibuzz (Black 2); Undella Bay describes Monday Jellicent
  (Black 2), Thursday Jellicent (White 2). These rows currently have their
  chapter/method gates but no weekday filter. Legendary retry conditions
  remain descriptive raw conditions rather than a model of each retry flag.
- **Seasons:** seasonal raw encounter conditions are preserved and named,
  but are not filtered by the computer's calendar. Castelia Sewers water
  level and winter-only physical paths need separate room evidence. The
  cached `Season` page concerns anime seasons; the actual game-mechanic
  target is not cached. `Time` and the B2W2 article establish monthly seasons
  and no time-of-day encounter changes. A second source for each seasonal
  access exception is still missing.
- **PokeAPI coverage:** all 137 supplied areas and their B2/W2 rows are
  integrated, plus 23 sourced outbreak species (19 rows per version). There are no catchable-area rows for
  Plasma Frigate, N's Castle, Black Tower or White Treehollow; their story
  and Benga reward are represented by events/Floccesy gift rows. The cache
  does not supply the complete Yancy/Curtis phone-trade sequence: do not
  claim all in-game trades are covered. All requested outbreak species were confirmed in cached B2/W2 Swarm
  tables; none were left out. Daily location selection is not predicted.
  Verify Memory Link's N Pokémon and other conditional gifts before claiming
  completeness. Ordinary gifts/fossils retain raw item conditions and their
  chapter gates, not a full inventory/phone/day-counter simulation.
- **Location labeling:** PokeAPI calls the Nacrene gift gate West Gate,
  whereas the walkthrough describes the Happiny Egg at the east gate.
  Preserve the raw area label pending a species-specific display mapping;
  do not move Uxie's separate western encounter with it.
- **Forms and evolution:** no complete seasonal Deerling/Sawsbuck, Basculin
  color, gender, Therian, Kyurem-fusion or other alternate-form collection
  catalog is included. Default species art/types are used. External Dream
  Radar/transfer/event distributions are not invented as local encounters.
  PokeAPI's Milotic evolution text prefers beauty and omits its alternative
  Prism Scale trade; historical alternatives need a sourced override.
  Audit all remaining evolution text independently before claiming full
  historical evolution coverage.
- **Verification limits:** no original-game script/decompilation review,
  ROM, emulator, browser/device interaction, account sync or save import was
  tested. No second independent source was available. The independent
  review should examine every area and gift/static/trade, not treat a
  cached article match, generator check or build as gameplay proof.

  The missing phone trades are specifically all 12 rewards for each contact:
  Yancy: Meowth, Wobbuffet, Ralts, Shieldon, Rhyhorn, West Sea Shellos,
  Mawile, Spiritomb, Snorlax, Teddiursa, Spinda and Togepi;
  Curtis: Mankey, Wobbuffet, Ralts, Cranidos, Rhyhorn, East Sea Shellos,
  Sableye, Spiritomb, Snorlax, Phanpy, Spinda and Togepi.
  Source: https://bulbapedia.bulbagarden.net/wiki/In-game_trade#Yancy/Curtis
  The only generated trade rewards are Alakazam/Ambipom (Accumula),
  Tangrowth (Humilau), Rotom (Route 15), Gigalith (Route 7), Cottonee
  (White 2, Route 4) and Petilil (Black 2, Route 4). The phone trades have
  no raw encounter rows in either version; this is a confirmed omission,
  not a proposed gate for invented rows.

- **Kyurem trigger conflict:** retain `catch-n-dragon` and PokeAPI’s
  `other-captured-reshiram-or-zekrom` condition until gameplay/scripts settle
  whether catching is required or battling/encountering is enough.
  https://bulbapedia.bulbagarden.net/wiki/Giant_Chasm
  (cached line 531) says “after encountering” Zekrom/Reshiram at
  Dragonspiral Tower. Walkthrough Part 19 (line 1120) says “After the battle”
  N directs the player to Giant Chasm, while line 105 describes catching.
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_2_and_White_2/Part_19
  PokeAPI’s capture condition is stricter than the location article’s text;
  no gate was weakened on this conflicting evidence.
- **Cobalion / Cut gameplay check:** keep the existing Cobalion gate.
  https://bulbapedia.bulbagarden.net/wiki/Unova_Route_13
  (cached line 30) places Cobalion “above the cuttable trees” but also
  describes an eastern path without cuttable trees.
  https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_Black_2_and_White_2/Part_12
  (line 105) says to approach the cuttable trees and find Cobalion in the
  clearing beyond. Trace the exact encounter tile in-game before adding Cut.
- **Resolved review corrections:** Dreamyard B1F uses the fence gap without
  Cut; Latias/Latios still require Cut (Dreamyard Geography; Part 20’s chase).
  The access inventory now matches all area/chapter requirements in the data.
  Gigalith stays on Route 7: Part 10’s “Trade with a Hiker” is under Route 7,
  not Mistralton City (headings at cached lines 50 and 241; trade at 142–143).
