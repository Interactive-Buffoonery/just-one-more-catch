# FireRed and LeafGreen (`frlg`)

## Sources

- https://serebii.net/fireredleafgreen/nintendoswitch.shtml — Switch release; Aurora and Mystic Tickets after the Hall of Fame, opening Birth Island and Navel Rock from Vermilion.
- https://www.nintendolife.com/news/2026/02/psa-pokemon-firered-and-leafgreen-switch-version-gives-you-the-mystic-ticket-and-aurora-ticket — confirms automatic tickets and Deoxys, Lugia and Ho-Oh.

- https://bulbapedia.bulbagarden.net/wiki/Appendix:FireRed_and_LeafGreen_walkthrough
- https://strategywiki.org/wiki/Pok%C3%A9mon_FireRed_and_LeafGreen
- No guide PDF yet.
### FRLG static map traces

All pret links below use revision `ce6406d8c2eaf46d543c8a2606de0c3cb1951982`.
These are static source/map traces, not gameplay or Switch runtime evidence.
A scratch Python BFS decoded little-endian map blocks (10-bit metatile,
2-bit collision, 4-bit elevation), 32-bit tileset attributes, directional
collision, one-way ledges, object blockers and badge coordinate triggers.
The two target maps contain no Cut trees or Strength boulders. Guards stay
on their object tiles; missing-badge triggers reject passage. No decomp was
built. Scratch scripts are not included in the pack.

- [Block format](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/include/global.fieldmap.h#L4-L12),
  [attribute masks](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/src/fieldmap.c#L63-L82),
  [tileset attribute paths](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/src/data/tilesets/metatiles.h#L1-L32),
  [collision rules](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/src/event_object_movement.c#L4830-L4917),
  [ledge and elevation rules](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/src/event_object_movement.c#L8303-L8412).
- **Route 23:** [map/guards/warps/connections](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/maps/Route23/map.json),
  [blocks](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/layouts/Route23/map.bin),
  [trigger badge numbers](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/maps/Route23/scripts.inc#L70-L123),
  [badge-check scripts](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/scripts/route23.inc#L115-L208).
  Entry is (8,153), from [Route 22's north gate](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/maps/Route22_NorthEntrance/map.json).
  BFS from gate entrance (7,10) reaches its exit (7,1) with Boulder.
  The direct Route 22 map connection has no mutually passable edge tiles;
  Victory Road warps at (5,28)/(18,28) and the Indigo Plateau connection
  are beyond the southern checkpoints, not independent early entrances.
  With badges through Thunder there is no reachable encounter terrain or
  fishable shore. Rainbow opens three shore edges at y=118, including
  (12,118) facing (12,117). Soul plus Surf reaches 243 water-encounter tiles
  before Marsh. Marsh opens 60 grass tiles (y=61–76), including (18,76),
  before Volcano/Earth. With all badges but no Surf there is still no grass.
  Withholding each of Cascade, Thunder, Rainbow or Marsh separately,
  even granting Surf and all other badges, blocks grass; withholding Volcano
  or Earth does not. All methods therefore need Cascade/Thunder/Rainbow;
  walking rows additionally need Surf/Marsh. The method's existing Surf rule
  supplies Soul for surfing, and the walking Surf need supplies it for grass.
- **S.S. Anne:** [exterior map](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/maps/SSAnne_Exterior/map.json),
  [blocks](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/layouts/SSAnne_Exterior/map.bin).
  No map connections. All three Vermilion warps enter exterior warp 1
  at (32,5); the normal ship exit enters at (32,14). From either, without
  Surf, BFS reaches the same 18 pier tiles and six fishable edges, including
  (31,7) facing (30,7). With Surf, 453 water-encounter tiles are reached.
  Border blocks were decoded and were not treated as entrances. Both versions'
  [encounter tables](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/src/data/wild_encounters.json)
  (`sSSAnneExterior_FireRed` / `sSSAnneExterior_LeafGreen`) supply Tentacool
  in water and version-specific rod encounters; geometry is shared.
  The [captain sets departure scene 1](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/maps/SSAnne_CaptainsOffice/scripts.inc#L4-L23);
  the [exterior runs the cutscene](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/maps/SSAnne_Exterior/scripts.inc#L10-L32),
  and the [dock guard redirects later access](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/maps/VermilionCity/scripts.inc#L190-L217).
  Timing remains in [Open questions](#open-questions); no S.S. Anne rows changed.
- **Sanity check:** the cited engine explicitly requires Soul and Surf for
  [shore-to-water movement](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/src/field_control_avatar.c#L601-L606).
  The BFS reaches zero S.S. Anne water tiles without Surf, then reaches
  water with Surf from the same entrance. The shore test uses the engine's
  [elevation-3 land facing water check](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/src/field_player_avatar.c#L1209-L1226).


## Open questions

- S.S. Anne timing: the static trace proves six fishable pier edges without Surf and reachable water with Surf in both versions. Confirm progression that preserves dock access until each rod/Surf is obtained. The [captain triggers departure](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/maps/SSAnne_CaptainsOffice/scripts.inc#L4-L23); the [dock guard then redirects access](https://github.com/pret/pokefirered/blob/ce6406d8c2eaf46d543c8a2606de0c3cb1951982/data/maps/VermilionCity/scripts.inc#L190-L217). Rows remain unchanged; before-departure availability is not modeled.
