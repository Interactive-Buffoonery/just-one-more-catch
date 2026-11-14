# Ultra Sun and Ultra Moon (`usum`)

## Sources

- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ultra_Sun_and_Ultra_Moon
- https://bulbapedia.bulbagarden.net/wiki/Alola (Alolan forms)
- https://strategywiki.org/wiki/Pok%C3%A9mon_Ultra_Sun_and_Ultra_Moon
- The Official Alola Region Strategy Guide (2017): `Pokèmon Ultra Sun & Pokèmon Ultra Moon The Official Alola Region Strategy Guide fix.pdf`

### USUM ambush terrain and Machamp review

The USUM sections of the location pages linked in `data/usum.json`'s
`area_methods` identify rustling grass/trees/bushes, dirt/sand clouds,
flying shadows, Dividing Peak Tunnel shadows and water splashes. These
place/species overrides correct PokeAPI's shared bubbling-spots bucket;
fishing methods retain their rod requirement. Cache limitations are listed below.

- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ultra_Sun_and_Ultra_Moon/Part_21
  sails to Poni after clearing Aether Paradise.
- https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ultra_Sun_and_Ultra_Moon/Part_22
  registers Machamp Shove at Ancient Poni Path. Machamp areas therefore also
  require the existing Aether event, including the earlier Lush Jungle cave.

### USUM open-question review

- Haina Desert weather SOS: the Gabite and Castform rows now carry weather
  conditions. https://bulbapedia.bulbagarden.net/wiki/Haina_Desert ("Special
  allies in weather" USUM rows: Gabite and Castform under "Sandstorm", and
  Castform again under "{{color2|000|Rain}} or {{color2|000|Hail (weather
  condition)|hail}}"). pk3DS agrees that weather allies only come up while the weather
  is active:
  https://github.com/kwsch/pk3DS/blob/6daaca934ca2284a73ab743bf89c848c57cd9de1/pk3DS.WinForms/Subforms/Gen7/SMWE.cs#L43
  ("If weather is active, create a random number. If 0, use slot 0. If <= 10,
  use slot 1. Else, pick an SOS table and a slot."). Serebii's SOS page
  describes the same weather-only allies:
  https://www.serebii.net/ultrasunultramoon/sosbattles.shtml
- Lush Jungle subareas (open): PokeAPI South and West both carry the
  ambush block and North does not. https://bulbapedia.bulbagarden.net/wiki/Lush_Jungle
  has one USUM "Central and north area" table with "Ambush encounters" and a
  "Northwest area" table without them, so the West rows match a real zone.
  The West ambush rows stay.
- Route 13 access: https://bulbapedia.bulbagarden.net/wiki/Alola_Route_12
  gives Mudsdale Gallop "from Hapu upon visiting the route for the first
  time", and the Route 13 page lists fishing only with no Ride requirement:
  https://bulbapedia.bulbagarden.net/wiki/Alola_Route_13. No data change.
- Mahalo Trail Solgaleo/Lunala timing (open): Official Alola Region Strategy
  Guide p227-229 ("Go to Mahalo Trail at this point, and you'll find Lillie
  together with the Legendary Pokémon that you helped rescue from
  Necrozma"), and the guide's index (PDF p29): "After defeating Ilima in the
  seventh trial". https://bulbapedia.bulbagarden.net/wiki/Mahalo_Trail:
  "After defeating [[Ilima]] in [[Hau'oli Cemetery]], the player can return
  to the plank bridge". Walkthrough Part 26 puts that battle in Mina's petal
  quest: "[[Ilima]], at [[Hau'oli Cemetery]] on Melemele Island, hands over
  the [[Orange Petal]] after you beat him in battle."
- Route 15 and Poni Breaker Coast Ride gates, Totem Stickers (open):
  https://bulbapedia.bulbagarden.net/wiki/Alola_Route_15,
  https://bulbapedia.bulbagarden.net/wiki/Poni_Breaker_Coast,
  https://www.serebii.net/ultrasunultramoon/totemstickers.shtml,
  https://github.com/kwsch/pk3DS/blob/6daaca934ca2284a73ab743bf89c848c57cd9de1/pk3DS.Core/Structures/Gen7/Gen7SlotDumper.cs#L186-L187
  (`InaccessibleUnused_USUM`, "// Route 15" `{170, [5, 7, 8, 10] }`).


## Open questions

- Poni Breaker Coast Wailmer: the cached bubbling-spots record merges three encounters (10-49, 100%). [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Poni_Breaker_Coast) lists fishing at 10-44 (40%), bubbling-spot fishing at 10-49 (30%) and water splashes at 41-44 (70%). The pack format has no way to add split rows for USUM, so this waits for gap-fill or extra-encounter support in the `usum` pack.

- Lush Jungle West: PokeAPI South and West both have the ambush block and North has none. [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Lush_Jungle) has one USUM "Central and north" table with ambushes and a "Northwest" table without, so West's ambush rows look like a real zone and stay. Needs a zone-by-zone map of the PokeAPI area names.

- Brooklet Hill Main and North: [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Brooklet_Hill) says wild Pokémon stay out of the trial site until the trial is done, and that the first lake is outside it. PokeAPI North and South have identical tables, and nothing maps Main, North or South to a lake. Needs a lake-by-lake source.

- Route 15 Main: [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_15) says Sharpedo Jet is needed to fully explore the route, but its encounter table has no sub-area split, and pk3DS ([Gen7SlotDumper.cs](https://github.com/kwsch/pk3DS/blob/6daaca934ca2284a73ab743bf89c848c57cd9de1/pk3DS.Core/Structures/Gen7/Gen7SlotDumper.cs#L186-L187)) lists Route 15 (170) tables 5, 7, 8 and 10 as unused, not as behind-rock tables. Which rows sit behind the rocks is still unknown.

- Poni Breaker Coast shore access: [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Poni_Breaker_Coast) says the water is crossed with Lapras Paddle or Sharpedo Jet. Nothing says whether the fishing spots or the Wimpod chase can be reached from the shore.

- Mahalo Trail: Solgaleo and Lunala open with the Dragonium. [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Mahalo_Trail) and the guide's index (PDF p29) put them after beating Ilima at Hau'oli Cemetery, which Walkthrough Part 26 places in Mina's petal quest, after Ultra Necrozma. Moving the gate needs a new "defeat Ultra Necrozma" event (or a Mina petal event) plus `row_needs` changes for both rows; held back because it adds a tracker question for saves already past the Dragonium.

- Totem Stickers 70: [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Alola_Route_15) puts the Route 15 sticker on the Surf Association building and [Serebii](https://www.serebii.net/ultrasunultramoon/totemstickers.shtml) gives only region totals, so neither source names the 70th sticker. Bulbapedia lists the TM "In front of the Surf Association building" as needing Lapras Paddle or Sharpedo Jet "after obtaining Sharpedo Jet", so the Route 15 sticker likely waits for Sharpedo Jet. Confirm which sticker is 70th.
