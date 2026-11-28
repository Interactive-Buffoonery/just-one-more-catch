# Crystal (`crystal`)

## Sources

- https://bulbapedia.bulbagarden.net/wiki/Appendix:Crystal_walkthrough
- https://strategywiki.org/wiki/Pok%C3%A9mon_Crystal
- Nintendo Power Pokemon Crystal guide (2001): `(Nintendo Power 2001) - Pokemon Crystal_text.pdf`
- Sudowoodo on Route 36 needs only the SquirtBottle, because the flower shop checks the Plain Badge before giving it: https://github.com/pret/pokecrystal/blob/9ce4c4e5068ffdf56e23ca3d8dc9178b2465d482/maps/GoldenrodFlowerShop.asm#L13-L26

### Crystal static map traces

Traced original Crystal at pret/pokecrystal commit
`3c813b0b4d82b39bf62185aceffb76fd6026c70b` with a scratch Python BFS
(`python3 -I`); no ROM, build or gameplay. Decoded `.blk` metatile IDs to
four collision squares each, map dimensions, warp destinations, directional
walls/ledges, forced downward cave exits/waterfalls, sliding ice and object
coordinates. These map groups have no edge connections. Ordinary objects
were blocked at their listed positions; Strength boulders were not moved.
Ice B2F's four boulders were absent before their B1F fall events. Puzzle
chambers' optional doors were allowed as an overestimate for the Ruins
negative test; the successful grass path never enters those chambers.
Coordinates below are zero-based player-tile coordinates.

- Movement rules: [collision permissions](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/data/collision/collision_permissions.asm),
  [directional walls](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/home/map.asm#L1511-L1666),
  [forced movement and ledges](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/engine/overworld/player_movement.asm#L113-L231),
  [ledge jump](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/engine/overworld/player_movement.asm#L353-L391),
  [encounter eligibility](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/engine/overworld/events.asm#L1176-L1194)
  excludes ice from cave encounters. Tileset collision tables used:
  [Johto](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/data/tilesets/johto_collision.asm),
  [cave](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/data/tilesets/cave_collision.asm),
  [dark cave](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/data/tilesets/dark_cave_collision.asm),
  [ice path](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/data/tilesets/ice_path_collision.asm).
- **Ruins of Alph Outside:** starting separately at the Route 36 gate
  (7,5), Route 32 gates (13,20)/(13,21), and Union Cave's Route 32/33
  entrances, no grass is reachable without Surf. This remains true when
  ordinary NPC/item obstacles are removed. With Surf, all 12 grass squares
  are reachable, including (0,20): Union Cave 1F ladder (5,19) -> B1F
  (7,19) -> exit (3,3) -> Outside (6,19). The boulder at B1F (7,10)
  stays fixed; the second exit (3,11) is unnecessary. Natu, Smeargle,
  walking Wooper and walking Quagsire therefore require Surf, not Strength.
  Four fishing-shore squares, including (6,6), are reachable without Surf;
  rod rows retain their existing gates. Decoded
  [Outside blocks](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/RuinsOfAlphOutside.blk),
  [1F blocks](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/UnionCave1F.blk),
  [B1F blocks](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/UnionCaveB1F.blk);
  [1F entrances](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/UnionCave1F.asm#L203-L207),
  [B1F exits and boulder](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/UnionCaveB1F.asm#L156-L174),
  [Outside warps](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/RuinsOfAlphOutside.asm#L284-L295).
  Agrees with https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Alph
  (Research Center chambers): "The upper-left entrance 1 is accessible
  only from the basement of [[Union Cave]], which requires {{m|Surf}} to
  navigate."
- **Ice Path B2F:** from Route 44 through 1F/B1F, the Mahogany-side
  ladder (17,1) and 36 non-ice floor squares on B2F are reachable with
  no Strength and no fallen boulders. This includes floor (0,1).
  Both B2F sides use identical encounter tables, so the combined PokeAPI
  B2F rows need no Strength gate. The B3F ladder (9,11) is unreachable
  in that state; placing the four fallen boulders makes it reachable,
  preserving the existing B3F gate. Decoded
  [1F](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/IcePath1F.blk),
  [B1F](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/IcePathB1F.blk),
  [B2F](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/IcePathB2FMahoganySide.blk);
  [fall-event scripts](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/IcePathB1F.asm#L20-L46),
  [B2F objects](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/IcePathB2FMahoganySide.asm#L33-L53),
  [matching B2F tables](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/data/wild/johto_grass.asm#L761-L815).
- **Whirl Islands:** searched each of the NW/NE/SW/SE entrances with
  Surf, fixed boulders and no Waterfall. NE reaches B1F (35,3), its
  ladder (25,21) to B2F (11,5), then descends the waterfall to the Lugia
  chamber entrance (7,25). B2F has reachable cave floor, water and fishing
  shore; Lugia's chamber has floor (8,12), water and fishing shore.
  NW also reaches B2F's separate ledge at (7,11); SW/SE alone reach
  the southern B1F section. No whole-floor Waterfall gate is appropriate.
  Decoded [NE blocks](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/WhirlIslandNE.blk),
  [B1F blocks](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/WhirlIslandB1F.blk),
  [B2F blocks](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/WhirlIslandB2F.blk),
  [chamber blocks](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/WhirlIslandLugiaChamber.blk);
  [B1F warps](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/WhirlIslandB1F.asm#L44-L53),
  [B2F warps](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/WhirlIslandB2F.asm#L23-L28).
- **Mt. Silver:** from Room 1's outdoor entrance (9,33), the trace reaches
  Room 2 (17,31), Room 3 (9,33) and ordinary encounter floor in all three
  without Surf or Waterfall. Room 2 has 15 reachable fishing-shore squares
  without Surf; Surf opens its ordinary water. The two item-room doors
  (13,21)/(23,3) remain inaccessible with Surf alone, and open with Surf
  plus Waterfall. PokeAPI has no separate item-room area here; retain the
  existing main-floor gates. Decoded
  [Room 1](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/SilverCaveRoom1.blk),
  [Room 2](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/SilverCaveRoom2.blk),
  [Room 3](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/SilverCaveRoom3.blk),
  [item-room blocks](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/SilverCaveItemRooms.blk);
  [Room 2 warps](https://github.com/pret/pokecrystal/blob/3c813b0b4d82b39bf62185aceffb76fd6026c70b/maps/SilverCaveRoom2.asm#L26-L33).

Sanity checks: Union Cave B2F cannot be reached from either outdoor cave
entrance without Surf, and is reached with Surf, agreeing with the existing
sourced gate. Ice Path B3F is unreachable before the boulders fall and
reachable afterward, agreeing with the Nintendo Power p58 gate above.
These are static map checks, not cartridge/emulator verification.


## Open questions

None right now.

## PokeAPI refresh, 2026-11-28

Refreshed the full cached API snapshot from PokeAPI/api-data commit
`c0b639fa76e4a17054cacbac47f2e6b3ca0e9505` and rebuilt all 16 packs.
Corrected Route 13 time conditions and rates, and consolidated Route 42 Golbat to 15% at night. Levels are unchanged. No species/location/method combination disappeared.
Source: https://github.com/PokeAPI/api-data/tree/c0b639fa76e4a17054cacbac47f2e6b3ca0e9505/data/api/v2/pokemon
