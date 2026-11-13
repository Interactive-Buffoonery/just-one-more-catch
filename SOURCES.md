# Sources

Where the hand-written game data comes from, best first. Encounter data comes
from PokeAPI and needs no source.

1. **Bulbapedia**: walkthrough appendix, location, item and Badge pages.
   It blocks scripted fetches; read it through `scripts/access_audit.py`
   (see the `audit-access` skill).
2. **StrategyWiki**: a second walkthrough, good for breaking ties. It also
   blocks scripted fetches, so open it in a browser.
3. **Official strategy guides**: scanned PDFs in Sarah's iCloud
   `game-guides/` folder. Read them with the `read-guide` skill.
4. **Serebii**: last tiebreaker.
5. **pret decompilations**: the games' own map scripts and event data, best
   for what triggers a gift, trade or static encounter (flags and script
   order). They don't show HM gates, which live in the map tiles. Clone them
   and read with grep; never build them.
   - https://github.com/pret/pokecrystal
   - https://github.com/pret/pokefirered
   - https://github.com/pret/pokeheartgold
   - https://github.com/pret (Red/Blue, Yellow, Gold/Silver, Ruby/Sapphire,
     Emerald, Diamond/Pearl, Platinum and more)
6. **PokeDaisy** (https://github.com/lidor30/pokedaisy): an emulator
   companion with tables generated from those decompilations (area items,
   gifts and trades) for Gen 1 to 5 and many ROM hacks, under
   `app/src/main/kotlin/com/pokedaisy/app/companion/data/`. Its hand-written
   guide pages are AI-assisted and unverified, so use it to find the
   decompilation script, not as the citation.

## Crystal

- https://bulbapedia.bulbagarden.net/wiki/Appendix:Crystal_walkthrough
- https://strategywiki.org/wiki/Pok%C3%A9mon_Crystal
- Nintendo Power Pokemon Crystal guide (2001): `(Nintendo Power 2001) - Pokemon Crystal_text.pdf`

## HeartGold and SoulSilver

- https://bulbapedia.bulbagarden.net/wiki/Appendix:HeartGold_and_SoulSilver_walkthrough
- https://strategywiki.org/wiki/Pok%C3%A9mon_HeartGold_and_SoulSilver
- Prima HeartGold and SoulSilver Johto guide (2010): `(Prima 2010) - Pokemon HeartGold & SoulSilver - Johto.pdf`
- Prima HeartGold and SoulSilver Kanto guide: `Pokemon HeartGold & SoulSilver Kanto Prima Official Guide_text.pdf`

## FireRed and LeafGreen

- https://serebii.net/fireredleafgreen/nintendoswitch.shtml — Switch release; Aurora and Mystic Tickets after the Hall of Fame, opening Birth Island and Navel Rock from Vermilion.
- https://www.nintendolife.com/news/2026/02/psa-pokemon-firered-and-leafgreen-switch-version-gives-you-the-mystic-ticket-and-aurora-ticket — confirms automatic tickets and Deoxys, Lugia and Ho-Oh.

- https://bulbapedia.bulbagarden.net/wiki/Appendix:FireRed_and_LeafGreen_walkthrough
- https://strategywiki.org/wiki/Pok%C3%A9mon_FireRed_and_LeafGreen
- No guide PDF yet.

## Ultra Sun and Ultra Moon

- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ultra_Sun_and_Ultra_Moon
- https://bulbapedia.bulbagarden.net/wiki/Alola (Alolan forms)
- https://strategywiki.org/wiki/Pok%C3%A9mon_Ultra_Sun_and_Ultra_Moon
- The Official Alola Region Strategy Guide (2017): `Pokèmon Ultra Sun & Pokèmon Ultra Moon The Official Alola Region Strategy Guide fix.pdf`

### USUM ambush terrain and Machamp review

The USUM sections of the location pages linked in `data/usum.json`'s
`area_methods` identify rustling grass/trees/bushes, dirt/sand clouds,
flying shadows, Dividing Peak Tunnel shadows and water splashes. These
place/species overrides correct PokeAPI's shared bubbling-spots bucket;
fishing methods retain their rod requirement. See `docs/usum-access-audit.md`
for the complete row inventory and cache limitations.

- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ultra_Sun_and_Ultra_Moon/Part_21
  sails to Poni after clearing Aether Paradise.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ultra_Sun_and_Ultra_Moon/Part_22
  registers Machamp Shove at Ancient Poni Path. Machamp areas therefore also
  require the existing Aether event, including the earlier Lush Jungle cave.

## Obtainable form catalog

`obtainable_forms` in each pack is an allowlist of PokeAPI pokemon-form
names, in default-first order. The existing `forms` list still selects the
species' default types and artwork. Form lists do not add encounters or gates.

- PokeAPI `pokemon-species`, `pokemon`, and `pokemon-form` responses supply
  identifiers, labels, and sprites: https://pokeapi.co/api/v2/pokemon-form/
- Unown: https://bulbapedia.bulbagarden.net/wiki/Unown_(Pok%C3%A9mon)
  Crystal has A–Z; FRLG and HGSS also have exclamation and question marks.
- HGSS normal Gen IV forms (including ordinary trades from DPPt):
  https://www.serebii.net/games/forms.shtml and
  https://www.serebii.net/heartgoldsoulsilver/forms.shtml
  Burmy/Wormadam cloaks, Shellos/Gastrodon seas, Rotom appliances.
  Event-dependent Deoxys, Shaymin, Arceus and Origin Giratina are excluded.
- USUM forms and form-changing items:
  https://www.serebii.net/ultrasunultramoon/forms.shtml and
  https://www.serebii.net/games/forms.shtml
  Rotom, Giratina, Forces of Nature, Kyurem, Zygarde (10%/50%), Oricorio,
  Silvally, Minior cores, and Necrozma's two persistent fusions.
  Ability-only Zygarde variants are one visible form each.
- Regional forms: https://www.serebii.net/pokemon/regionalforms.shtml
  Alolan forms are the defaults in USUM. Kantonian Raichu,
  Exeggutor and Marowak are also obtainable by evolving in Ultra Space:
  https://www.serebii.net/ultrasunultramoon/evolution.shtml
- USUM Shellos/Gastrodon: West Sea via the Seafolk Village trade (and
  evolution), East Sea via wild Gastrodon (and breeding):
  https://www.serebii.net/ultrasunultramoon/ingametrade.shtml
- USUM Flabébé line: yellow, orange and white, through Melemele Meadow SOS
  encounters, breeding and evolution. Red and blue require imports:
  https://bulbapedia.bulbagarden.net/wiki/Flab%C3%A9b%C3%A9_(Pok%C3%A9mon)
- USUM Basculin red/blue stripes, Lycanroc Midday/Midnight, and all seven
  Minior core colours are ordinary encounters:
  https://www.serebii.net/pokedex-sm/550.shtml
  https://www.serebii.net/pokedex-sm/745.shtml
  https://www.serebii.net/pokedex-sm/774.shtml
  Dusk Lycanroc requires the distributed Own Tempo Rockruff in Gen VII and
  is excluded, even though descendants can be traded and bred.

Excluded throughout: distributions, gender-only differences, battle-only
transformations, Totem sizes, and Furfrou trims (revert in storage). USUM
transfer-only families are available through the Traded forms option. A form changing through an ordinary in-game item counts;
cosmetic colour variants count when obtainable in that pack.

- Vivillon: Scatterbug is obtainable through USUM Island Scan, so its 18
  regional patterns count (ordinary trading covers other console regions).
  Fancy and Poké Ball patterns are distributions and excluded:
  https://www.serebii.net/ultrasunultramoon/islandscan.shtml
  https://bulbapedia.bulbagarden.net/wiki/Vivillon_(Pok%C3%A9mon)

### Traded forms

`traded_forms` flags additional forms requiring another game. The first form
is always an unflagged baseline, including for transfer-only species; this
keeps one species default when traded forms are hidden. Counts therefore
include those baselines, rather than asserting the species is locally caught.

- HGSS: non-default Burmy/Wormadam cloaks, East Sea Shellos/Gastrodon and
  Rotom appliances require imports, following the approved catalog rule.
  https://www.serebii.net/heartgoldsoulsilver/forms.shtml
- USUM transfer-only species: Unown, Burmy/Wormadam, Deerling/Sawsbuck,
  Pumpkaboo/Gourgeist and Deoxys. Additional forms are flagged as traded.
  Deoxys has a normal-gameplay origin in ORAS and can change form in USUM.
  https://www.serebii.net/ultrasunultramoon/unobtainable.shtml
  https://www.serebii.net/ultrasunultramoon/forms.shtml
  https://www.serebii.net/omegarubyalphasapphire/legendary.shtml
- USUM: Kantonian counterparts of Alolan species require imports except
  Raichu, Exeggutor and Marowak, which can evolve in Ultra Space. Red/blue
  flowers in the Flabébé line are imports; local yellow/orange/white remain.
  Regional forms, evolution and flower sources are listed above.
- Vivillon uses Meadow as the existing fixed default. Other normal regional
  patterns are traded; no console-region setting is inferred. Both versions
  of each pack share a catalog, so version-exclusive forms remain local.
- Furfrou trims, event-origin forms, battle transformations and gender-only
  differences remain excluded. Spinda's personality-derived markings are
  not discrete pokemon-form entries and remain outside this catalog.
  Mothim cloak origins and Scatterbug/Spewpa regional origins have identical
  appearance and mechanics; their PokeAPI entries are not separate targets.

## Box art

- Covers keep the full source image and its proportions, at up to 512px on
  the longest side, saved as JPEG at quality 92. The app uses
  `object-fit: contain` so square frames show the complete artwork.
- FireRed, LeafGreen, Crystal, HeartGold, SoulSilver, Ultra Sun and Ultra Moon:
  - `fr.jpg`: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Advance/master/Named_Boxarts/Pokemon%20-%20FireRed%20Version%20%28USA%2C%20Europe%29.png
  - `lg.jpg`: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Advance/master/Named_Boxarts/Pokemon%20-%20LeafGreen%20Version%20%28USA%2C%20Europe%29.png
  - `hg.jpg`: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_DS/master/Named_Boxarts/Pokemon%20-%20HeartGold%20Version%20%28USA%29.png
  - `ss.jpg`: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_DS/master/Named_Boxarts/Pokemon%20-%20SoulSilver%20Version%20%28USA%29.png
  - `us.jpg`: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_3DS/master/Named_Boxarts/Pokemon%20Ultra%20Sun%20%28USA%29%20%28En%2CJa%2CFr%2CDe%2CEs%2CIt%2CZh%2CKo%29.png
  - `um.jpg`: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_3DS/master/Named_Boxarts/Pokemon%20Ultra%20Moon%20%28USA%29%20%28En%2CJa%2CFr%2CDe%2CEs%2CIt%2CZh%2CKo%29.png
  - `c.jpg`: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Color/master/Named_Boxarts/Pokemon%20-%20Crystal%20Version%20%28USA%29.png
- FireRed and LeafGreen for Nintendo Switch use the official square eShop
  artwork, resized to 512px without cropping the listing banner:
  - `frs.jpg`: https://art.gametdb.com/switch/coverHQ/US/BPUJB.jpg
  - `lgs.jpg`: https://art.gametdb.com/switch/coverHQ/US/BPUKB.jpg

### Coming Soon box art

- Alpha Sapphire: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_3DS/master/Named_Boxarts/Pokemon%20Alpha%20Sapphire%20%28USA%29.png
- Black 2: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_DS/master/Named_Boxarts/Pokemon%20-%20Black%20Version%202%20%28USA%2C%20Europe%29%20%28NDSi%20Enhanced%29.png
- Black: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_DS/master/Named_Boxarts/Pokemon%20-%20Black%20Version%20%28USA%2C%20Europe%29%20%28NDSi%20Enhanced%29.png
- Blue: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy/master/Named_Boxarts/Pokemon%20-%20Blue%20Version%20%28USA%2C%20Europe%29%20%28SGB%20Enhanced%29.png
- Diamond: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_DS/master/Named_Boxarts/Pokemon%20-%20Diamond%20Version%20%28USA%29%20%28Rev%205%29.png
- Emerald: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Advance/master/Named_Boxarts/Pokemon%20-%20Emerald%20Version%20%28USA%2C%20Europe%29.png
- Gold: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Color/master/Named_Boxarts/Pokemon%20-%20Gold%20Version%20%28USA%2C%20Europe%29%20%28SGB%20Enhanced%29%20%28GB%20Compatible%29.png
- Moon: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_3DS/master/Named_Boxarts/Pokemon%20Moon%20%28USA%29%20%28En%2CJa%2CFr%2CDe%2CEs%2CIt%2CZh%2CKo%29.png
- Omega Ruby: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_3DS/master/Named_Boxarts/Pokemon%20Omega%20Ruby%20%28USA%29.png
- Pearl: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_DS/master/Named_Boxarts/Pokemon%20-%20Pearl%20Version%20%28USA%29%20%28Rev%205%29.png
- Platinum: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_DS/master/Named_Boxarts/Pokemon%20-%20Platinum%20Version%20%28USA%29.png
- Red: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy/master/Named_Boxarts/Pokemon%20-%20Red%20Version%20%28USA%2C%20Europe%29%20%28SGB%20Enhanced%29.png
- Ruby: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Advance/master/Named_Boxarts/Pokemon%20-%20Ruby%20Version%20%28USA%29.png
- Sapphire: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Advance/master/Named_Boxarts/Pokemon%20-%20Sapphire%20Version%20%28USA%29.png
- Silver: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Color/master/Named_Boxarts/Pokemon%20-%20Silver%20Version%20%28USA%2C%20Europe%29%20%28SGB%20Enhanced%29%20%28GB%20Compatible%29.png
- Sun: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_3DS/master/Named_Boxarts/Pokemon%20Sun%20%28USA%29%20%28En%2CJa%2CFr%2CDe%2CEs%2CIt%2CZh%2CKo%29.png
- White 2: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_DS/master/Named_Boxarts/Pokemon%20-%20White%20Version%202%20%28USA%2C%20Europe%29%20%28NDSi%20Enhanced%29.png
- White: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_DS/master/Named_Boxarts/Pokemon%20-%20White%20Version%20%28USA%2C%20Europe%29%20%28NDSi%20Enhanced%29.png
- X: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_3DS/master/Named_Boxarts/Pokemon%20X%20%28USA%29.png
- Y: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_3DS/master/Named_Boxarts/Pokemon%20Y%20%28USA%29.png
- Yellow: https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy/master/Named_Boxarts/Pokemon%20-%20Yellow%20Version%20-%20Special%20Pikachu%20Edition%20%28USA%2C%20Europe%29%20%28CGB%2BSGB%20Enhanced%29.png

## Yellow (original Game Boy)

Pack/version `yellow`, encounter code `y`. This covers international Yellow,
not Let's Go or FireRed/LeafGreen. No save-file mapping is enabled.

Primary script references below are pinned to pret/pokeyellow commit
`b452f2ab07185075140061c5084ab866d5e4a794`:
https://github.com/pret/pokeyellow/tree/b452f2ab07185075140061c5084ab866d5e4a794
The source was read without building it. Paths below are relative to that tree.

### Metadata, progression and access

- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Yellow
  identifies the original Game Boy game and the area's progression order.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Yellow/Part_3
  and `scripts/PewterCity.asm`: Brock blocks the east exit, so Route 3,
  Mt. Moon, Route 4, Cerulean and Routes 24/25 follow Boulder. Route 22 and
  both western Route 2 grass sections are accessible beforehand.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Yellow/Part_5
  and `scripts/BillsHouse.asm`: helping Bill opens the burgled-house passage
  to Route 5, the Underground Path, Route 6 and Vermilion. Route 11 and
  Diglett's Cave are accessible from Vermilion without defeating Lt. Surge.
- https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_2
  establishes the eastern Mr. Mime house can be reached through Diglett's
  Cave, whereas the northern grass is reachable through Viridian Forest
  before Brock. Only the trade row, not northern grass, requires Bill.
- https://www.supercheats.com/gameboy/walkthroughs/pokemonyellow-walkthrough07.txt
  sections Route 9 through Celadon, Route 12 through Fuchsia, Sea Routes 19–21,
  Power Plant and Victory Road supply the physical connections: Cut opens
  Route 9; Rock Tunnel leads to Lavender, Routes 8/7 and Celadon. Route 12's
  northern fishing pier and Route 16's Cut-access grass open before Snorlax.
  Flash lights Rock Tunnel but is not a physical-access requirement.
  This older walkthrough's claims about Misty unlocking Bulbasaur and Nugget
  Bridge are contradicted by the original scripts; they are not used.
- `engine/menus/start_sub_menus.asm` checks `BIT_CASCADEBADGE` for Cut,
  `BIT_SOULBADGE` for Surf, `BIT_RAINBOWBADGE` for Strength. These are the
  modeled HM gates. Fly/Flash do not unlock encounter areas and are omitted
  from the kit. `scripts/{VermilionOldRodHouse,FuchsiaGoodRodHouse,
  Route12SuperRodHouse,SSAnneCaptainsRoom,SafariZoneSecretHouse,
  WardensHouse}.asm` source rods, Cut, Surf and Strength acquisition.
- `scripts/Route5Gate.asm` and `engine/events/saffron_guards.asm`: Saffron
  opens with Fresh Water, Soda Pop or Lemonade, not the remakes' Tea.
- `engine/battle/core.asm` checks `SILPH_SCOPE` to identify tower ghosts.
  `scripts/PokemonTower6F.asm` makes Marowak the 7F blocker; tower encounters
  are grouped after obtaining the Scope, and 7F additionally needs Marowak.
- `scripts/{MrFujisHouse,Route12,Route16}.asm` and
  `engine/items/item_effects.asm` source the Poké Flute and Snorlax.
  The southern land routes, Fuchsia, Safari Zone and Route 19 beach follow
  the Flute; sea routes, Seafoam, Cinnabar/Mansion and Power Plant need Surf.
  Route 17 also needs the Bicycle (`scripts/Route16Gate1F.asm`).
- https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_23 and
  `scripts/{Route22Gate,Route23}.asm`: Boulder admits entry; the Rainbow
  checkpoint is on the southern bank. Fishing rows require the first four
  badges, while grass beyond the water and Marsh checkpoint also needs
  Soul, Marsh and Surf. Victory Road entry requires all eight badges plus
  Surf; 2F/3F require the 1F Strength switch (`scripts/VictoryRoad1F.asm`).
- https://bulbapedia.bulbagarden.net/wiki/Seafoam_Islands and
  `scripts/SeafoamIslandsB4F.asm`: Articuno is beyond the boulder/current
  puzzle and needs Strength. Ordinary cave-floor encounters are not all
  gated by the puzzle, since the western entrance is reachable via Pallet,
  Route 21 and Cinnabar with Surf.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Yellow/Part_17
  sources post-League Cerulean Cave access and Surf to its entrance.
- `constants/pokedex_constants.asm` ends with `DEX_MEW ; 151`;
  `constants/pokemon_data_constants.asm` defines 12 boxes of 20 for the
  international game. The regional/national bound is 151. `scripts/*Gym.asm`
  and `text/*Gym.asm` source Brock/Boulder, Misty/Cascade, Lt. Surge/Thunder,
  Erika/Rainbow, Koga/Soul, Sabrina/Marsh, Blaine/Volcano, Giovanni/Earth.

### Gifts, statics, trades and generation differences

- https://www.serebii.net/yellow/gift.shtml plus `scripts/OaksLab.asm`:
  Pikachu Lv 5 in Pallet is the only starter. `scripts/CeruleanMelaniesHouse.asm`
  checks `cp 147` before giving Bulbasaur Lv 10; `scripts/Route24.asm` gives
  Charmander Lv 10 without a badge condition; `scripts/VermilionCity_2.asm`
  checks `BIT_THUNDERBADGE` before giving Squirtle Lv 10.
- `scripts/CeladonMansionRoofHouse.asm` gives Eevee Lv 25 without a story
  gate. `data/events/prizes.asm` sources Abra 230, Vulpix 1000, Wigglytuff
  2680, Scyther/Pinsir 6500 and Porygon 9999 coins. Those PokeAPI conditions
  are preserved. `scripts/FightingDojo.asm` offers one of Hitmonlee/Hitmonchan
  after the Karate Master. Both remain listed as choices; the app tracks
  species owned rather than consuming the mutually exclusive gift.
- `scripts/PokemonTower7F.asm` removes the Silph entrance blocker after Fuji
  is rescued. `scripts/SilphCo7F.asm` and its rival trigger coordinates source
  Lapras Lv 15 after the rival. No badge substitutes for these story events.
- `scripts/CinnabarLabFossilRoom.asm` requires Dome/Helix Fossil/Old Amber and
  revives at Lv 30 after leaving the lab. PokeAPI's item conditions are kept.
  The Route 3/Route 4 Pokémon Center Magikarp records refer to the same
  Mt. Moon entrance seller (`scripts/MtMoonPokecenter.asm`); both map to the
  Route 4 Pokémon Center and merge to one row.
- `data/events/trades.asm` contains all seven used Yellow trades: Clefairy
  for Mr. Mime; Cubone for Machoke; Lickitung for Dugtrio; Tangela for
  Parasect; Golduck for Rhydon; Growlithe for Dewgong; Kangaskhan for Muk.
  Unused trade entries are not added. PokeAPI preserves requested species.
- `data/maps/objects/{PowerPlant,VictoryRoad2F,SeafoamIslandsB4F,
  CeruleanCaveB1F}.asm` source Voltorb/Electrode and the four legendary
  statics. Moltres belongs to Victory Road, not Mt. Ember.
- `data/pokemon/evos_moves.asm` has no baby pre-evolutions. The generator
  suppresses later-generation parents only in Generation I and leaves other
  packs unchanged. `engine/items/item_effects.asm` explicitly rejects the
  starter Pikachu's evolution stone; Raichu's text explains traded Pikachu.
  Magnemite/Magneton are pure Electric (`data/pokemon/base_stats/*.asm`),
  and Clefairy/Jigglypuff are Normal, Mr. Mime Psychic. PokeAPI's past types
  already supplies these correctly. `scripts/check_yellow.mjs` guards these
  cases plus floor odds and gift/legendary gates.
- All Yellow PokeAPI methods, conditions, levels and odds were inspected from
  the cached `pokemon/*/encounters` endpoints. Cave/tower floors stay distinct
  through pack-specific renames, avoiding summed odds across floors. PokeAPI
  calls Rock Tunnel's floors `b1f`/`b2f`; their complete wild tables match
  `data/wild/maps/RockTunnel1F.asm` / `RockTunnelB1F.asm` respectively,
  so Yellow displays them as 1F/B1F.
- https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-i/yellow/transparent
  supplies regular sprites 1–151, verified through GitHub's directory API.
  There is no shiny directory. Yellow has no shiny variants or collectible
  forms: its shiny asset paths intentionally serve the identical original
  art so generic tracker controls never request nonexistent sprites.
  Existing `public/covers/y.jpg` supplies the picker and generated page cover.

No Yellow guide PDF is present in the supplied iCloud guide folder. Bulbapedia
walkthrough parts 7 and 11 returned 403; no bypass was attempted. The accessible
walkthrough and original scripts above were used instead. Independent access
review and browser/gameplay QA remain coordinator responsibilities.

Integration note: Yellow's Cut kit id/icon is `yellow-cut` to avoid colliding
with FRLG's existing `cut` story event. It still displays as Cut and requires
Cascade. Shared registry, sprite fit, species-limit, package check and page
entries need to be combined with the other agents' edits, retaining every pack.

## Red and Blue (`rb`)

Original international Red and Blue, not Japanese Blue, Yellow or FRLG.
Source inspection: pret/pokered revision
`130ac3fa5493fb29a8005e8439fd31b4826e46af` (read only; not built).
All pret paths below are relative to:
https://github.com/pret/pokered/tree/130ac3fa5493fb29a8005e8439fd31b4826e46af

### Encounters, historical data and artwork

- https://pokeapi.co/api/v2/pokemon/1/encounters and the corresponding
  species 1–151 endpoints: selected only version `red` or `blue`. Inspected
  all methods, locations, odds, levels and condition values. Methods are
  walking, three rods, Surf, gift, NPC trade, static and Poké Flute.
  Conditions are trade requests, fossil items and Game Corner coin costs;
  the existing renderer already labels these. No clock conditions or forms.
- https://pokeapi.co/api/v2/pokedex/2/ provides the Kanto dex order.
  `constants/pokedex_constants.asm` and `constants/pokemon_constants.asm`
  establish the 151-species bound and original starter choices (Bulbasaur,
  Charmander, Squirtle); `scripts/OaksLab.asm` permits one starter.
- `data/pokemon/base_stats/*.asm` and `data/pokemon/evos_moves.asm` are the
  original types and evolution rules. Checked all 151 generated species:
  PokeAPI `past_types` correctly removes Steel from Magnemite/Magneton
  and Fairy from the later-retyped species. The builder now suppresses
  later-added baby pre-evolutions in Gen I only; Hitmonlee/Hitmonchan have
  no Tyrogue evolution or Attack/Defense condition here. Existing pack
  generation remains byte-identical. `check_gen1.mjs` protects those rules
  and distinct Mt. Moon floor odds.
  PokeAPI’s Rock Tunnel B1F table is the original 1F table (Zubat 55%,
  levels 15–18); its B2F table is the original B1F table (Zubat 50%,
  levels 16–18). The pack renames these using
  `data/wild/maps/{RockTunnel1F,RockTunnelB1F}.asm`, without changing odds.
- https://pokeapi.co/api/v2/pokemon/25/ and
  https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-i/red-blue/transparent
  supply Red/Blue regular sprites. There is no Gen I shiny set in that
  API's `red-blue` sprite object. The tracker's shared shiny URL paths
  intentionally contain identical regular artwork, with no invented shiny
  colours and no requests for missing shiny assets. 151 regular + 151
  fallback images were fetched and centred. No alternate form catalog.
- Existing `public/covers/r.jpg` and `b.jpg` are reused unchanged for the
  picker and generated `/red-blue/` page.

### Metadata, badges and kit

- `constants/pokemon_data_constants.asm`: `MONS_PER_BOX EQU 20`,
  `NUM_BOXES EQU 12` (international releases).
- https://www.serebii.net/rb/gyms.shtml gives the eight leaders and badges:
  Brock/Boulder, Misty/Cascade, Lt. Surge/Thunder, Erika/Rainbow, Koga/Soul,
  Sabrina/Marsh, Blaine/Volcano and Giovanni/Earth. Region is Kanto;
  Pallet Town is the start; regional and national scope are both 151.
- `engine/menus/start_sub_menus.asm` checks Cascade for Cut, Thunder for Fly,
  Soul for Surf, Rainbow for Strength and Boulder for Flash. Surf and
  Strength are kit items with badge rules. Cut is an event plus explicit
  Cascade requirements, and means possessing a Pokémon that knows Cut
  (including a traded one), rather than requiring the S.S. Anne visit.
  Fly and Flash do not block catchable areas: Flash changes illumination.
- `scripts/VermilionOldRodHouse.asm`, `scripts/FuchsiaGoodRodHouse.asm`,
  `scripts/Route12SuperRodHouse.asm`, `scripts/SafariZoneSecretHouse.asm`,
  `scripts/WardensHouse.asm`, `scripts/BikeShop.asm`: rods, Surf HM,
  Strength HM and Bicycle acquisition. Acquisition is player selected in
  the kit checklist; encounter methods enforce the relevant rod/Surf.
- `scripts/Route16Gate1F.asm`: the Bicycle check blocks Route 17, but not
  Route 18 reached on foot from Fuchsia. Safari Zone's four areas remain
  distinct, all reachable during an ordinary visit without Surf.

### Earliest access and story milestones

All ten chapters carry walkthrough URLs in `data/rb.json`; area and row
exceptions carry pret or walkthrough citations. Walkthrough order alone
was not used as a gate: Power Plant opens with Surf, not the postgame.

- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-3/
  and `data/maps/headers/{PalletTown,Route1,ViridianCity,Route22,Route2,ViridianForest}.asm`
  cover the connected starting area through Pewter. Route 2's northern
  western grass is accessible through the forest; its eastern trade house
  is a separate row gate, reached from Diglett's Cave.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-5/
  and `scripts/PewterCity.asm`: `CheckEvent EVENT_BEAT_BROCK` blocks the
  eastern exit, so Route 3, Mt. Moon, Route 4 and Cerulean wait for Boulder.
  Routes 24/25 are accessible from Cerulean before Misty. No Cascade gate.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-8/
  and `scripts/BillsHouse.asm`: receiving S.S. Ticket moves the policeman
  at the burgled house, opening the southern exit to Route 5. This opens
  Underground Path, Route 6, Vermilion, Route 11 and Diglett's Cave.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-12/
  describes the cave's Route 2 exit; Mr. Mime's trade row waits for this
  access, while the original northern Route 2 grass is not delayed.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-13/
  and https://strategywiki.org/wiki/Pok%C3%A9mon_Red_and_Blue/Routes_9_and_10
  establish the Cut tree at Route 9. The connected path through Route 10,
  Rock Tunnel, Lavender, Route 8, Underground Path and Route 7 reaches
  Celadon. Route 12's north shore is already accessible from Lavender;
  its walking encounters require removing Snorlax. Route 16's northern
  grass is accessible with Cut before removing its Snorlax.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-16/
  and `scripts/{CeladonDiner,CeladonMansionRoofHouse}.asm` establish Coin
  Case and Eevee acquisition without a badge/story milestone in Celadon.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-19/
  and `scripts/Route7Gate.asm`: a vending drink opens Saffron's guards;
  no Tea event. `scripts/PokemonTower7F.asm` hides `TOGGLE_SAFFRON_CITY_E`
  when rescuing Fuji, opening Silph Co. `scripts/SilphCo7F.asm` places
  Lapras after the rival/warp-room access (not after Giovanni); its event
  includes Fuji and the drink. The Fighting Dojo gift waits for its master.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-18/
  and `scripts/{PokemonTower6F,PokemonTower7F,MrFujisHouse}.asm`: Scope
  reveals catchable ghosts; defeating ghost Marowak opens 7F, rescuing Fuji
  leads to the Flute. The ghost Marowak is not a catchable static.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-20/
  and `engine/items/item_effects.asm`: Flute wakes Route 12/16 Snorlax;
  southern Routes 13–15 or Cycling Road reach Fuchsia, Safari Zone and
  Route 19's beach. Route 17 additionally requires the Bicycle.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-22/
  and https://www.pokemon-france.com/en/guides/blue-red/walkthrough-28/
  establish Surf access to Sea Routes 20/21, Seafoam, Cinnabar/Mansion and
  Power Plant. Cinnabar is reachable directly from Pallet via Route 21,
  without solving Seafoam. Articuno additionally needs Strength's boulder
  puzzle; ordinary floor encounters are not all delayed behind Strength.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-25/
  plus `scripts/{Route22Gate,Route23}.asm`, `maps/Route23.blk`, and
  `data/maps/headers/Route23.asm`: inspected the original map rendered
  from its PLATEAU blockset (no ROM build). First water is north of Rainbow
  guard y105; first grass is north of Marsh guard y85 and south of Volcano
  y56. Thus fishing waits for Boulder/Cascade/Thunder/Rainbow, grass also
  needs Surf/Soul/Marsh. Victory Road's entrance needs all eight badges and
  Surf. 1F wild encounters precede the first Strength switch; 2F/3F and
  Moltres wait for Strength. No remake Mt. Ember location.
- https://www.pokemon-france.com/en/guides/blue-red/walkthrough-29/
  establishes Hall of Fame plus Surf for Cerulean Cave, including Mewtwo;
  no Sevii quest, National Dex or catch-count requirement.

### Gifts, trades, fossils and statics

- `scripts/MtMoonPokecenter.asm`: one level-5 Magikarp for ₽500. PokeAPI
  duplicates this seller under Route 3 and Route 4 Pokémon Centers; the
  pack drops the Route 3 alias and keeps Route 4 (the actual Mt. Moon stop).
- `scripts/FightingDojo.asm`: one of Hitmonlee/Hitmonchan after the master.
  `scripts/SilphCo7F.asm`: level-15 Lapras. `scripts/CeladonMansionRoofHouse.asm`:
  level-25 Eevee. `engine/events/prize_menu.asm` checks Coin Case before
  coin exchange; `data/events/prizes.asm` supplies Red/Blue prize differences.
- `scripts/{MtMoonB2F,Museum1F,CinnabarLabFossilRoom}.asm`: Dome/Helix choice,
  Old Amber and fossil revival. PokeAPI retains required fossil/Amber
  conditions and level-30 gifts. The tracker does not record the mutually
  exclusive Dome/Helix or Dojo choice as it does the selected starter.
- `data/events/trades.asm` and each corresponding map script verify all
  nine used trades: Nidorino→Nidorina (Route 11), Abra→Mr. Mime (Route 2),
  Ponyta→Seel (Cinnabar), Spearow→Farfetch'd (Vermilion), Slowbro→Lickitung
  (Route 18), Poliwhirl→Jynx (Cerulean), Raichu→Electrode and
  Venonat→Tangela (Cinnabar), Nidoran♂→Nidoran♀ (Route 5 Underground Path).
  The unused Butterfree→Beedrill table row is not added.
- `data/maps/objects/{PowerPlant,SeafoamIslandsB4F,VictoryRoad2F,CeruleanCaveB1F}.asm`
  verifies Power Plant's Voltorb/Electrode/Zapdos, Articuno, Moltres and
  Mewtwo. No Mew glitch or discontinued distribution encounter is invented.

### Evidence limits

StrategyWiki full-page requests returned 403; its indexed Route 9 excerpt
was available. Bulbapedia automation was not attempted. Pokémon-France was
read through the search/fetch tool; direct scripted requests returned 403
and were not retried or bypassed. No Red/Blue scanned guide is present in
the supplied guide folder. Independent access audit, emulator/gameplay and
manual browser verification remain coordinator checkpoints. Existing covers
are reused; their original provenance was not re-established in this pass.
Tracking registration and the required species-limit entries do not enable
or establish save-file import support.

## Gold and Silver (`gs`)

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
checks remain the coordinator's work. Open cave mappings are not certified.

### Red/Blue: Cerulean fishing access audit

- Required Surf for Cerulean City's fishing rows (54, 60, 98, 118, 129). The Jynx trade is unaffected. Independently checked by the Claude first pass and Codex coordinator against pinned `pret/pokered` revision `130ac3fa5493fb29a8005e8439fd31b4826e46af`.
- [Fishing rules](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/engine/items/item_effects.asm): `call IsNextTileShoreOrWater` checks the facing tile, and `scf ; can't fish when surfing` rejects fishing while surfing.
- [Cerulean map](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/maps/CeruleanCity.blk), [Route 4 map](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/maps/Route4.blk), [overworld blockset](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/gfx/blocksets/overworld.bst), [collision IDs](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/tilesets/collision_tile_ids.asm) and [ledge directions](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/data/tilesets/ledge_tiles.asm) establish the spatial inference: on-foot entrances cannot reach the fishing shore by the cave door; Surf reaches it. This includes the Route 4 approach. Standing on Route 24 uses Route 24's encounter table. Binary-map decoding and source review were performed; emulator verification remains outstanding.

### Game Boy access audit: second-pass exclusions

The second pass inspected original scripts rather than accepting terrain-only shortcuts. Existing gates were retained for these rejected first-pass proposals:

- Red/Blue Diglett's Cave / Route 6: [Bill's ticket script](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/scripts/BillsHouse.asm) swaps the Cerulean guard (`SetEvent EVENT_GOT_SS_TICKET` then `ShowObject` / `HideObject`). A route through Route 5 does not establish access before that guard moves.
- Red/Blue Victory Road 2F: [1F script](https://github.com/pret/pokered/blob/130ac3fa5493fb29a8005e8439fd31b4826e46af/scripts/VictoryRoad1F.asm) checks `EVENT_VICTORY_ROAD_1_BOULDER_ON_SWITCH` before replacing block (6,4). The 2F arrival pocket alone does not establish entry without Strength.
- Gold/Silver Ice Path: [initial event flags](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/engine/events/std_scripts.asm) set `EVENT_BOULDER_IN_ICE_PATH_1A` through `4A`, hiding B2F boulders until they fall. Correcting that initial state in the reviewer's slide model removed its claimed B3F access without Strength.
- Gold/Silver Route 27: [map warps](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route27.asm) include `warp_event 26, 5, TOHJO_FALLS, 1` and `warp_event 36, 5, TOHJO_FALLS, 2`; walking behind those cave warps was an invalid shortcut in the terrain model.
- Gold/Silver Kanto shortcut and western approaches: [Victory Road Gate](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/VictoryRoadGate.asm) keeps its east-door Black Belt until `EVENT_FOUGHT_SNORLAX`. [Route 19](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route19.asm) inserts rock blocks until `EVENT_CINNABAR_ROCKS_CLEARED`; merely reaching Fuchsia does not establish sea access. These checks reject the proposed shortcuts, rather than claiming exhaustive gameplay proof of every alternative.

Yellow Cerulean fishing and Gold/Silver Mt. Mortar / Route 1 uncertainties remain in OPEN_QUESTIONS.md. No gate was removed on the basis of these rejected or unresolved flags.

### Gold/Silver: Route 13 grass access

- Claude first pass and independent Codex second pass agreed that the seven Route 13 walking species need `cut-hm`. Fishing and Surf rows are unaffected. The second pass decoded the pinned binary map with deliberately permissive boundary entrances and Surf: 0/32 grass cells without Cut; 32/32 with Cut. This is source/collision evidence, not emulator verification.
- Original sources at `pret/pokegold` revision `f2cde36f49b994c143bfd18582182302fdc76492`: [Route 13 map](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route13.blk), [map attributes](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/maps/attributes.asm), [Kanto collision table](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/data/tilesets/kanto_collision.asm), and [Cut collision routine](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/engine/overworld/tile_events.asm). `CheckCutCollision` searches its `.blocks` table; the decoded tree at (44,4) is the grass entrance.

### Additional independent access checks

- Gold/Silver [Route 32](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/Route32.asm) uses `Route32CooltrainerMStopsYouScene` to push the player back before Union Cave. [Violet's Pokémon Center](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/VioletPokecenter1F.asm) changes that scene after accepting the egg. The existing chapter gate is retained.
- Gold/Silver [Tin Tower 1F](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/TinTower1F.asm) has a sage on the upstairs warp, hidden by `EVENT_TEAM_ROCKET_DISBANDED`. [Radio Tower 5F](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/RadioTower5F.asm) sets it in Gold's Rainbow Wing branch, while [Pewter City](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/PewterCity.asm) sets it in Silver's Rainbow Wing branch. Walk encounters begin above 1F, so the wing gate is retained.
- Gold/Silver [Burned Tower 1F](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/BurnedTower1F.asm) has Rock Smash objects at (4,3) and (16,13). Including those objects invalidated the first pass's path to the central hole and beast release; retain Rock Smash rather than using a terrain search that parsed no rocks.
- Yellow [Silph Co. 7F](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/scripts/SilphCo7F.asm) checks `EVENT_BEAT_SILPH_CO_RIVAL` in the same isolated room as Lapras. The existing `silph-rival` requirement already entails reaching that room through the key doors; no separate Card Key event was added.

### Yellow: Route 12 grass access

Claude first pass and independent Codex second pass agreed that the seven Route 12 walking species (16, 17, 43, 44, 69, 70, 83) require `flute`. All grass lies south of the Snorlax; the northern bank remains available for fishing. Sources at pinned `pret/pokeyellow` revision `b452f2ab07185075140061c5084ab866d5e4a794`: [Route 12 objects](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/Route12.asm), with `object_event 10, 62, SPRITE_SNORLAX`, and the [Route 12 map](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/maps/Route12.blk). The independent source model included Cut and both Route 12/16 Snorlax blockers; the Route 16 Cut enclosure is not a bypass onto Cycling Road. Fishing and Surf rows are unchanged. No emulator verification was performed.

Additional rejected proposals: Yellow's [Route 2 warp table](https://github.com/pret/pokeyellow/blob/b452f2ab07185075140061c5084ab866d5e4a794/data/maps/objects/Route2.asm) includes both Diglett's Cave and the trade house. The Diglett exit reaches the house without Cut, supporting the existing Bill requirement. Gold/Silver's [Lake of Rage](https://github.com/pret/pokegold/blob/f2cde36f49b994c143bfd18582182302fdc76492/maps/LakeOfRage.asm) only shows Lance after the Red Gyarados encounter (`appear LAKEOFRAGE_LANCE`); reaching Mahogany on foot does not establish Surf-free hideout access.

## Emerald

Pack/version ID: `emerald`, encounter code `e`. This is the original Game Boy
Advance game. Ruby and Sapphire remain separate Coming Soon entries.

- Encounter species, levels, odds, methods, regional numbering and historical
  types: https://pokeapi.co/api/v2/version/9/ and
  https://pokeapi.co/api/v2/pokedex/4/ through the cached data pipeline.
- Chapter places and access: https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Emerald
  Parts 1–2 cover the opening and Peeko/Devon Letter; Part 3 covers Briney's
  Dewford/Slateport voyage and Granite Cave; Parts 4–5 cover the Museum,
  Mauville and Verdanturf; Parts 6–8 cover Rock Smash, Mt. Chimney, Lavaridge,
  Go-Goggles and Mirage Tower; Parts 9–12 cover Surf, Route 118/123, New
  Mauville, Weather Institute, Devon Scope, Safari Zone and Mt. Pyre;
  Parts 13–18 cover the submarine, eastern ocean, Dive, Seafloor Cavern,
  Sootopolis, Regis, Rayquaza and Victory Road. Parts 20–22 cover postgame
  gifts, weather caves, Battle Frontier and historical distribution islands.
  Each chapter/event/gate in `data/emerald.json` links its relevant part.
- Primary source pinned to pret/pokeemerald
  `731ad5bfd6e6f265508d0efcca0ba42f9dcf5881`:
  https://github.com/pret/pokeemerald/tree/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881
  No ROM was built or used.
- HM badge order (Cut/Stone, Flash/Knuckle, Rock Smash/Dynamo,
  Strength/Heat, Surf/Balance, Fly/Feather, Dive/Mind, Waterfall/Rain):
  `src/party_menu.c`, `sFieldMoveBadgeRequirements`. Gym names/leaders:
  `data/maps/*Gym/scripts.inc`, including Juan in Sootopolis and Tate/Liza
  in Mossdeep. This pack exposes catch-relevant travel tools; Fly isn't an
  encounter access requirement.
- 14 boxes of 30: `include/pokemon_storage_system.h` (`TOTAL_BOXES_COUNT`)
  (`IN_BOX_COUNT`, 5 rows × 6 columns). 202 Hoenn / 386
  National: `include/constants/pokedex.h`. Starting gifts Treecko, Torchic,
  Mudkip: `src/starter_choose.c` and `data/maps/Route101/scripts.inc`.
- Gifts, fossils, trades and events were checked in `data/maps/` scripts:
  `DewfordTown`, `RustboroCity_DevonCorp_2F`, `RustboroCity_House1`,
  `Route119_WeatherInstitute_2F`, `LavaridgeTown`,
  `MossdeepCity_StevensHouse`, `LittlerootTown_ProfessorBirchsLab`,
  `SkyPillar_Outside`, `SkyPillar_Top`, `LilycoveCity`,
  `BattleFrontier_OutsideEast`, and `SeafloorCavern_Room9`.
  Beldum needs the Hall of Fame; Johto starters require Birch's completion
  reward; fossils require possession; Latias/Latios follow the red/blue TV
  choice; Rayquaza can be caught before the League after ending the crisis.
- Feebas: `src/wild_encounter.c`, `FishingWildEncounter` calls `CheckFeebas`
  before selecting the rod's ordinary encounter table, so any rod works.
  Underwater seaweed requires Dive; static Kecleon requires the Devon Scope;
  Battle Frontier Sudowoodo requires the Wailmer Pail.
- Historical pre-evolutions and stone/beauty evolution text:
  `src/data/pokemon/evolution.h`, `src/pokemon.c` (friendship clock windows),
  and `src/evolution_scene.c` (Shedinja needs a free slot, no spare ball). Budew, Chingling, Munchlax, Bonsly, Mime Jr.
  and Happiny do not exist in this generation.
- Excluded PokeAPI artifacts: `Team Magma Hideout` is the Ruby duplicate,
  not Emerald's `Magma Hideout`; Cave of Origin B1F is Wallace's room with
  no wild encounters and B2F/B3F are unused. Retain Entrance and 1F.
  `Hoenn Pokecenter` bonus-distribution rows are not ordinary encounters.
- Art: https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-iii/emerald
  provides static regular and shiny sprites for all 386 species. Hoenn
  badge sprites are PokeAPI IDs 17–24. Existing `public/covers/e.jpg` is reused.
- No Emerald official guide PDF was available in the local guide collection.
  Event islands require historical distribution items (Old Sea Map was
  distributed for Japanese Emerald); tracking them does not imply modern
  availability. Save-file import remains separately unsupported.
- Independent access corrections: the Weather Institute clears Route 119's
  bridge blockers (`data/maps/Route119/map.json`,
  `Route119_WeatherInstitute_2F/scripts.inc`); New Mauville's populated
  entrance precedes the key door (`NewMauville_Entrance/map.json` and
  `scripts.inc`); Mirage Tower 1F has the same wild species before the
  summit's bike/rock puzzles (`src/data/wild_encounters.json`).
  Southern Island's scripts select the opposite `VAR_ROAMER_POKEMON` species.
  Route 123's western Berry Master section has no encounter tiles: verified
  from `data/layouts/Route123/map.bin`, its General/Lilycove metatile
  attributes and `include/global.fieldmap.h` collision bits. The western
  connection reaches at most x=41; grass begins at x=49, beyond westbound
  ledges. Its encounters therefore stay with the later Route 122 approach.
