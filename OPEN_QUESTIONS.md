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

## Platinum (`pt`)

- **Save imports:** synthetic Pt/DP/HGSS caught/empty fixtures agree through
  native Core, raw flags and reader 0.1.2 WASM. Obtain permitted real exports
  and legitimate in-game zero-caught saves. Pt recorded-date epoch/bounds,
  invalid values, leap days and exported dates need separate verification;
  imports use import day. Regional/corrupt/modified variants, live account
  imports, mobile Safari and physical mobile performance remain unverified.

- Route 205 South fishing before clearing the Windworks needs a gameplay
  check: obtain the Old Rod at the Route 218 gate, then try fishing from the
  south bank before crossing the blocked bridge. The cached Sinnoh Route
  205 page says the grunts block only north of the stream; walkthrough Part
  2 confirms the early Old Rod, and Part 3 reaches the bridge before Mars.
  None explicitly confirms a usable fishing tile on the south bank. Rod
  rows remain in chapter 2 with the grass and Honey tree pending that check.
- Turnback Cave's unused fourth wild table (After Pillar 3, levels 45–48)
  is excluded; its level-47 Giratina static is retained. The cached Turnback
  Cave page explicitly says the fourth table is never used in regular play.
  The separate pillar-room tables still need a room/script cross-check:
  PokeAPI's Pillar 1 exactly duplicates Before Pillar 1; Pillar 2 exactly
  duplicates Between Pillars 2 And 3; Pillar 3 has similar species/rates to
  that latter table but differs in several levels. The page does not settle
  whether those pillar-room encounters are used, so all three are retained.

- Independent terrain/access review remains outstanding. The cached
  walkthrough and location pages source the gates, but no emulator or
  collision-map traversal was performed. Specifically review Mt. Coronet's
  2F-to-3F story passage (2F is available with Surf/Rock Climb; 3F and higher
  conservatively retain the Galactic HQ rescue), Victory Road's individual
  floor paths, and alternative eastern Battle Zone approaches to Route 227
  and Stark Mountain. Route 228 grass is not blanket-gated on Bicycle or
  Rock Smash: its northern/southern entrances need a terrain cross-check.
- Drifloon is Friday plus Mars cleared, but cannot appear on the same day
  Mars is defeated. The tracker stores an event checkbox, not its completion
  date, so cannot enforce that exception. Source: Valley Windworks and
  Platinum walkthrough Part 4 in SOURCES.md.
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
  cross-checks are pinned in SOURCES.md. A second independent source for
  every area remains outstanding. No official Platinum guide was consulted.
- No browser/mobile visual QA, emulator playthrough, live account/guest
  interaction, save-file import or deployment was performed. Save import
  remains disabled for Platinum. Independent Opus review belongs to the
  coordinator.
