# ORAS save-import fixtures

Opt-in validation of unchanged reader 0.1.3 and the built website. Generated
saves and receipts stay in ignored `.cache/oras-save-tests/`. No personal saves,
ROMs or downloaded fixtures are used.

Use .NET 10 and Core revision `02c9ec108fe3c96735f6c2397eaebc10e29a049f`:

```sh
dotnet run --project scripts/oras-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/oras-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/oras-save-fixtures/verify.mjs
```

Optionally set `CHROMIUM_EXECUTABLE` to an installed Chrome/Chromium executable.
`WORKER_ONLY=1` runs raw/native/published-worker checks without website imports.
The harness blocks external requests and closes its own browser/server.

The generator serializes eight caught/empty saves for OR, AS, X and Y. ORAS
files are 483,328 bytes (`SAV6AO`); XY files are 415,232 bytes (`SAV6XY`). It sets
the BEEF footer required by Core's detector; blank Core saves do not initialize
this metadata. Re-reading requires the exact title, layout class and valid
checksums. Twenty caught species include starter stages, 649/650 and 721.
Inserting then removing each Pokémon leaves empty party/boxes while retaining
caught history. Seen-only Bulbasaur, Ivysaur and Venusaur exercise female,
shiny male and shiny female regions. These are structural parser fixtures,
not in-game exports or proof of a legitimate in-game zero-caught save.

The independent raw checker reads caught bits at dex + `0x8` and unions seen
regions at `0x68`, `0xC8`, `0x128`, `0x188`. Both layouts have dex at `0x15000`
and title at `0x14004`: X=24, Y=25, AS=26, OR=27. It checks file sizes and
adventure-start seconds at `0x1218`: caught fixtures store `0x12345678` and
empty fixtures store zero. Native, raw bits and published WASM must agree on
exact arrays, individual title and complete `national-dex` coverage. Worker
filenames deliberately do not identify the game. Both populated and zero date
fields must omit `startDate`; Gen VI dates are outside the reader's allowlist.
Zero-filled and truncated files fail. Input buffers and file digests stay intact.

Website checks cover both ORAS titles and empty previews at 390px, selection,
a misleading `.srm` drop, counts, import-day dates, creation/reload,
cancellation, storage failure/retry, duplicate confirmation, navigation and
preparation failure/retry/cancellation. Existing runs stay unchanged and no
uploads occur. All four XY fixtures parse as X/Y and create nothing here.
After integrating PR #111, set `XY_IMPORTS=1` to require creation/reload as
exact `x`/`y` runs instead. Mapping tests reject XY, original RS, Emerald,
combined identities and the other ORAS title as the selected ORAS game.
Receipts are `native-results.json`, `wasm-results.json` and
`website-results.json`.

Pinned Core source references:

- `Saves/SAV6AO.cs`, `SAV6XY.cs`: layouts, National Dex getters and valid titles.
- `Saves/Access/SaveBlockAccessor6AO.cs`, `SaveBlockAccessor6XY.cs`: block offsets.
- `Saves/Substructures/PokeDex/Zukan6.cs`: caught bits and seen regions.
- `Saves/Substructures/Gen6/MyStatus6.cs`: stored title byte.
- `Saves/Substructures/Gen6/GameTime6.cs`: adventure-start field at `0x18`.
- `Saves/Util/SaveUtil.cs`: sizes and BEEF footer detection.

Vendored reader source: `d666c67dc4d6d11603cdf50b13f4c431c0b95668` (0.1.3). No source,
package, lockfile or vendored tarball change is needed. Its regression assets
and SDK output match the installed vendor package byte for byte.
Gen VI recorded dates need separate epoch/calendar, invalid-value, leap-day
and exported-date verification. Real cartridge/emulator exports, a legitimate
in-game zero-caught save, regional/modified/corrupt variants beyond fixtures,
live signed-in imports, encrypted backup extraction, mobile Safari and physical
mobile performance remain separate checks. See `docs/save-import.md` for
expected #111/#107 integration conflicts.
