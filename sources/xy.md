# X and Y (`xy`)

## Sources

Pack `xy`, versions `x`/`y`, encounter codes `X`/`Y`. Nintendo 3DS,
Generation VI, Kalos. This is a provisional tracking pack: missing source rows
and access questions are listed under X/Y in [Open questions](#open-questions). No file-import
mapping, save-reader support claim, deployment or gameplay validation is added.

### Metadata and regional numbering

- https://bulbapedia.bulbagarden.net/wiki/Pokémon_X_and_Y
  identifies platform, generation and region. Walkthrough Part 1 identifies
  Aquacorde's choice of Chespin, Fennekin or Froakie; that gift location is the
  tracker start (not the player's house in Vaniville).
- https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_by_Central_Kalos_Pokédex_number
- https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_by_Coastal_Kalos_Pokédex_number
- https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_by_Mountain_Kalos_Pokédex_number
  The sections contain 153, 153 and 151 species respectively, including the
  three optional Central mythical species. Regional scope is therefore 457,
  National scope 721 (through Volcanion). PokeAPI dex IDs 12/13/14 supply the
  section order. The single integer `j` field uses a tracker-specific combined
  index: Central 1–153, Coastal 154–306, Mountain 307–457. These are not the
  game's three separately restarting display numbers. No section is dropped.
- https://bulbapedia.bulbagarden.net/wiki/Badge#Kalos_League
  provides all eight badge/leader pairs and Cut/Bug, Strength/Cliff,
  Surf/Rumble, Waterfall/Iceberg. Badges are required in Generation VI.
  Rock Smash is a TM and has no badge requirement here. Fly is not modeled
  as a catch-access tool. Rods, Cut, Rock Smash, Strength, Surf and Waterfall
  are the existing kit controls; acquisition remains player-reported.
- https://bulbapedia.bulbagarden.net/wiki/HM
- https://bulbapedia.bulbagarden.net/wiki/Time#Generation_VI
  sources the 3DS clock and night beginning at 21:00. The shared tracker has
  three clock periods; it does not separately display the game's evening.
- https://bulbapedia.bulbagarden.net/wiki/Pokémon_Storage_System
  gives Gen VI maximum capacity of 31 boxes × 30; boxes expand during play,
  with the final box unlocked by capturing the mascot. The tracker exposes
  maximum capacity and does not implement dynamic box unlocking.

### Progression and special rows

The full cached walkthrough was used, not mechanics inferred from another pack:
https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y

`src` fields on every chapter, event and row gate identify the relevant part.
These are cached locally as `Walkthrough:Pokémon X and Y_Part N.wiki`.

- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_1
  sources the starter gift and journey's beginning.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_2
  sources Route 2, Santalune Forest, Route 3 and the Bug Badge/Route 4 order.
  Route 22's early Santalune entrance is retained in the initial chapter.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_3
  sources southern Lumiose, Sycamore's Kanto starter choice and Route 5.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_4
  sources Route 6/Parfum Palace and the flute. Snorlax's static requires the
  recovered flute; ordinary Route 7 encounters and Connecting Cave onward
  require clearing the bridge. Connecting Cave's southern shortcut precedes
  Strength, so the combined area has no blanket Strength gate.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_5
  sources upper Route 8, Ambrette, Route 9, Glittering Cave, lower Route 8,
  Cyllage, Strength and Cliff. Each fossil gift requires choosing and restoring
  that fossil. PokeAPI places these gifts in Glittering Cave; row `show_as`
  correctly displays their restoration at Ambrette Town without inventing rows.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_6
  sources Routes 10/11, Reflection Cave, Shalour and Tower of Mastery. Lucario
  requires Rumble and the subsequent Mega Ring demonstration battle.
- https://bulbapedia.bulbagarden.net/wiki/Kalos_Route_12
  says Lapras requires Rumble and the grass/flowers are across the water.
  The Route 12 area opens from Shalour before Rumble; Lapras is gated
  individually. Walking, flower, horde and Rock Smash rows require Surf.
  Fishing retains the earliest near-Shalour shoreline access.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_7
  sources Surf across Route 12, Azure Bay, Coumarine and Plant/Route 13.
- https://bulbapedia.bulbagarden.net/wiki/Kalos_Route_14
  says entry requires Voltage and the Lysandre Café visit; both are modeled.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_8
  sources that café visit after Lumiose Gym.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_9
- https://bulbapedia.bulbagarden.net/wiki/Kalos_Route_15
  source Laverre, the factory battle and its removal of the Route 15 guards,
  Lost Hotel and Route 16. Trash-can weekday conditions are PokeAPI's own
  values, translated to the existing weekday syntax rather than guessed.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_10
  sources Frost Cavern, the upset Mamoswine blocking Route 17, freeing
  Abomasnow, Anistar and Psychic. Freeing Abomasnow is a separate event.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_11
  sources Lysandre Labs, the secret HQ and mascot capture before the final
  Lysandre battle. The mascot rows require clearing its guards in the HQ basement,
  after the Labs and the first HQ Lysandre battle. The final-battle event opens the following chapter.
- https://bulbapedia.bulbagarden.net/wiki/Kalos_Route_18
  explicitly requires defeating Lysandre for the final time to remove its
  workers. Routes 18/19, Couriway, Terminus, Snowbelle, Route 20 and Pokémon
  Village follow this event, not just Psychic as a badge proxy.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_12
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_13
- https://bulbapedia.bulbagarden.net/wiki/Kalos_Route_21
  source the southern journey and Snowbelle's west connection. Route 21 is
  modeled before Iceberg; Victory Road itself requires all eight badges.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_14
- https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Kalos)
  sources Victory Road's all-eight-badges guard. Full exploration needs HMs,
  but that does not establish the first encounter tile in each opaque PokeAPI
  area; those finer gates remain explicitly open questions.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_16
- https://bulbapedia.bulbagarden.net/wiki/Friend_Safari
  source post-League Kiloude and friend registration. Source slot conditions
  are retained on every row: slots 1/2 need a registered friend; slot 3 needs
  that friend's Hall of Fame and a simultaneous PSS session. The cache notes
  that after Nintendo Network's shutdown third-slot activation requires local
  play. This pack exposes only the cached PokeAPI Safari rows, and does not
  promise access to every Safari type/species. Conditions display as special
  availability, not ordinary unconditional encounters.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pokémon_X_and_Y/Part_17
  sources post-Champion birds, eleven sightings, Sea Spirit's Den capture,
  Surf to Mewtwo and the Terminus return. PokeAPI's starter condition is
  retained: Chespin → Articuno, Fennekin → Zapdos, Froakie → Moltres.
  Roaming Kalos static rows are deliberately excluded because the bird flees
  immediately; the catchable Den rows remain. This removes no catchable site.
- https://bulbapedia.bulbagarden.net/wiki/Terminus_Cave
  explicitly restricts Zygarde's chamber until the Hall of Fame. Ordinary
  Terminus rooms remain in the Route 18 chapter; the final chamber is postgame.
- https://bulbapedia.bulbagarden.net/wiki/Gift_Pokémon#Pokémon_X_and_Y
- https://bulbapedia.bulbagarden.net/wiki/In-game_trade#Pokémon_X_and_Y
  identified the PokeAPI omissions. The cached X/Y data has no NPC-trade or
  restored-fossil rows other than Tyrunt/Amaura, so `extra_encounters` in
  `data/xy.json` adds them (enabled with an empty `data/xy-bulbapedia.json`,
  as ORAS does). Two sources agree on every row's species, level and trainer ID.
  PKHeX at commit d8ab568695b4 lists the nine NPC trades with species,
  level and trainer ID, and the eleven fossil gifts at level 20 with Ambrette
  Town's location ID 44:
  https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen6/Encounters6XY.cs#L33-L43 (fossils) and
  https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Legality/Encounters/Data/Gen6/Encounters6XY.cs#L93-L103 (trades). Trade levels/OT IDs
  (Farfetch'd 10/00185, Steelix 20/19250, Bisharp 50/03447, Magikarp 5/44285,
  Eevee 5/29294, Shauna's starters 5/00037, Ralts 5/37110) match Bulbapedia's
  table. PKHeX gives no location for trades, so places come from Bulbapedia.
  - Santalune City Farfetch'd (Bunnelby), Cyllage City Steelix (Luvdisc) and
    Snowbelle City Bisharp (Jigglypuff):
    Walkthrough Part 2 ("offers his Farfetch'd, nicknamed Quacklin', in
    exchange for a Bunnelby"), https://bulbapedia.bulbagarden.net/wiki/Cyllage_City
    ("An Ace Trainer in the Pokémon Center will offer to trade the player a
    Steelix.") and Part 13 ("would gladly trade her Bisharp for it").
    Santalune City follows Route 3 in the first chapter; Snowbelle City joins
    the Route 18 chapter with the rest of the Snowbelle region.
  - Hotel Magikarp (for Gyarados) and Eevee (any Pokémon):
    https://bulbapedia.bulbagarden.net/wiki/Ambrette_Town ("speaking to the
    Hiker or Maid on the second floor of Hotel Ambrette for the fourth time").
    The same offers repeat in Hotel Cyllage and the Couriway hotel. The same
    page says these travelers also rotate through Camphrier Town's hotel, which
    no cached page confirms for the trade; Ambrette is used until one does.
  - Shauna's starter at Vaniville Town and Diantha's Ralts at Lumiose City,
    both after the credits: Walkthrough Part 16 ("Once the credits have ended",
    "asks to trade Pokémon with you", "offers a level 5 Ralts"). Rows need the
    Elite Four.
  - Restored fossils at Ambrette Fossil Lab:
    https://bulbapedia.bulbagarden.net/wiki/Glittering_Cave (Rock Smash table:
    Old Amber before the Hall of Fame; Skull, Armor, Cover and Plume Fossils
    in both versions, Dome and Helix in Y only, Root and Claw in X only, all
    after it) and https://bulbapedia.bulbagarden.net/wiki/Fossil ("The
    resulting Pokémon are level 20"). Serebii agrees on every gate and
    version: https://www.serebii.net/pokearth/kalos/glitteringcave.shtml
    ("Old Amber Rock Smash", "Dome Fossil Rock Smash - Postgame - Y Only",
    "Root Fossil Rock Smash - Postgame - X Only", "Skull Fossil Rock Smash -
    Postgame") and https://www.serebii.net/pokearth/kalos/ambrettetown.shtml
    (all eleven revived at level 20). Rows need Rock Smash; postgame fossils
    also need the Elite Four.

### Historical evolution, forms and artwork

- https://www.serebii.net/xy/evolution.shtml
  sources Pangoro's Dark-type party member, Inkay's upside-down console,
  Sylveon's Fairy move plus two Pokémon-Amie hearts, and Sliggoo's rain.
- https://bulbapedia.bulbagarden.net/wiki/Kalos_Route_13
  sources Magneton/Nosepass evolving in its magnetic field.
- https://bulbapedia.bulbagarden.net/wiki/Kalos_Route_20
- https://bulbapedia.bulbagarden.net/wiki/Frost_Cavern
  source Leafeon's Moss Rock and Glaceon's Ice Rock. These override modern
  PokeAPI location text and later stone methods. Raichu uses the Thunder
  Stone as in the cached evolution chain; its Alolan evolution is not used.
- https://www.serebii.net/xy/forms.shtml
  sources the five flower colours, all four Pumpkaboo/Gourgeist sizes,
  Vivillon's 18 ordinary regional patterns, and Rotom's appliance changes
  in Sycamore's lab. Form IDs/labels/art come from cached PokeAPI responses.
  Meadow is the tracker baseline; the other 17 Vivillon patterns are marked
  traded, matching the existing catalog convention rather than inferring the
  user's console region. Eternal Floette, distributed Vivillon patterns,
  Mega/battle-only forms and Furfrou trims are excluded by existing policy.
  Other older transferable form families await a separate sourced catalog
  pass; they are not silently presented as fully verified.
- https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon
  supplies the static default/shiny fallback for all 721 national species,
  matching the existing USUM static-art approach rather than claiming these
  are native animated 3DS models. All 1,442 base PNGs plus catalog form PNGs
  are downloaded and centered with `scripts/fetch_sprites.py`. Kalos badge
  artwork uses PokeAPI badge IDs 41–48, in gym order.
- Existing `public/covers/x.jpg` and `yy.jpg` are reused unchanged; their
  libretro source URLs are recorded in the box-art section above. The public
  page is `/x-y/`, and Y uses `YY` to avoid Yellow's `Y` cover code.

No Gen VI pret decompilation scripts or scanned X/Y guide were used. Cached
Bulbapedia is the access source, with the two fetched Serebii pages above for
forms and new evolutions. Independent review and browser/gameplay checks remain
separate requirements; automated generation is not proof of physical access.

Coverage accounting: the prior 358 X / 357 Y raw Pokémon endpoint counts
include Basculin blue-striped and three additional Pumpkaboo size IDs. These
collapse to their parent species under the existing species-centric model:
354 X / 353 Y species, 362 in their union. No ordinary encounter species was
removed by that normalization. Roaming-bird rows alone are intentionally
excluded as described above. Final output has 989 distinct merged rows;
941 apply to X and 940 to Y, across 78 retained encounter areas, 13 chapters
and 13 events. The shared clock's 10:00 morning cutoff remains a documented
presentation limitation; the cached rows contain no ordinary time conditions.


- **Regional numbering:** 457 includes the three optional Central mythicals.
  The UI's single regional index concatenates all three lists; it does not
  label Central/Coastal/Mountain or restart each section at 1. A future UI
  change could expose section-specific numbers; no redesign is included here.

## Open questions

- **Opaque cave areas:** map Glittering Cave IDs 303/304, Reflection Cave
  305–308, Frost Cavern 313–317 and Victory Road 322/324/326/328 to actual
  rooms/floors, then check each Victory Road room's first reachable encounter
  tile and the Frost Cavern Ice Rock room behind Surf. The main chapters are
  sourced; finer Surf/Strength/Rock Smash/Waterfall gates stay unverified.
  Checked and not enough: pk3DS
  ([`6daaca9`](https://github.com/kwsch/pk3DS/blob/6daaca934ca2284a73ab743bf89c848c57cd9de1/pk3DS.Core/Legality/Tables6.cs))
  has no X/Y zone-name table, and PKHeX's location text
  ([`d8ab568`](https://github.com/kwsch/PKHeX/blob/d8ab568695b414853c699fcadc63b7f81d0fccab/PKHeX.Core/Resources/text/locations/gen6/text_xy_00000_en.txt))
  names whole caves by met-location ID, not PokeAPI's numbered areas.
  Needs X/Y map or encounter-file data that links these numbers to rooms.

- **Hotel trades:** the Magikarp and Eevee trades are shown at Hotel Ambrette.
  The Ambrette Town page says the same travelers also rotate through Camphrier
  Town's hotel, one chapter earlier. Confirm the Hiker and Maid trade there
  before moving the rows.

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

- **Forms/evolutions:** local flower colours, Pumpkaboo/Gourgeist sizes,
  Rotom appliances and ordinary Vivillon patterns are sourced. Audit other
  transferable older form families separately; this catalog is not complete.
  New Gen VI and known location-evolution overrides are sourced, but the
  entire inherited national evolution text has not been game-tested.

### Model limits

- **Choices and online/friend state:** the shared tracker displays starter
  conditions and Safari slot requirements as special text. It does not
  enforce one Kanto starter, one fossil choice, each individual registered
  friend's Safari type, their League clear, or their PSS recognition. The
  friend-ready event is a broad player confirmation. Third-slot access now
  requires local shared play if it was not already unlocked before the
  online shutdown; verify on actual hardware. Do not promise all Safari
  species merely because the player has one friend.

- **Clock presentation:** the existing shared clock changes morning to day
  at 10:00, whereas X/Y's source says 11:00 and has a separate evening.
  Night is correctly configured at 21:00. Cached X/Y rows have no ordinary
  time-of-day encounter conditions, so this does not hide a cached daytime
  encounter, but precise clock-period UI remains unverified/out of scope.
