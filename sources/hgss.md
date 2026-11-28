# HeartGold and SoulSilver (`hgss`)

## Sources

- https://bulbapedia.bulbagarden.net/wiki/Appendix:HeartGold_and_SoulSilver_walkthrough
- https://strategywiki.org/wiki/Pok%C3%A9mon_HeartGold_and_SoulSilver
- Prima HeartGold and SoulSilver Johto guide (2010): `(Prima 2010) - Pokemon HeartGold & SoulSilver - Johto.pdf`
- Prima HeartGold and SoulSilver Kanto guide: `Pokemon HeartGold & SoulSilver Kanto Prima Official Guide_text.pdf`
- Route 44 grass needs Surf: https://bulbapedia.bulbagarden.net/wiki/Johto_Route_44 ("the only patch of straight grass is surrounded by a pair of calm ponds"; Max Revive "in the patch of grass in the middle of the lake (requires Surf)"), Prima p154 ("Between its two lakes, you'll find a patch of tall grass").
- Whirl Islands need no Waterfall: https://bulbapedia.bulbagarden.net/wiki/Whirl_Islands ("doesn't require going through any waterfalls in the first place"), Prima p167 field moves (Whirlpool, Flash, Surf, Strength).
- Tohjo Falls needs only Surf: https://bulbapedia.bulbagarden.net/wiki/Tohjo_Falls (HGSS Moon Stone "On the western end of the ledge behind the waterfalls (requires Surf)"), Prima p170 ("Surf east from New Bark Town ... there's nowhere to go but into Tohjo Falls"), and the whole falls is one map with one encounter table: https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/files/fielddata/encountdata/gs_enc_data.json#L26450 (D45R0101).
- Pupitar on Mt. Silver needs Surf and Waterfall: https://bulbapedia.bulbagarden.net/wiki/Mt._Silver_Cave (Pupitar only in the Expert Belt chamber; Expert Belt "requires Surf and Waterfall"; https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/files/fielddata/encountdata/gs_enc_data.json#L17444-L17531 lists Pupitar only in D41R0104, which https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/include/constants/maps.h#L465 names MAP_MOUNT_SILVER_CAVE_EXPERT_BELT_CHAMBER).
- Safari Zone Desert and Rocky Beach need Baoba's second challenge: https://bulbapedia.bulbagarden.net/wiki/Johto_Safari_Zone ("Six more areas can be added once Baoba's second challenge is assigned"; the default layouts leave out Desert and Rocky Beach); none of the ten default layouts in https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/src/safari_zone.c#L11-L22 use Desert or Rocky Beach, and Baoba sets the second test and turns on the Area Customizer at the Safari Zone entrance in https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/files/fielddata/script/scr_seq/scr_seq_0119_D47R0101.s#L193-L231 ("SANDSHREW will not appear with the current Safari Zone setting").
- Primo's egg codes are already rows with the password condition: https://bulbapedia.bulbagarden.net/wiki/Violet_City ("Egg received from Primo, requires individual code").
- Sudowoodo on Route 36 needs only the SquirtBottle, because the flower shop checks the Plain Badge before giving it: https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/files/fielddata/script/scr_seq/scr_seq_0896_T25R0601.s#L119-L138 (MAP_GOLDENROD_FLOWER_SHOP), and the Route 36 script battles Sudowoodo only with the SquirtBottle: https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/files/fielddata/script/scr_seq/scr_seq_0243_R36.s#L47.


## Open questions

- Ruins of Alph Outside: is the Natu and Smeargle grass reachable on foot? Prima p82 lists only Rock Smash and Surf as field moves and Bulbapedia gates only Union Cave entrance 1 and the Hyper Potion, but neither places the grass itself.

- Route 42: is any grass reachable on foot from Ecruteak or Mahogany? Bulbapedia says Surf is needed to get past the lakes from either end (https://bulbapedia.bulbagarden.net/wiki/Johto_Route_42) but doesn't place the grass, and the Prima p134 map is too small to tell grass from trees.

- Mt. Silver: pret's encounter tables (https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/files/fielddata/encountdata/gs_enc_data.json) match PokeAPI areas by species: 1f is 1F (D41R0101), mountainside is the lower mountainside (D41R0103), 3f is the Expert Belt chamber (D41R0104), 2f is Moltres's chamber (D41R0105), 1f-top is 2F (D41R0106), and 4f and top are 3F (D41R0107) and the upper mountainside (D41R0102), in an order the species can't tell apart. Bulbapedia gates the lower and upper mountainside, 2F and 3F on Rock Climb and the Expert Belt chamber on Surf and Waterfall (https://bulbapedia.bulbagarden.net/wiki/Mt._Silver_Cave). Golduck, Quagsire and Misdreavus appear only behind one of those gates, so they need an either-or gate that the pack cannot express.

- Fuchsia City: are the headbutt trees behind the Cut tree? Bulbapedia says the northern half needs Cut, and the zone has one Cut tree (https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/files/fielddata/eventdata/zone_event/053_T08.json#L98-L103), but tree positions and collision are not in the decompilation.

## PokeAPI refresh, 2026-11-28

Refreshed the full cached API snapshot from PokeAPI/api-data commit
`c0b639fa76e4a17054cacbac47f2e6b3ca0e9505` and rebuilt all 16 packs.
Corrected S.S. Anne Dock swarm conditions for Magikarp and Wingull; split Good Rod Magikarp into 40% ordinary and 25% swarm rows. No species/location/method combination disappeared.
Source: https://github.com/PokeAPI/api-data/tree/c0b639fa76e4a17054cacbac47f2e6b3ca0e9505/data/api/v2/pokemon

Confirmed Vermilion Port (T06) Magikarp and Wingull swarm rows, including Good Rod Magikarp at 40% ordinary plus 25% additional swarm slots, against pret/pokeheartgold `files/fielddata/encountdata/gs_enc_data.json` and `src/field/encounter_check.c` at `6bf138d6035aa6b43d6f8f4132a12df70f86dcec`: https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/files/fielddata/encountdata/gs_enc_data.json and https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/src/field/encounter_check.c#L174-L213.
