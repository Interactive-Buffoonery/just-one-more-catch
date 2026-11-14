# Sources

Where the hand-written game data comes from, best first. Encounter data comes
from PokeAPI and needs no source.

1. **Bulbapedia**: walkthrough appendix, location, item and Badge pages.
   It blocks scripted fetches; read it through `scripts/access_audit.py`
   (see the `audit-access` skill).
2. **StrategyWiki**: a second walkthrough, good for breaking ties. It also
   blocks scripted fetches, so open it in a browser.
3. **Official strategy guides**: archive.org scans kept in a local
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

Unless noted, entries are source traces, not gameplay or emulator checks.

Save imports are tested on synthetic fixtures, as we haven't tested everything with real saves yet. Imports use the import day.

## Games

- [Red and Blue](sources/rb.md)
- [Yellow](sources/yellow.md)
- [Gold and Silver](sources/gs.md)
- [Crystal](sources/crystal.md)
- [HeartGold and SoulSilver](sources/hgss.md)
- [FireRed and LeafGreen](sources/frlg.md)
- [Ruby and Sapphire](sources/rs.md)
- [Emerald](sources/emerald.md)
- [Diamond and Pearl](sources/dp.md)
- [Platinum](sources/pt.md)
- [Black and White](sources/bw.md)
- [Black 2 and White 2](sources/b2w2.md)
- [X and Y](sources/xy.md)
- [Omega Ruby and Alpha Sapphire](sources/oras.md)
- [Sun and Moon](sources/sm.md)
- [Ultra Sun and Ultra Moon](sources/usum.md)

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
  Rotom appliances require imports, following the catalog rule.
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

- Pokémon Emerald 3DS project logo (`emerald-3ds.avif`): https://emerald-3ds.com/assets/logo-DlkkOg0E.avif
- Project: https://emerald-3ds.com/

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
- FireRed and LeafGreen for Nintendo Switch use the square eShop artwork,
  cropped from GameTDB's digital cover (446px, no resizing):
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


## Shiny hunts
- https://www.serebii.net/games/shiny.shtml — base odds 1/8192 before X/Y, 1/4096 from X/Y; Masuda Gen IV 1/2048 (disputed, disabled), Gen V 1/1365.3, Gen VI onwards 1/682.7.
- https://www.serebii.net/games/breed.shtml — incense offspring: Azurill and Wynaut introduced with the Generation III incense rule; Budew, Chingling, Bonsly, Mime Jr., Happiny, Munchlax and Mantyke use incense from Generation IV. Without incense, hatch the next stage; Scarlet/Violet removes the incense requirement.
- https://pokeapi.co/ — pokemon-species egg_groups, evolution families and generation of introduction, fetched by scripts/fetch_pokeapi.py.

### Open questions

- Gen 4 Masuda odds: Serebii gives 1/2048; approximately 1/1638 is reported elsewhere. Unsettled; Masuda is disabled for Gen 4.
- NPC trades are assumed not reset-huntable. Unchecked.
- Egg groups come from current PokeAPI data; per-game changes before Sword/Shield are not spot-checked.
