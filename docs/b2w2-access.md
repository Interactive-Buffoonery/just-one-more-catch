# Black 2 / White 2 access work list

Implementation inventory, not an independent access certification. All 137 PokeAPI areas have a cached parent/location article match. A match does not prove a numbered room mapping or its earliest encounter tile. See `OPEN_QUESTIONS.md` for unresolved mappings. Chapter numbers below are zero-based.

Encounter rows are generated from PokeAPI plus sourced outbreak supplements in `extra_encounters` (19 rows per version). Outbreaks require the postgame League milestone and are labeled as daily conditions; the app does not predict the active location. Area-specific and species-specific requirements and their citations live in `data/b2w2.json`; chapter progression is cited there and in `SOURCES.md`.

| PokeAPI area label | Chapter | Area requirements | Cached source |
| --- | --- | --- | --- |
| Abundant Shrine | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | surf, waterfall | [Abundant Shrine](https://bulbapedia.bulbagarden.net/wiki/Abundant_Shrine) |
| Abundant Shrine Hidden Grotto Near Youngster | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | surf, waterfall | [Abundant Shrine](https://bulbapedia.bulbagarden.net/wiki/Abundant_Shrine) |
| Abundant Shrine Hidden Grotto Shrine | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | surf, waterfall | [Abundant Shrine](https://bulbapedia.bulbagarden.net/wiki/Abundant_Shrine) |
| Accumula Town | 10: Postgame Unova (needs ['Elite Four']) | — | [Accumula Town](https://bulbapedia.bulbagarden.net/wiki/Accumula_Town) |
| Aspertia City | 0: Aspertia and Floccesy (needs nothing) | — | [Aspertia City](https://bulbapedia.bulbagarden.net/wiki/Aspertia_City) |
| Castelia City | 2: Castelia City (needs ['Toxic', 'sail-castelia']) | — | [Castelia City](https://bulbapedia.bulbagarden.net/wiki/Castelia_City) |
| Castelia Sewers | 2: Castelia City (needs ['Toxic', 'sail-castelia']) | — | [Castelia Sewers](https://bulbapedia.bulbagarden.net/wiki/Castelia_Sewers) |
| Castelia Sewers Unknown Area 38 | 2: Castelia City (needs ['Toxic', 'sail-castelia']) | — | [Castelia Sewers](https://bulbapedia.bulbagarden.net/wiki/Castelia_Sewers) |
| Celestial Tower 2F | 6: Chargestone and Mistralton (needs ['frigate-driftveil']) | — | [Celestial Tower](https://bulbapedia.bulbagarden.net/wiki/Celestial_Tower) |
| Celestial Tower 3F | 6: Chargestone and Mistralton (needs ['frigate-driftveil']) | — | [Celestial Tower](https://bulbapedia.bulbagarden.net/wiki/Celestial_Tower) |
| Celestial Tower 4F | 6: Chargestone and Mistralton (needs ['frigate-driftveil']) | — | [Celestial Tower](https://bulbapedia.bulbagarden.net/wiki/Celestial_Tower) |
| Celestial Tower 5F | 6: Chargestone and Mistralton (needs ['frigate-driftveil']) | — | [Celestial Tower](https://bulbapedia.bulbagarden.net/wiki/Celestial_Tower) |
| Chargestone Cave 1F | 6: Chargestone and Mistralton (needs ['frigate-driftveil']) | — | [Chargestone Cave](https://bulbapedia.bulbagarden.net/wiki/Chargestone_Cave) |
| Chargestone Cave B1F | 6: Chargestone and Mistralton (needs ['frigate-driftveil']) | — | [Chargestone Cave](https://bulbapedia.bulbagarden.net/wiki/Chargestone_Cave) |
| Chargestone Cave B2F | 6: Chargestone and Mistralton (needs ['frigate-driftveil']) | — | [Chargestone Cave](https://bulbapedia.bulbagarden.net/wiki/Chargestone_Cave) |
| Clay Tunnel | 10: Postgame Unova (needs ['Elite Four']) | — | [Clay Tunnel](https://bulbapedia.bulbagarden.net/wiki/Clay_Tunnel) |
| Desert Resort | 3: The desert and Nimbasa (needs ['Insect', 'clear-route-four']) | — | [Desert Resort](https://bulbapedia.bulbagarden.net/wiki/Desert_Resort) |
| Desert Resort Entrance | 3: The desert and Nimbasa (needs ['Insect', 'clear-route-four']) | — | [Desert Resort](https://bulbapedia.bulbagarden.net/wiki/Desert_Resort) |
| Dragonspiral Tower 1F | 10: Postgame Unova (needs ['Elite Four']) | — | [Dragonspiral Tower](https://bulbapedia.bulbagarden.net/wiki/Dragonspiral_Tower) |
| Dragonspiral Tower 2F | 10: Postgame Unova (needs ['Elite Four']) | — | [Dragonspiral Tower](https://bulbapedia.bulbagarden.net/wiki/Dragonspiral_Tower) |
| Dragonspiral Tower 7F | 10: Postgame Unova (needs ['Elite Four']) | — | [Dragonspiral Tower](https://bulbapedia.bulbagarden.net/wiki/Dragonspiral_Tower) |
| Dragonspiral Tower Entrance | 10: Postgame Unova (needs ['Elite Four']) | — | [Dragonspiral Tower](https://bulbapedia.bulbagarden.net/wiki/Dragonspiral_Tower) |
| Dragonspiral Tower Outside | 10: Postgame Unova (needs ['Elite Four']) | — | [Dragonspiral Tower](https://bulbapedia.bulbagarden.net/wiki/Dragonspiral_Tower) |
| Dreamyard | 10: Postgame Unova (needs ['Elite Four']) | — | [Dreamyard](https://bulbapedia.bulbagarden.net/wiki/Dreamyard) |
| Dreamyard B1F | 10: Postgame Unova (needs ['Elite Four']) | — | [Dreamyard](https://bulbapedia.bulbagarden.net/wiki/Dreamyard) |
| Driftveil City | 4: Driftveil City (needs ['Bolt', 'cross-drawbridge']) | — | [Driftveil City](https://bulbapedia.bulbagarden.net/wiki/Driftveil_City) |
| Driftveil Drawbridge | 4: Driftveil City (needs ['Bolt', 'cross-drawbridge']) | — | [Driftveil Drawbridge](https://bulbapedia.bulbagarden.net/wiki/Driftveil_Drawbridge) |
| Floccesy Ranch Hidden Grotto | 0: Aspertia and Floccesy (needs nothing) | surf | [Floccesy Ranch](https://bulbapedia.bulbagarden.net/wiki/Floccesy_Ranch) |
| Floccesy Ranch Inner | 0: Aspertia and Floccesy (needs nothing) | — | [Floccesy Ranch](https://bulbapedia.bulbagarden.net/wiki/Floccesy_Ranch) |
| Floccesy Ranch Outer | 0: Aspertia and Floccesy (needs nothing) | — | [Floccesy Ranch](https://bulbapedia.bulbagarden.net/wiki/Floccesy_Ranch) |
| Floccesy Town | 0: Aspertia and Floccesy (needs nothing) | — | [Floccesy Town](https://bulbapedia.bulbagarden.net/wiki/Floccesy_Town) |
| Giant Chasm | 8: Humilau City (needs ['Legend', 'opelucid-plasma']) | — | [Giant Chasm](https://bulbapedia.bulbagarden.net/wiki/Giant_Chasm) |
| Giant Chasm Forest | 8: Humilau City (needs ['Legend', 'opelucid-plasma']) | frigate-seaside | [Giant Chasm](https://bulbapedia.bulbagarden.net/wiki/Giant_Chasm) |
| Giant Chasm Forest Cave | 8: Humilau City (needs ['Legend', 'opelucid-plasma']) | frigate-seaside | [Giant Chasm](https://bulbapedia.bulbagarden.net/wiki/Giant_Chasm) |
| Giant Chasm Hidden Grotto | 8: Humilau City (needs ['Legend', 'opelucid-plasma']) | frigate-seaside | [Giant Chasm](https://bulbapedia.bulbagarden.net/wiki/Giant_Chasm) |
| Giant Chasm Outside | 8: Humilau City (needs ['Legend', 'opelucid-plasma']) | — | [Giant Chasm](https://bulbapedia.bulbagarden.net/wiki/Giant_Chasm) |
| Glacier Room | 10: Postgame Unova (needs ['Elite Four']) | surf, strength, iceberg-key-active | [Underground Ruins](https://bulbapedia.bulbagarden.net/wiki/Underground_Ruins) |
| Guidance Chamber | 6: Chargestone and Mistralton (needs ['frigate-driftveil']) | surf, strength | [Mistralton Cave](https://bulbapedia.bulbagarden.net/wiki/Mistralton_Cave) |
| Humilau City | 8: Humilau City (needs ['Legend', 'opelucid-plasma']) | — | [Humilau City](https://bulbapedia.bulbagarden.net/wiki/Humilau_City) |
| Icirrus City | 10: Postgame Unova (needs ['Elite Four']) | — | [Icirrus City](https://bulbapedia.bulbagarden.net/wiki/Icirrus_City) |
| Iron Room | 10: Postgame Unova (needs ['Elite Four']) | surf, strength, iron-key-active | [Underground Ruins](https://bulbapedia.bulbagarden.net/wiki/Underground_Ruins) |
| Lostlorn Forest | 3: The desert and Nimbasa (needs ['Insect', 'clear-route-four']) | — | [Lostlorn Forest](https://bulbapedia.bulbagarden.net/wiki/Lostlorn_Forest) |
| Lostlorn Forest Hidden Grotto | 3: The desert and Nimbasa (needs ['Insect', 'clear-route-four']) | — | [Lostlorn Forest](https://bulbapedia.bulbagarden.net/wiki/Lostlorn_Forest) |
| Marvelous Bridge | 10: Postgame Unova (needs ['Elite Four']) | — | [Marvelous Bridge](https://bulbapedia.bulbagarden.net/wiki/Marvelous_Bridge) |
| Mistralton Cave | 6: Chargestone and Mistralton (needs ['frigate-driftveil']) | surf | [Mistralton Cave](https://bulbapedia.bulbagarden.net/wiki/Mistralton_Cave) |
| Moor Of Icirrus | 10: Postgame Unova (needs ['Elite Four']) | — | [Moor of Icirrus](https://bulbapedia.bulbagarden.net/wiki/Moor_of_Icirrus) |
| Nacrene City Nacrene Museum | 10: Postgame Unova (needs ['Elite Four']) | — | [Nacrene City](https://bulbapedia.bulbagarden.net/wiki/Nacrene_City) |
| Nacrene City West Gate | 10: Postgame Unova (needs ['Elite Four']) | — | [Nacrene City](https://bulbapedia.bulbagarden.net/wiki/Nacrene_City) |
| Nature Sanctuary | 11: Nature Preserve (needs ['nature-permit']) | — | [Nature Preserve](https://bulbapedia.bulbagarden.net/wiki/Nature_Preserve) |
| P2 Laboratory | 10: Postgame Unova (needs ['Elite Four']) | surf | [P2 Laboratory](https://bulbapedia.bulbagarden.net/wiki/P2_Laboratory) |
| Pinwheel Forest Hidden Grotto Inner | 10: Postgame Unova (needs ['Elite Four']) | surf | [Pinwheel Forest](https://bulbapedia.bulbagarden.net/wiki/Pinwheel_Forest) |
| Pinwheel Forest Hidden Grotto Outer | 10: Postgame Unova (needs ['Elite Four']) | — | [Pinwheel Forest](https://bulbapedia.bulbagarden.net/wiki/Pinwheel_Forest) |
| Pinwheel Forest Inside | 10: Postgame Unova (needs ['Elite Four']) | — | [Pinwheel Forest](https://bulbapedia.bulbagarden.net/wiki/Pinwheel_Forest) |
| Pinwheel Forest Outside | 10: Postgame Unova (needs ['Elite Four']) | — | [Pinwheel Forest](https://bulbapedia.bulbagarden.net/wiki/Pinwheel_Forest) |
| Relic Castle A | 3: The desert and Nimbasa (needs ['Insect', 'clear-route-four']) | — | [Relic Castle](https://bulbapedia.bulbagarden.net/wiki/Relic_Castle) |
| Relic Castle C | 5: Relic Passage (needs ['Quake']) | strength | [Relic Castle](https://bulbapedia.bulbagarden.net/wiki/Relic_Castle) |
| Relic Castle D | 5: Relic Passage (needs ['Quake']) | strength | [Relic Castle](https://bulbapedia.bulbagarden.net/wiki/Relic_Castle) |
| Relic Passage Castelia Sewers Entrance | 2: Castelia City (needs ['Toxic', 'sail-castelia']) | — | [Relic Passage](https://bulbapedia.bulbagarden.net/wiki/Relic_Passage) |
| Relic Passage Pwt Entrance | 5: Relic Passage (needs ['Quake']) | — | [Relic Passage](https://bulbapedia.bulbagarden.net/wiki/Relic_Passage) |
| Relic Passage Relic Castle Entrance | 5: Relic Passage (needs ['Quake']) | strength | [Relic Passage](https://bulbapedia.bulbagarden.net/wiki/Relic_Passage) |
| Reversal Mountain B1F | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 48 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 49 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 50 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 51 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 52 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 53 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 54 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 55 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 56 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 57 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 58 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 59 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Reversal Mountain Unknown Area 60 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Reversal Mountain](https://bulbapedia.bulbagarden.net/wiki/Reversal_Mountain) |
| Rocky Mountain Room | 10: Postgame Unova (needs ['Elite Four']) | surf, strength, ruins-switch | [Underground Ruins](https://bulbapedia.bulbagarden.net/wiki/Underground_Ruins) |
| Seaside Cave 1F | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | surf, opelucid-plasma | [Seaside Cave](https://bulbapedia.bulbagarden.net/wiki/Seaside_Cave) |
| Seaside Cave B1F | 8: Humilau City (needs ['Legend', 'opelucid-plasma']) | surf, opelucid-plasma | [Seaside Cave](https://bulbapedia.bulbagarden.net/wiki/Seaside_Cave) |
| Strange House 1F | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Strange House](https://bulbapedia.bulbagarden.net/wiki/Strange_House) |
| Strange House B1F | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Strange House](https://bulbapedia.bulbagarden.net/wiki/Strange_House) |
| Striaton City | 10: Postgame Unova (needs ['Elite Four']) | — | [Striaton City](https://bulbapedia.bulbagarden.net/wiki/Striaton_City) |
| Twist Mountain B1F 3F | 10: Postgame Unova (needs ['Elite Four']) | — | [Twist Mountain](https://bulbapedia.bulbagarden.net/wiki/Twist_Mountain) |
| Twist Mountain B4F | 10: Postgame Unova (needs ['Elite Four']) | — | [Twist Mountain](https://bulbapedia.bulbagarden.net/wiki/Twist_Mountain) |
| Undella Bay | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Undella Bay](https://bulbapedia.bulbagarden.net/wiki/Undella_Bay) |
| Undella Town | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Undella Town](https://bulbapedia.bulbagarden.net/wiki/Undella_Town) |
| Underground Ruins | 10: Postgame Unova (needs ['Elite Four']) | surf, strength | [Underground Ruins](https://bulbapedia.bulbagarden.net/wiki/Underground_Ruins) |
| Unova Route 1 | 10: Postgame Unova (needs ['Elite Four']) | — | [Unova Route 1](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_1) |
| Unova Route 11 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Unova Route 11](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_11) |
| Unova Route 12 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Unova Route 12](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_12) |
| Unova Route 13 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Unova Route 13](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_13) |
| Unova Route 13 Hidden Grotto Giant Chasm | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Unova Route 13](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_13) |
| Unova Route 13 Hidden Grotto Stairs | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Unova Route 13](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_13) |
| Unova Route 14 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Unova Route 14](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_14) |
| Unova Route 15 | 10: Postgame Unova (needs ['Elite Four']) | — | [Unova Route 15](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_15) |
| Unova Route 16 | 3: The desert and Nimbasa (needs ['Insect', 'clear-route-four']) | — | [Unova Route 16](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_16) |
| Unova Route 17 | 10: Postgame Unova (needs ['Elite Four']) | surf | [Unova Route 17](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_17) |
| Unova Route 18 | 10: Postgame Unova (needs ['Elite Four']) | surf | [Unova Route 18](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_18) |
| Unova Route 18 Hidden Grotto | 10: Postgame Unova (needs ['Elite Four']) | surf | [Unova Route 18](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_18) |
| Unova Route 19 | 0: Aspertia and Floccesy (needs nothing) | — | [Unova Route 19](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_19) |
| Unova Route 2 | 10: Postgame Unova (needs ['Elite Four']) | — | [Unova Route 2](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_2) |
| Unova Route 2 Hidden Grotto | 10: Postgame Unova (needs ['Elite Four']) | — | [Unova Route 2](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_2) |
| Unova Route 20 | 0: Aspertia and Floccesy (needs nothing) | — | [Unova Route 20](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_20) |
| Unova Route 21 | 8: Humilau City (needs ['Legend', 'opelucid-plasma']) | surf | [Unova Route 21](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_21) |
| Unova Route 22 | 8: Humilau City (needs ['Legend', 'opelucid-plasma']) | — | [Unova Route 22](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_22) |
| Unova Route 22 Hidden Grotto | 8: Humilau City (needs ['Legend', 'opelucid-plasma']) | — | [Unova Route 22](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_22) |
| Unova Route 23 | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Unova Route 23](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_23) |
| Unova Route 23 Hidden Grotto | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Unova Route 23](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_23) |
| Unova Route 3 | 10: Postgame Unova (needs ['Elite Four']) | — | [Unova Route 3](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_3) |
| Unova Route 3 Hidden Grotto Dark Grass | 10: Postgame Unova (needs ['Elite Four']) | — | [Unova Route 3](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_3) |
| Unova Route 3 Hidden Grotto Pond | 10: Postgame Unova (needs ['Elite Four']) | surf | [Unova Route 3](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_3) |
| Unova Route 4 | 3: The desert and Nimbasa (needs ['Insect', 'clear-route-four']) | — | [Unova Route 4](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_4) |
| Unova Route 5 | 3: The desert and Nimbasa (needs ['Insect', 'clear-route-four']) | — | [Unova Route 5](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_5) |
| Unova Route 5 Hidden Grotto | 3: The desert and Nimbasa (needs ['Insect', 'clear-route-four']) | — | [Unova Route 5](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_5) |
| Unova Route 6 | 4: Driftveil City (needs ['Bolt', 'cross-drawbridge']) | — | [Unova Route 6](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_6) |
| Unova Route 6 Hidden Grotto Mistralton Cave | 4: Driftveil City (needs ['Bolt', 'cross-drawbridge']) | surf | [Unova Route 6](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_6) |
| Unova Route 6 Hidden Grotto Near Pokemon Breeder | 4: Driftveil City (needs ['Bolt', 'cross-drawbridge']) | — | [Unova Route 6](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_6) |
| Unova Route 6 Weather Institute | 4: Driftveil City (needs ['Bolt', 'cross-drawbridge']) | — | [Unova Route 6](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_6) |
| Unova Route 7 | 6: Chargestone and Mistralton (needs ['frigate-driftveil']) | — | [Unova Route 7](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_7) |
| Unova Route 7 Hidden Grotto | 6: Chargestone and Mistralton (needs ['frigate-driftveil']) | — | [Unova Route 7](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_7) |
| Unova Route 8 | 10: Postgame Unova (needs ['Elite Four']) | — | [Unova Route 8](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_8) |
| Unova Route 9 | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Unova Route 9](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_9) |
| Unova Route 9 Hidden Grotto | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Unova Route 9](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_9) |
| Unova Victory Road 2 Unknown Area 71 | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Victory Road (Black 2 and White 2)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_2_and_White_2)) |
| Unova Victory Road 2 Unknown Area 72 | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Victory Road (Black 2 and White 2)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_2_and_White_2)) |
| Unova Victory Road 2 Unknown Area 73 | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Victory Road (Black 2 and White 2)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_2_and_White_2)) |
| Unova Victory Road 2 Unknown Area 74 | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Victory Road (Black 2 and White 2)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_2_and_White_2)) |
| Unova Victory Road 2 Unknown Area 75 | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Victory Road (Black 2 and White 2)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_2_and_White_2)) |
| Unova Victory Road 2 Unknown Area 76 | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Victory Road (Black 2 and White 2)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_2_and_White_2)) |
| Unova Victory Road 2 Unknown Area 77 | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Victory Road (Black 2 and White 2)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_2_and_White_2)) |
| Unova Victory Road 2 Unknown Area 78 | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Victory Road (Black 2 and White 2)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_2_and_White_2)) |
| Unova Victory Road 2 Unknown Area 79 | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Victory Road (Black 2 and White 2)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_2_and_White_2)) |
| Unova Victory Road 2 Unknown Area 80 | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Victory Road (Black 2 and White 2)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_2_and_White_2)) |
| Unova Victory Road 7F | 9: The Pokémon League (needs ['defeat-ghetsis']) | — | [Victory Road (Black 2 and White 2)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_2_and_White_2)) |
| Village Bridge | 7: Eastern Unova (needs ['Jet', 'fly-lentimas']) | — | [Village Bridge](https://bulbapedia.bulbagarden.net/wiki/Village_Bridge) |
| Virbank City | 1: Virbank City (needs ['Basic']) | — | [Virbank City](https://bulbapedia.bulbagarden.net/wiki/Virbank_City) |
| Virbank Complex Inner | 1: Virbank City (needs ['Basic']) | — | [Virbank Complex](https://bulbapedia.bulbagarden.net/wiki/Virbank_Complex) |
| Virbank Complex Outer | 1: Virbank City (needs ['Basic']) | — | [Virbank Complex](https://bulbapedia.bulbagarden.net/wiki/Virbank_Complex) |
| Wellspring Cave | 10: Postgame Unova (needs ['Elite Four']) | — | [Wellspring Cave](https://bulbapedia.bulbagarden.net/wiki/Wellspring_Cave) |
