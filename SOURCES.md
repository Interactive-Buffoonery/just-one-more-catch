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

- https://bulbapedia.bulbagarden.net/wiki/Appendix:FireRed_and_LeafGreen_walkthrough
- https://strategywiki.org/wiki/Pok%C3%A9mon_FireRed_and_LeafGreen
- No guide PDF yet.

## Ultra Sun and Ultra Moon

- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ultra_Sun_and_Ultra_Moon
- https://bulbapedia.bulbagarden.net/wiki/Alola (Alolan forms)
- https://strategywiki.org/wiki/Pok%C3%A9mon_Ultra_Sun_and_Ultra_Moon
- The Official Alola Region Strategy Guide (2017): `Pokèmon Ultra Sun & Pokèmon Ultra Moon The Official Alola Region Strategy Guide fix.pdf`

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
  Only Alolan regional variants exist in these packs. Kantonian Raichu,
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
transfer-only form families (Unown, Deerling, Pumpkaboo, Burmy)
are excluded. A form changing through an ordinary in-game item counts;
cosmetic colour variants count when obtainable in that pack.

- Vivillon: Scatterbug is obtainable through USUM Island Scan, so its 18
  regional patterns count (ordinary trading covers other console regions).
  Fancy and Poké Ball patterns are distributions and excluded:
  https://www.serebii.net/ultrasunultramoon/islandscan.shtml
  https://bulbapedia.bulbagarden.net/wiki/Vivillon_(Pok%C3%A9mon)
