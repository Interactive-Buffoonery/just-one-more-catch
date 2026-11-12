# GB/GBC save-reader validation

On 2026-11-12, the website's installed reader 0.1.1 successfully inspected four
public saves and ten controlled synthetic saves through its actual browser
worker/WASM. An independent Python check matched every caught and seen species
against raw saved bitfields, verified checksums and confirmed input bytes stayed
unchanged. A malformed input was rejected as `invalid-save`.

## Public saves

The files came from [PKSav's public test-save collection](https://github.com/ncorgan/pksav-test-saves/tree/e4d42e112cbb03b7e9f9424ab62931f953ef22d8).
Its README explicitly welcomes other users of the saves. Downloads are pinned to
that revision and remain outside Git in `.cache/save-tests/public/`. Only hashes,
counts and provenance are committed in [the receipt](game-boy-save-fixtures.json).
Project Pokémon's base-save listing and download returned HTTP 403; no block was
bypassed and no files from that listing were used.

- Red: 151 caught, 151 seen; detected as ambiguous `RB`, candidates `RD/GN/BU`.
- Yellow: 151 caught, 151 seen; detected as `YW`.
- Gold: 181 caught, 220 seen; detected as ambiguous `GS`, candidates `GD/SI`.
- Crystal: 251 caught, 251 seen; detected as `C` (existing supported game).

The public file names are provenance labels, not reliable version detectors.
There is no separate public Blue or Silver sample in this collection.

## Controlled cases

The generator used PKHeX Core `02c9ec108fe3c96735f6c2397eaebc10e29a049f`,
matching the installed reader's pin. For each of Red, Blue, Yellow, Gold and
Silver it serialized two cases:

- Caught Pikachu and Eevee, then removed them from storage while retaining
  caught flags. Bulbasaur was seen-only. WASM returned exactly caught `[25,133]`
  and seen `[1,25,133]`, with empty party/current box and no occupied boxes in
  the native re-read. This verifies saved history rather than storage scanning.
- Empty caught and seen flags. WASM returned successful empty arrays, not a
  parser failure. These are synthetic structural cases; no legitimate
  pre-starter in-game zero-caught save was obtained.

All GB/GBC cases omitted `startDate`, preserving the import-day fallback.
Red/Blue and Gold/Silver ambiguity survived serialization and WASM parsing.
Yellow's initialized starter marker identified Yellow in these fixtures;
this does not establish identification of every possible pre-starter save.

Fixture generation, the local browser harness and raw verification are retained
under [scripts/save-fixtures](../scripts/save-fixtures/README.md). The raw checker
reads saved bitfields directly instead of calling PKHeX or trusting reported
totals. Offset and checksum references are pinned Core's
`Saves/Substructures/Gen12/SAV1Offsets.cs`, `SAV2Offsets.cs`, `Saves/SAV1.cs`
and `Saves/SAV2.cs`. The shipped reader source is
`5263b86e798e9e189c1d71a127b0192ec4828b88`, with `sourceDirty: false`.

## Scope and remaining work

This is reader-level evidence. Website mappings, Works with copy and import
support for the new packs remain unchanged. These checks do not prove website
file selection, paired-version choice, preview, playthrough creation or live
account persistence for the new games. Follow [the future-game checklist](save-import.md#adding-a-future-official-game)
before advertising support. In particular, obtain a legitimate zero-caught save,
add maintained reader fixture tests, and test exact website mappings while
preserving ambiguous titles. No ROM hack fallback, reader release, deployment
or upstream checkout edit was made.
