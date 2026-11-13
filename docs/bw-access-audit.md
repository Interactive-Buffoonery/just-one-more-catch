# Black and White access review handoff

Implementation source review with three independent-review findings verified
against the cached pages and corrected.
Generated reviewer input: `python3 scripts/access_audit.py areas bw`.
All 87 retained areas resolve to supplied cached location pages. No browser,
map collision simulation, cartridge or emulator proof is claimed.

Implementation validation: `pnpm check`, `pnpm build`, `pnpm test:convex`
(88 tests), `python3 scripts/check_bw.py` and `node scripts/check_bw.mjs` pass. All eight
existing pack outputs were rebuilt and remain byte-identical; existing
sprite-fit entries also remain unchanged. Save-file import is not enabled.

Review corrections: Route 9 additionally requires Lenora's Light Stone/Dark
Stone (Route 8 bridge blocker; walkthrough part 10). Black Landorus drops the
incorrect deferred-catch condition and retains the party/Surf/Waterfall gates.
Dreamyard dark grass and B1F require the postgame without Cut; the fence gap
bypasses the tree. Cut remains on the aboveground ruins grass rows. The duplicate
aboveground Musharna static is dropped. Regression checks cover all three corrections.

The chapter and exception evidence is in `data/bw.json` and `SOURCES.md`.
Unresolved Victory Road labels, combined cave tables and missing acquisition
methods are listed in `OPEN_QUESTIONS.md`. No terrain requirement was invented
for an unknown room. This table records the source work list for the reviewer;
it is not 87 independent access approvals.

| PokeAPI area | Chapter | Location source | Review follow-up |
| --- | --- | --- | --- |
| Abundant Shrine | 12 | [Abundant Shrine](https://bulbapedia.bulbagarden.net/wiki/Abundant_Shrine) | Check earliest encounter tile |
| Castelia City Game Freak Hq 1F | 2 | [Castelia City](https://bulbapedia.bulbagarden.net/wiki/Castelia_City) | Check earliest encounter tile |
| Celestial Tower 2F | 5 | [Celestial Tower](https://bulbapedia.bulbagarden.net/wiki/Celestial_Tower) | Check earliest encounter tile |
| Celestial Tower 3F | 5 | [Celestial Tower](https://bulbapedia.bulbagarden.net/wiki/Celestial_Tower) | Check earliest encounter tile |
| Celestial Tower 4F | 5 | [Celestial Tower](https://bulbapedia.bulbagarden.net/wiki/Celestial_Tower) | Check earliest encounter tile |
| Celestial Tower 5F | 5 | [Celestial Tower](https://bulbapedia.bulbagarden.net/wiki/Celestial_Tower) | Check earliest encounter tile |
| Challengers Cave 1F | 12 | [Challenger's Cave](https://bulbapedia.bulbagarden.net/wiki/Challenger's_Cave) | Check earliest encounter tile |
| Challengers Cave B1F | 12 | [Challenger's Cave](https://bulbapedia.bulbagarden.net/wiki/Challenger's_Cave) | Check earliest encounter tile |
| Challengers Cave B2F | 12 | [Challenger's Cave](https://bulbapedia.bulbagarden.net/wiki/Challenger's_Cave) | Check earliest encounter tile |
| Chargestone Cave 1F | 5 | [Chargestone Cave](https://bulbapedia.bulbagarden.net/wiki/Chargestone_Cave) | Check earliest encounter tile |
| Chargestone Cave B1F | 5 | [Chargestone Cave](https://bulbapedia.bulbagarden.net/wiki/Chargestone_Cave) | Check earliest encounter tile |
| Chargestone Cave B2F | 5 | [Chargestone Cave](https://bulbapedia.bulbagarden.net/wiki/Chargestone_Cave) | Check earliest encounter tile |
| Cold Storage | 4 | [Cold Storage](https://bulbapedia.bulbagarden.net/wiki/Cold_Storage) | Check earliest encounter tile |
| Desert Resort | 3 | [Desert Resort](https://bulbapedia.bulbagarden.net/wiki/Desert_Resort) | Check earliest encounter tile |
| Desert Resort Entrance | 3 | [Desert Resort](https://bulbapedia.bulbagarden.net/wiki/Desert_Resort) | Check earliest encounter tile |
| Dragonspiral Tower 1F | 8 | [Dragonspiral Tower](https://bulbapedia.bulbagarden.net/wiki/Dragonspiral_Tower) | Entrance vs Freeze ramp; deferred dragon |
| Dragonspiral Tower 2F | 8 | [Dragonspiral Tower](https://bulbapedia.bulbagarden.net/wiki/Dragonspiral_Tower) | Entrance vs Freeze ramp; deferred dragon |
| Dragonspiral Tower 7F | 8 | [Dragonspiral Tower](https://bulbapedia.bulbagarden.net/wiki/Dragonspiral_Tower) | Entrance vs Freeze ramp; deferred dragon |
| Dragonspiral Tower Entrance | 7 | [Dragonspiral Tower](https://bulbapedia.bulbagarden.net/wiki/Dragonspiral_Tower) | Entrance vs Freeze ramp; deferred dragon |
| Dragonspiral Tower Outside | 8 | [Dragonspiral Tower](https://bulbapedia.bulbagarden.net/wiki/Dragonspiral_Tower) | Entrance vs Freeze ramp; deferred dragon |
| Dreamyard | 0 | [Dreamyard](https://bulbapedia.bulbagarden.net/wiki/Dreamyard) | Cut vs gift; dark grass/postgame; Friday static |
| Dreamyard B1F | 0 | [Dreamyard](https://bulbapedia.bulbagarden.net/wiki/Dreamyard) | Cut vs gift; dark grass/postgame; Friday static |
| Driftveil City | 4 | [Driftveil City](https://bulbapedia.bulbagarden.net/wiki/Driftveil_City) | Check earliest encounter tile |
| Driftveil Drawbridge | 4 | [Driftveil Drawbridge](https://bulbapedia.bulbagarden.net/wiki/Driftveil_Drawbridge) | Check earliest encounter tile |
| Giant Chasm | 12 | [Giant Chasm](https://bulbapedia.bulbagarden.net/wiki/Giant_Chasm) | Check earliest encounter tile |
| Giant Chasm Forest | 12 | [Giant Chasm](https://bulbapedia.bulbagarden.net/wiki/Giant_Chasm) | Check earliest encounter tile |
| Giant Chasm Forest Cave | 12 | [Giant Chasm](https://bulbapedia.bulbagarden.net/wiki/Giant_Chasm) | Check earliest encounter tile |
| Giant Chasm Outside | 12 | [Giant Chasm](https://bulbapedia.bulbagarden.net/wiki/Giant_Chasm) | Check earliest encounter tile |
| Guidance Chamber | 6 | [Mistralton Cave](https://bulbapedia.bulbagarden.net/wiki/Mistralton_Cave) | Strength and Cobalion exceptions |
| Icirrus City | 7 | [Icirrus City](https://bulbapedia.bulbagarden.net/wiki/Icirrus_City) | Check earliest encounter tile |
| Liberty Garden Lighthouse Basement | 2 | [Liberty Garden](https://bulbapedia.bulbagarden.net/wiki/Liberty_Garden) | Check earliest encounter tile |
| Lostlorn Forest | 3 | [Lostlorn Forest](https://bulbapedia.bulbagarden.net/wiki/Lostlorn_Forest) | Check earliest encounter tile |
| Marvelous Bridge | 12 | [Marvelous Bridge](https://bulbapedia.bulbagarden.net/wiki/Marvelous_Bridge) | Check earliest encounter tile |
| Mistralton Cave | 6 | [Mistralton Cave](https://bulbapedia.bulbagarden.net/wiki/Mistralton_Cave) | Strength and Cobalion exceptions |
| Moor Of Icirrus | 7 | [Moor of Icirrus](https://bulbapedia.bulbagarden.net/wiki/Moor_of_Icirrus) | Check earliest encounter tile |
| Nacrene City Nacrene Museum | 1 | [Nacrene City](https://bulbapedia.bulbagarden.net/wiki/Nacrene_City) | Check earliest encounter tile |
| Ns Castle Throne Room | 11 | [N's Castle](https://bulbapedia.bulbagarden.net/wiki/N's_Castle) | Check earliest encounter tile |
| Nuvema Town | 0 | [Nuvema Town](https://bulbapedia.bulbagarden.net/wiki/Nuvema_Town) | Check earliest encounter tile |
| P2 Laboratory | 6 | [P2 Laboratory](https://bulbapedia.bulbagarden.net/wiki/P2_Laboratory) | Check earliest encounter tile |
| Pinwheel Forest Inside | 2 | [Pinwheel Forest](https://bulbapedia.bulbagarden.net/wiki/Pinwheel_Forest) | Check earliest encounter tile |
| Pinwheel Forest Outside | 1 | [Pinwheel Forest](https://bulbapedia.bulbagarden.net/wiki/Pinwheel_Forest) | Check earliest encounter tile |
| Pinwheel Forest Rumination Field | 6 | [Pinwheel Forest](https://bulbapedia.bulbagarden.net/wiki/Pinwheel_Forest) | Check earliest encounter tile |
| Relic Castle A | 3 | [Relic Castle](https://bulbapedia.bulbagarden.net/wiki/Relic_Castle) | Letter/table mapping and story unlock |
| Relic Castle B | 9 | [Relic Castle](https://bulbapedia.bulbagarden.net/wiki/Relic_Castle) | Letter/table mapping and story unlock |
| Relic Castle C | 12 | [Relic Castle](https://bulbapedia.bulbagarden.net/wiki/Relic_Castle) | Letter/table mapping and story unlock |
| Relic Castle D | 12 | [Relic Castle](https://bulbapedia.bulbagarden.net/wiki/Relic_Castle) | Letter/table mapping and story unlock |
| Striaton City | 0 | [Striaton City](https://bulbapedia.bulbagarden.net/wiki/Striaton_City) | Check earliest encounter tile |
| Trial Chamber | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Strength and Cobalion exceptions |
| Twist Mountain B1F 3F | 7 | [Twist Mountain](https://bulbapedia.bulbagarden.net/wiki/Twist_Mountain) | Unresolved room / combined-table mapping |
| Undella Bay | 12 | [Undella Bay](https://bulbapedia.bulbagarden.net/wiki/Undella_Bay) | Check earliest encounter tile |
| Undella Town | 12 | [Undella Town](https://bulbapedia.bulbagarden.net/wiki/Undella_Town) | Check earliest encounter tile |
| Unova Route 1 | 0 | [Unova Route 1](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_1) | Check earliest encounter tile |
| Unova Route 10 | 10 | [Unova Route 10](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_10) | Check earliest encounter tile |
| Unova Route 10 Victory Road Gate | 10 | [Unova Route 10](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_10) | Check earliest encounter tile |
| Unova Route 11 | 12 | [Unova Route 11](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_11) | Check earliest encounter tile |
| Unova Route 12 | 12 | [Unova Route 12](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_12) | Check earliest encounter tile |
| Unova Route 13 | 12 | [Unova Route 13](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_13) | Check earliest encounter tile |
| Unova Route 14 | 12 | [Unova Route 14](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_14) | Check earliest encounter tile |
| Unova Route 15 | 12 | [Unova Route 15](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_15) | Check earliest encounter tile |
| Unova Route 16 | 3 | [Unova Route 16](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_16) | Check earliest encounter tile |
| Unova Route 17 | 6 | [Unova Route 17](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_17) | Check earliest encounter tile |
| Unova Route 18 | 6 | [Unova Route 18](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_18) | Check earliest encounter tile |
| Unova Route 2 | 0 | [Unova Route 2](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_2) | Check earliest encounter tile |
| Unova Route 3 | 1 | [Unova Route 3](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_3) | Check earliest encounter tile |
| Unova Route 4 | 3 | [Unova Route 4](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_4) | Check earliest encounter tile |
| Unova Route 5 | 3 | [Unova Route 5](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_5) | Check earliest encounter tile |
| Unova Route 6 | 4 | [Unova Route 6](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_6) | Check earliest encounter tile |
| Unova Route 7 | 5 | [Unova Route 7](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_7) | Check earliest encounter tile |
| Unova Route 8 | 7 | [Unova Route 8](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_8) | Check earliest encounter tile |
| Unova Route 9 | 9 | [Unova Route 9](https://bulbapedia.bulbagarden.net/wiki/Unova_Route_9) | Check earliest encounter tile |
| Unova Victory Road 1F Unknown Room | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road 4F Middle Room | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Check earliest encounter tile |
| Unova Victory Road Outside | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Check earliest encounter tile |
| Unova Victory Road Unknown Area 53 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road Unknown Area 54 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road Unknown Area 55 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road Unknown Area 57 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road Unknown Area 59 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road Unknown Area 60 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road Unknown Area 61 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road Unknown Area 62 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road Unknown Area 63 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road Unknown Area 64 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road Unknown Area 65 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Unova Victory Road Unknown Area 66 | 10 | [Victory Road (Black and White)](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Black_and_White)) | Unresolved room / combined-table mapping |
| Village Bridge | 12 | [Village Bridge](https://bulbapedia.bulbagarden.net/wiki/Village_Bridge) | Check earliest encounter tile |
| Wellspring Cave | 1 | [Wellspring Cave](https://bulbapedia.bulbagarden.net/wiki/Wellspring_Cave) | Unresolved room / combined-table mapping |
