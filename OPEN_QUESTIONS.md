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

## Black 2 / White 2 (`b2w2`)

This is a sourced first implementation awaiting independent access review,
not a claim that all earliest encounter tiles are proven. The supplied cache
is the encounter source; missing rows were not fabricated. See SOURCES.md
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
  integrated (no hand-invented rows). There are no catchable-area rows for
  Plasma Frigate, N's Castle, Black Tower or White Treehollow; their story
  and Benga reward are represented by events/Floccesy gift rows. The cache
  does not supply the complete Yancy/Curtis phone-trade sequence: do not
  claim all in-game trades are covered. Verify outbreaks, Memory Link's N
  Pokémon and other conditional gifts against the raw rows before claiming
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
