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
