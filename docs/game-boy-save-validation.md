# GB/GBC save import validation

On 2026-11-12, the website's installed reader 0.1.1 successfully inspected four
public saves, ten controlled synthetic saves and one genuine in-game Red save
through its actual browser
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
  parser failure. These are synthetic structural cases, separate from the
  genuine pre-starter save below.

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

## Genuine zero-caught save

Built unmodified English Red from pret/pokered at
`130ac3fa5493fb29a8005e8439fd31b4826e46af` with RGBDS 1.0.4. The ROM's SHA-1
matched the original-source manifest: `ea9bcae617fdf159b045185467ae58b2e4a48b9a`.
PyBoy 2.9.0 ran the game through the introduction into the opening room. The
in-game **Save → Yes** command produced a valid battery save before receiving a
starter, with an empty party and zero caught/seen flags. No memory edits were
used. The saved-game confirmation was inspected. A fresh run of the retained
button script reproduced the save successfully (clock bytes can change hashes).
The actual WASM reader and raw checker accepted the exported cartridge RAM;
the website created and persisted a new Red playthrough with `caught: []`.
ROMs, save files and screenshots stay in the ignored local cache.

## Website and persistence verification

Red, Blue, Yellow, Gold and Silver now have exact website identity adapters and
Works with entries. Green remains unsupported. Red/Blue and Gold/Silver show
explicit paired choices; filenames do not pick a version. The installed reader
0.1.1 already handles these fixtures, so no reader change or release was needed.

The built website passed 15 real-worker/WASM import round trips in Chromium:
ten controlled cases, four public saves and the genuine zero-caught save.
Each checked exact paired choices, preview counts, import-day fallback, existing
run preservation, exact caught state, successful navigation to Dex Caught,
localStorage persistence after reload, unchanged source bytes and no non-GET
requests. Bulbasaur's seen-only flag stayed absent from caught state. The Yellow
controlled case ran at a 390px viewport; Silver's empty case used drag and drop.
Separate browser cases passed cancellation, malformed-file rejection and browser
storage failure followed by successful retry without duplicating the run.

Maintained mapping tests cover exact identities, unsupported Green, loaded-pack
intersection and national caps. Guest and Convex tests cover both nonempty and
empty imports for every new version, preserve an existing run, and verify account
ownership. The complete suite passed 74 tests. These are local guest browser and
simulated-account backend results; live Clerk/Convex, Safari and physical mobile
performance remain unverified. Encounter progression and unresolved gameplay
routes are covered separately in [the access report](game-boy-access-audit.md).

The shared preview snapshot timed out twice; browser verification used the
existing Playwright harness after that failure. No upstream reader checkout was
edited. Nothing was pushed or deployed.
