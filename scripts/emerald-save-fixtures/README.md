# Emerald save-import fixtures

Opt-in validation against the installed reader and a local website build.
Generated saves and reports stay in ignored `.cache/emerald-save-tests/`.
The harness blocks external requests and creates guest playthroughs only.

Use .NET 10 and `PKHeX.Core.dll` built from the installed reader's pinned Core
revision, `02c9ec108fe3c96735f6c2397eaebc10e29a049f`. Set the DLL and Playwright
paths for your machine:

```sh
dotnet run --project scripts/emerald-save-fixtures/Generate.csproj \
  -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
  -- .cache/emerald-save-tests
pnpm build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/emerald-save-fixtures/verify.mjs
```

The generator uses pinned Core's `SAV3E`, sector footers and version-detection
fields. It inserts and removes 14 species from storage, retaining their caught
history, and sets Bulbasaur as seen only. It verifies serialized checksums,
identity, exact flags and empty storage through Core before exporting bytes.
These are synthetic parser fixtures, not evidence of an in-game playthrough.

The checks compare raw National Dex bits in the newest section 0 (`0x28` caught,
`0x5C` seen) with native and published worker results. The rotated fixture has
an older empty Pokédex and a newer populated save in the second slot, with the
sectors rotated three places. The website tests file selection, `.srm` drop,
the preview, creation, reload, cancellation and preserving an existing run.
They include an empty Pokédex at a 390px viewport, a rejected 64 KiB file and
readable Ruby/Sapphire that cannot create an unsupported website playthrough.
They assert unchanged input files/buffers and no upload requests.

Source references at the pinned Core revision:

- `Saves/SAV3.cs`: sector layout, active slot, checksums and National Dex flags.
- `Saves/SAV3E.cs`: Emerald identity and storage blocks.
- `Saves/Util/SaveUtil.cs`: serialized save detection and 128 KiB requirement.
- `Saves/Blocks/Gen3/SaveBlock3SmallE.cs`: Emerald security key.

Reader source is pinned at `5263b86e798e9e189c1d71a127b0192ec4828b88`.
No reader change or new release is needed for the website's Emerald adapter.
The harness writes `native-results.json`, `wasm-results.json` and
`website-results.json` locally. Real player saves, signed-in account imports
and mobile Safari remain separate checks; do not commit personal saves.
