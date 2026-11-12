# GB/GBC save-reader fixtures

Manual, opt-in reader validation. Downloaded player saves and generated binaries
stay in the ignored `.cache/save-tests/` directory. These tools do not enable
website import or exercise playthrough creation.

1. Download the four public saves from `ncorgan/pksav-test-saves`, revision
   `e4d42e112cbb03b7e9f9424ab62931f953ef22d8`, into
   `.cache/save-tests/public/{red,yellow,gold,crystal}.sav`:
   `red_blue/pokemon_red.sav`, `yellow/pokemon_yellow.sav`,
   `gold_silver/pokemon_gold.sav`, `crystal/pokemon_crystal.sav`.
   Use `https://raw.githubusercontent.com/ncorgan/pksav-test-saves/<revision>/<path>`.
2. Create `.cache/save-tests/synthetic/`. With .NET 10, run:

   ```sh
   dotnet run --project scripts/save-fixtures/GenerateGb.csproj \
     -p:PKHeXCoreDll=/absolute/path/to/PKHeX.Core.dll \
     -- "$PWD/.cache/save-tests/synthetic"
   ```

   Use Core built from `02c9ec108fe3c96735f6c2397eaebc10e29a049f`, the
   reader 0.1.1 pin. The generator inserts Pikachu and Eevee, removes them from
   storage without changing dex history, and marks Bulbasaur seen-only. It also
   emits blank-dex variants. List terminators, Yellow's starter marker and
   checksums are initialized for serialized detection. These are structural
   parser fixtures, not proof of legitimate in-game zero-caught saves.
3. From the website root, run `python3 scripts/save-fixtures/serve_gb.py`.
   Open the printed loopback port in the browser automation surface. Run:

   ```js
   await (await import('/harness/inspect_gb.js')).run()
   ```

   This loads the installed reader's actual worker/WASM, checks unchanged input
   buffers, and saves the result locally. The test server's `/report` POST writes
   only the local JSON receipt; this is not the production upload flow. Close the
   owned browser tab and stop the server after the check.
4. Run `python3 scripts/save-fixtures/check_gb_flags.py .cache/save-tests`.
   It independently decodes raw bitfields, validates checksums and exact identities,
   compares caught/seen arrays, checks empty storage and verifies absent start dates.

See `docs/game-boy-save-validation.md` for the recorded result and remaining work.
