# X/Y save-import fixtures

Opt-in validation of unchanged reader 0.1.2 and the built website. Generated
saves and receipts stay in ignored `.cache/xy-save-tests/`. No personal saves,
ROMs or downloaded fixtures are used.

Use .NET 10 and Core revision `02c9ec108fe3c96735f6c2397eaebc10e29a049f`:

```sh
dotnet run --project scripts/xy-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/xy-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/xy-save-fixtures/verify.mjs
```

Optionally set `CHROMIUM_EXECUTABLE` to an installed Chrome/Chromium executable.
`WORKER_ONLY=1` runs the raw/native/published-worker gate without website imports.
The harness blocks external requests and closes its own browser/server.

The generator serializes four 415,232-byte `SAV6XY` saves: caught and empty
variants for X and Y. It sets the BEEF detection footer required by Core's
serialized detector; blank Core saves do not initialize this metadata. All
serialized block checksums must pass. It inserts and removes 20 species,
including starter stages, 649/650 and 721, retaining caught history with empty
party/boxes. Seen-only Bulbasaur, Ivysaur and Venusaur exercise female and shiny
regions. Native re-reading requires exact identity, class, checksums and flags.
These are redistributable structural parser fixtures, not in-game exports or
proof of a legitimate in-game zero-caught save.

The independent raw checker reads caught bits at dex + `0x8` and unions seen
regions at `0x68`, `0xC8`, `0x128`, `0x188`. The dex block is at `0x15000`;
the stored title byte at `0x14004` is 24 for X and 25 for Y. Native, raw bits
and the published WASM must agree on exact arrays, individual title and complete
`national-dex` coverage. Worker filenames deliberately do not identify the game.
Zero-filled and truncated saves fail. Input buffers and file digests stay intact.

Website checks cover selection, a misleadingly named `.srm` drop, both titles,
both empty previews at 390px, exact counts, creation/reload, cancellation,
import-day fallback, storage failure/retry, duplicate confirmation, navigation,
preparation failure/retry and cancellation during preparation. Existing runs
stay unchanged and no uploads occur. Receipts are `native-results.json`,
`wasm-results.json` and `website-results.json`. Automated import tests separately
cover species limits, retry, unsupported identities and account changes.

Pinned Core source references:

- `Saves/SAV6XY.cs`: layout, caught/seen access and valid titles.
- `Saves/Access/SaveBlockAccessor6XY.cs`: dex/status block offsets.
- `Saves/Substructures/PokeDex/Zukan6.cs`: National Dex bits and seen regions.
- `Saves/Substructures/Gen6/MyStatus6.cs`: stored title byte.
- `Saves/Substructures/Gen6/GameTime6.cs`: adventure-start seconds.
- `Saves/Util/SaveUtil.cs`: size and BEEF footer detection.

Gen VI exposes an adventure-start field, but reader 0.1.2 intentionally omits it.
Caught fixtures populate it and empty fixtures leave it zero; both must omit
`startDate`. Epoch/calendar bounds, invalid values, leap days and exported date
behavior need separate verification before a Gen VI date allowlist is added.

No reader source, package, lockfile or vendored tarball change is needed.
Reader source remains `8cc08fd58b9b148ecba9c9ef262703559e1979e1`.
Permitted real cartridge/emulator exports, a legitimate in-game zero-caught
save, live signed-in imports, encrypted console backup extraction, mobile
Safari and physical mobile performance remain separate checks.
