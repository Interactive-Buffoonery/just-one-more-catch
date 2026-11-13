# Adding a game

Read `.agents/skills/add-game/SKILL.md` first for data semantics and sourcing,
then use this checklist to take a pack through integration. Read `audit-access`
and `read-guide` for independent access verification and scanned guide evidence.

## Scope and sources

- Check existing branches, open PRs and active project threads before starting.
  Fetch upstream and confirm the base; continue existing work when applicable.
- Name the supported versions and pack ID. Paired versions can share a pack
  while keeping separate version IDs and encounter codes. Keep meaningfully
  different editions separate. Do not infer mechanics from a remake.
- Record each hand-written fact in `SOURCES.md`, including chapters, earliest
  reachable areas, HM badge rules, story events, gifts, trades, statics,
  starters, clocks, dex sizes, boxes and form availability. Include precise
  URLs and short quotes beside gates where supported.
- Inspect the game's own pret scripts for gifts, trades and event flags.
  Never build a decompilation. PokeDaisy can help locate scripts; its guide
  prose is not evidence. Use sourced maps or walkthroughs for physical access.
- Record unresolved facts in `OPEN_QUESTIONS.md`. A new pack has no old value
  to preserve: do not silently invent a gate or call that pack release-ready.
  Return the uncertain rows and the evidence needed to settle them.

## Integration checklist

1. Write `data/<pack>.json`: versions, Pokédex, generation, species bound,
   chapters, events, area and row gates, mappings, and any form catalogs.
   Sourced `row_needs` entries may also add `conditions` when the cached
   encounter omits a prerequisite (for example, a weekday or starter choice).
   These additions are scoped to the matching species, place, method and version.
   Existing packs are structural examples only. Inspect raw PokeAPI rows for
   each version; preserve odds, levels, time conditions and distinct areas.
2. Register the pack and versions in `client/packs.ts` and
   `shared/versions.ts`. Supply unique encounter codes, kit/HM rules, sourced
   metadata, lazy loading, artwork and colours. Replace the corresponding
   Coming Soon objects in `CONSOLES` with the supported version IDs.
3. Check `scripts/fetch_pokeapi.py` caches the needed Pokédex and species/form
   responses. Run it, then `python3 scripts/build_data.py <pack>`.
   Never edit generated encounter TypeScript by hand. Inspect generated
   evolution/pre-evolution text and types for generation mismatches; modern
   evolution-chain data does not by itself establish historical mechanics.
4. Register sprite paths in `scripts/fetch_sprites.py`; verify that the remote
   set actually supplies the requested regular, shiny and form images.
   Do not assume every generation has equivalent sprite assets. Document a
   sourced fallback if needed. Run `uv run scripts/fetch_sprites.py`, inspect
   the resulting assets, and include `client/data/sprite-fit.ts` changes.
   Keep unrelated regenerated assets out of the pack's commit.
5. Check cover paths, including any explicit `Version.cover` and the public
   game-page generator's short-code-based cover paths. Reuse existing sourced
   covers where appropriate. Image versions are generated from file contents;
   do not add manual cache-busting numbers.
6. Add the pack to `games` in `scripts/build_game_pages.ts`. Check any new
   encounter method in both that script and `METHOD` in `client/game.ts`.
   Update `public/sitemap.xml` and any explicit supported-game copy or links.
   Build output under `dist/` is generated and must stay uncommitted.
7. Add every version to `IMPORT_SPECIES_LIMITS` in `shared/save-import.ts`,
   matching the pack's sourced national species bound. This is required by
   its `Record<VersionId, number>` even when file import is not enabled.
   File import is a separate feature: follow `docs/save-import.md` before
   adding `VERSION_MAP` entries or changing reader-support copy. Detection
   alone is insufficient. Do not enable an unverified mapping, change the
   reader package, or claim save-file support merely because tracking works.
8. Audit access independently using `audit-access`. Check all areas and the
   species-specific gifts/statics/trades, including version differences.
   Attach citations and record disagreements and inaccessible sources.
   Data generation and type checking do not prove game accuracy. The
   [Game Boy access review](game-boy-access-audit.md) records the initial
   expansion's coverage, fixes, model limitations and manual checkpoints.

## Verification and completion

Run `pnpm check` and `pnpm build`. If shared import or backend behaviour
changes, also run `pnpm test:convex` and
`pnpm exec tsc --noEmit -p convex/tsconfig.json`. Read the generated Convex
instructions before touching backend code. Add focused regression checks when
fixing generator or rule behaviour, rather than tests that repeat the new data.
Check the full diff for unintended changes to existing packs.

Record browser QA separately from automated checks. For each version, verify:

- The picker enables the correct game with its cover and confirmation.
- A guest can create, reload and reopen a playthrough, choose a starter,
  mark a catch, and retain it without sign-in.
- Chapter, badge, HM and story-event changes expose the sourced encounters;
  test an early blocker and a later gift/static or postgame encounter.
- Version-exclusive encounters stay with the right version; methods, clock
  conditions, sprites and dex/box limits match the pack.
- The generated public page has the correct title, canonical URL, covers,
  chapter content and working links.

Use the existing layout; this work does not call for a redesign. Report any
browser, account-sync, save-file or game-mechanics checks that were not run.
Return pack/version IDs, commit SHA, changed files, check results, citations,
remaining questions and the manual checklist. Builds are not deployments.
Deployments remain manual and need their own authorization and receipts.

## Parallel implementation

Give each implementation agent an isolated worktree and explicit pack ownership.
They are not alone in the repository: preserve concurrent work and do not reset
or revert others' changes. Each may make the minimal shared-registry edits
needed to validate its own pack locally; the coordinator combines those edits
and reruns validation after integration. Shared scripts and registries must
retain every pack's entries. Never copy one worker's entire registry over the
combined result.

For the initial Game Boy / Game Boy Color expansion, use `rb` for Red/Blue,
`yellow` for Yellow, and `gs` for Gold/Silver. Crystal already exists. These
names describe work ownership, not permission to copy mechanics between games.
Agents return local commits without pushing, opening PRs, merging or deploying.
The coordinator owns integration, independent access audits and session rollups.
Do not spawn additional agents from an implementation child unless its task
explicitly authorizes them.
